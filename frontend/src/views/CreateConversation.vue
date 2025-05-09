<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-center">Create a conversation</h2>

    <form @submit.prevent="createConversation" class="bg-light p-4 rounded shadow-sm">
      <div class="mb-3">
        <label for="name" class="form-label">Conversation name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          class="form-control"
          placeholder="Conversation name"
          required
        />
      </div>

      <div class="mb-3">
        <label for="username" class="form-label">Add participants</label>
        <div class="d-flex position-relative">
          <!-- Bloc input + liste suggestions -->
          <div class="flex-grow-1 position-relative">
            <input
              id="username"
              v-model="newUsername"
              type="username"
              class="form-control"
              placeholder="Username"
              @input="searchUsernames"
              autocomplete="off"
            />
            <!-- Résultats recherche -->
            <ul
              v-if="searchResults.length > 0"
              class="list-group position-absolute shadow z-3 mt-1 w-100"
              style="top: 100%; left: 0;"
            >
              <li
                v-for="(username, index) in searchResults"
                :key="index"
                @click="addUsernameFromSearch(username)"
                class="list-group-item list-group-item-action"
                style="cursor: pointer;"
              >
                {{ username }}
              </li>
            </ul>
          </div>

          <!-- Bouton ajouter -->
          <button
            type="button"
            @click="addUsername"
            class="btn btn-secondary ms-2"
            :disabled="!newUsername || usernamesList.includes(newUsername)"
          >
            <i class="fa fa-user-plus"></i>
          </button>
        </div>
      </div>

      <small class="text-muted">Participants :</small>
      <ul class="list-group mb-3">
        <li
          v-for="(username, index) in usernamesList"
          :key="index"
          class="d-flex justify-content-between align-items-center list-group-item"
        >
          {{ username }}
          <button
            type="button"
            @click="removeUsername(index)"
            class="btn btn-sm btn-danger"
          >
            <i class="fa fa-trash"></i>
          </button>
        </li>
      </ul>

      <br>
      <div class="d-flex justify-content-between">
        <button
          type="button"
          class="btn btn-secondary"
          @click="router.push('/chat')"
        >
          Back
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!name"
        >
          Create
        </button>
      </div>

      <div v-if="error" class="alert alert-danger mt-2 text-center" role="alert">
        {{ error }}
      </div>
    </form>

    <!-- Offline Indicator -->
    <div v-if="isOffline" class="alert alert-warning">
      You are currently offline. Some actions may be queued.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { socket, setupSocketIdentification } from '../socket';

const name = ref('');
const newUsername = ref('');
const error = ref('');
const usernamesList = ref([]);
const searchResults = ref([]);
const router = useRouter();

const isOffline = ref(!navigator.onLine);
const CACHE_KEY = 'createConversationCache';

async function searchUsernames() {
  if (newUsername.value.length >= 1) {
    try {
      const response = await api.get('/users/search', {
        params: { query: newUsername.value }
      });
      searchResults.value = response.data.map(user => user.username);
      localStorage.setItem(CACHE_KEY, JSON.stringify(searchResults.value));
    } catch (err) {
      console.error('Error during search:', err);
      const cachedResults = localStorage.getItem(CACHE_KEY);
      if (cachedResults) {
        searchResults.value = JSON.parse(cachedResults);
      } else {
        searchResults.value = [];
      }
    }
  } else {
    searchResults.value = [];
  }
}

window.addEventListener('offline', () => {
  isOffline.value = true;
  displayToast('You are now offline. Some actions may be queued.');
});

window.addEventListener('online', async () => {
  isOffline.value = false;
  const queuedConversation = localStorage.getItem('queuedConversation');
  if (queuedConversation) {
    try {
      const conversationData = JSON.parse(queuedConversation);
      const response = await api.post('/conversations', conversationData);

      const conversationId = response.data._id;

      if (socket.connected) {
        socket.emit('user invited', {
          conversationId,
          participantUsername: conversationData.participantUsername,
        });
      } else {
        console.error('Socket is not connected');
      }

      router.push('/chat');
      localStorage.removeItem('queuedConversation');
    } catch (err) {
      console.error('Failed to process queued conversation:', err);
    }
  }
});

function addUsername() {
  if (newUsername.value && !usernamesList.value.includes(newUsername.value)) {
    usernamesList.value.push(newUsername.value);
    newUsername.value = '';
    searchResults.value = [];
  }
}

function addUsernameFromSearch(username) {
  if (!usernamesList.value.includes(username)) {
    usernamesList.value.push(username);
    newUsername.value = '';
    searchResults.value = [];
  }
}

function removeUsername(index) {
  usernamesList.value.splice(index, 1);
}

async function createConversation() {
  if (isOffline.value) {
    const conversationData = {
      name: name.value,
      participantUsername: usernamesList.value,
    };
    localStorage.setItem('queuedConversation', JSON.stringify(conversationData));
    error.value = 'You are offline. Your conversation creation will be queued.';
    setTimeout(() => error.value = '', 5000);
    return;
  }

  try {
    const response = await api.post('/conversations', {
      name: name.value,
      participantUsername: usernamesList.value,
    });

    const conversationId = response.data._id;

    if (socket.connected) {
      socket.emit('user invited', {
        conversationId,
        participantUsername: usernamesList.value,
      });
    } else {
      console.error('Socket is not connected');
    }

    router.push('/chat');
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create conversation.';
    setTimeout(() => error.value = '', 5000);
  }
}

onMounted(() => {
  setupSocketIdentification();
});
</script>
