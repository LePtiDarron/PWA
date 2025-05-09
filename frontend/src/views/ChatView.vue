<template>
  <div class="container d-flex flex-column vh-100">
    <div class="mt-4 mb-4 d-flex justify-content-between">
      <button @click="router.push('/chat')" class="btn btn-sm btn-secondary">
        <i class="fa fa-arrow-left me-2"></i>
        <span class="me-2">Back</span>
      </button>
      <h2>{{ conversation }}</h2>
      <button @click="leaveConversation" class="btn btn-sm btn-danger">
        <i class="fa fa-sign-out me-2"></i>
        <span>Quit conversation</span>
      </button>
    </div>

    <div class="accordion mb-4" id="usersAccordion">
      <div class="accordion-item">
        <h2 class="accordion-header" id="headingUsers">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseUsers">
            Show users
          </button>
        </h2>
        <div id="collapseUsers" class="accordion-collapse collapse" data-bs-parent="#usersAccordion">
          <div class="accordion-body">
            <div class="mb-3">
              <div v-for="(p, i) in participants" :key="i" class="d-flex align-items-center justify-content-between py-1 px-2">
                <div class="d-flex align-items-center">
                  <i class="fa fa-user me-2 text-muted"></i>
                  <span>{{ p.username || p.username }}</span>
                </div>
                <div class="d-flex align-items-center ms-auto">
                  <template v-if="isInCanInvite(p.username)">
                    <i class="fa fa-star text-warning me-2"></i>
                  </template>
                  <template v-else-if="isInCanInvite(socket.username)">
                    <button class="btn btn-sm btn-danger" @click="kickUser(p.username)">
                      <i class="fa fa-trash"></i>
                    </button>
                  </template>
                </div>
              </div>
            </div>

            <!-- Bloc de recherche et ajout d'utilisateur -->
            <div class="d-flex position-relative">
              <div class="flex-grow-1 position-relative">
                <input
                  v-model="inviteUsername"
                  @input="searchUsernames"
                  placeholder="Username"
                  class="form-control"
                  autocomplete="off"
                />
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
              <button
                type="button"
                @click="inviteUser"
                class="btn btn-secondary ms-2"
                :disabled="!inviteUsername || participants.map(p => p.username).includes(inviteUsername)"
              >
                <i class="fa fa-user-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card flex-grow-1 mb-3">
      <div class="card-body" ref="messageList">
        <ul class="list-group mb-3">
          <li v-for="(msg, index) in messages" :key="msg._id">
            <div :class="{'text-start': msg.username !== socket.username, 'text-end': msg.username === socket.username}">
              <p v-if="index === 0 || messages[index - 1].username !== msg.username">
                {{ msg.username === socket.username ? 'You' : msg.username }}
              </p>
              <div :class="{'message-bubble-left': msg.username !== socket.username, 'message-bubble-right': msg.username === socket.username}">
                <span>{{ msg.text }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="d-flex mb-4 mt-2">
      <input
        v-model="text"
        placeholder="Write a message..."
        class="form-control me-2"
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage" class="btn btn-primary">
        <i class="fa fa-paper-plane"></i>
      </button>
    </div>
    <div v-if="error" class="alert alert-danger mt-2 text-center" role="alert">
      {{ error }}
    </div>

    <!-- Offline Indicator -->
    <div v-if="isOffline" class="alert alert-warning">
      You are currently offline. Some actions may be queued.
    </div>

    <!-- Toast Component -->
    <div v-if="showToast" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1050;">
      <div class="toast show opacity-100" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-primary text-white">
          <strong class="me-auto">Notification</strong>
          <button type="button" class="btn-close btn-close-white" @click="showToast = false" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';
import { socket, setupSocketIdentification } from '../socket';

const router = useRouter();
const route = useRoute();
const conversationId = route.params.id;

const isOffline = ref(!navigator.onLine);

const conversation = ref('');
const messages = ref([]);
const participants = ref([]);
const canInvite = ref([]);
const text = ref('');
const inviteUsername = ref('');
const messageList = ref(null);
const error = ref('');
const showToast = ref(false);
const toastMessage = ref('');
const searchResults = ref([]);
const offlineMessages = ref([]);

function displayToast(message) {
  toastMessage.value = message;
  showToast.value = true;

  setTimeout(() => {
    showToast.value = false;
  }, 5000);
}

window.addEventListener('offline', () => {
  isOffline.value = true;
  displayToast('You are now offline. Some actions may be queued.');
});

window.addEventListener('online', async () => {
  isOffline.value = false;
  displayToast('You are back online.');

  while (offlineMessages.value.length > 0) {
    const messageToSend = offlineMessages.value.shift();
    try {
      const res = await api.post(`/messages`, {
        conversationId,
        text: messageToSend,
      });
      socket.emit('chat message', {
        ...res.data,
        conversationId,
      });
    } catch (err) {
      handleError(err);
    }
  }

  await fetchMessages();
});

async function fetchMessages() {
  try {
    const res = await api.get(`/messages/${conversationId}`);
    messages.value = res.data.messages;
    participants.value = res.data.participants;
    conversation.value = res.data.conversation;
    canInvite.value = res.data.canInvite;
    scrollToBottom();
    localStorage.setItem(`${socket.username}-messages-${conversationId}`, JSON.stringify({
      messages: messages.value,
      participants: participants.value,
      conversation: conversation.value,
      canInvite: canInvite.value,
    }));
  } catch (err) {
    if (!navigator.onLine) {
      error.value = 'No internet connection. Please try again later.';
    } else {
      error.value = err.response?.data?.message || 'Failed to fetch messages.';
    }
    setTimeout(() => (error.value = ''), 5000);
  }
}

async function leaveConversation() {
  try {
    await api.post(`/conversations/${conversationId}/leave`);
    socket.emit("leave conversation", { username: socket.username, conversationId });
    router.push('/chat');
  } catch (err) {
    if (!navigator.onLine) {
      error.value = 'No internet connection. Please try again later.';
    } else {
      error.value = err.response?.data?.message || 'Could not leave the conversation.';
    }
    setTimeout(() => (error.value = ''), 5000);
  }
}

async function kickUser(usernameToKick) {
  try {
    const user = participants.value.find(p => p.username === usernameToKick);
    if (!user) return;
    await api.post(`/conversations/${conversationId}/kick`, {
      username: user.username,
    });
    socket.emit("kick user", { username: usernameToKick, conversationId });
    await fetchMessages();
  } catch (err) {
    if (!navigator.onLine) {
      error.value = 'No internet connection. Please try again later.';
    } else {
      error.value = err.response?.data?.message || "Failed to kick the user.";
    }
    setTimeout(() => (error.value = ''), 5000);
  }
}

function isInCanInvite(username) {
  return canInvite.value.some(u => u.username === username);
}

async function sendMessage() {
  if (!text.value.trim()) return;

  if (navigator.onLine) {
    try {
      const res = await api.post(`/messages`, {
        conversationId,
        text: text.value.trim(),
      });
      socket.emit('chat message', {
        ...res.data,
        conversationId,
      });
      text.value = '';
    } catch (err) {
      handleError(err);
    }
  } else {
    offlineMessages.value.push(text.value.trim());
    text.value = '';
  }
}

async function inviteUser() {
  try {
    await api.post(`/conversations/${conversationId}/invite`, {
      username: inviteUsername.value,
    });

    if (socket.connected) {
      socket.emit('user invited', {
        conversationId,
        participantUsernames: [inviteUsername.value],
      });
    } else {
      console.error('Socket is not connected');
    }

    inviteUsername.value = '';
    await fetchMessages();
  } catch (err) {
    if (!navigator.onLine) {
      error.value = 'No internet connection. Please try again later.';
    } else {
      error.value = err.response?.data?.message || 'Failed to invite user.';
    }
    setTimeout(() => (error.value = ''), 5000);
  }
}

async function searchUsernames() {
  if (inviteUsername.value.length >= 1) {
    try {
      const response = await api.get('/users/search', {
        params: { query: inviteUsername.value }
      });
      searchResults.value = response.data.map(user => user.username);
    } catch (err) {
      console.error('Error during search:', err);
      searchResults.value = [];
    }
  } else {
    searchResults.value = [];
  }
}

function addUsernameFromSearch(username) {
  inviteUsername.value = username;
  searchResults.value = [];
}

function scrollToBottom() {
  nextTick(() => {
    const list = messageList.value;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  });
}

onMounted(() => {
  const cachedData = localStorage.getItem(`${socket.username}-messages-${conversationId}`);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      messages.value = parsed.messages || [];
      participants.value = parsed.participants || [];
      conversation.value = parsed.conversation || '';
      canInvite.value = parsed.canInvite || [];
      scrollToBottom();
    } catch (e) {
      console.error('Failed to parse cached messages:', e);
    }
  }

  fetchMessages();

  setupSocketIdentification();

  socket.emit('join conversation', conversationId);

  socket.on("chat message", async (msg) => {
    if (document.visibilityState !== "visible") {
      try {
        await api.post('/push/notify', {
          url: `/chat/${msg.conversationId}`,
          username: msg.username,
          body: msg.text,
        });
      } catch (err) {
        console.log(err);
      }
    }
    if (msg.conversationId === conversationId) {
      messages.value.push(msg);

      localStorage.setItem(`${socket.username}-messages-${conversationId}`, JSON.stringify({
        messages: messages.value,
        participants: participants.value,
        conversation: conversation.value,
        canInvite: canInvite.value,
      }));

      scrollToBottom();
    }
  });

  socket.on("kick user", ({ username, conversationId }) => {
    if (username === socket.username) {
      socket.emit("disconnect conversation", conversationId);
      router.push('/chat');
    } else {
      fetchMessages();
    }
  });

  socket.on("leave conversation", ({ username }) => {
    if (username === socket.username) {
      router.push('/chat');
    } else {
      fetchMessages();
    }
  });

  socket.on("user invited", ({ usernames, conversationId }) => {
    if (usernames && usernames.length > 0) {
      participants.value = [...participants.value, ...usernames];
    }
    if (usernames.includes(socket.username)) {
      router.push(`/chat/${conversationId}`);
    }
  });
});

onUnmounted(() => {
  socket.off('chat message');
  socket.off('kick user');
  socket.off('leave conversation');
  socket.off('user invited');
});
</script>

<style scoped>
ul.list-group {
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
}

.message-bubble-right {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border-radius: 15px;
  margin-bottom: 10px;
  max-width: 60%;
  margin-left: auto;
  display: inline-block;
  text-align: left;
}

.message-bubble-left {
  background-color: #f0f0f0;
  color: black;
  padding: 10px;
  border-radius: 15px;
  margin-bottom: 10px;
  max-width: 60%;
  display: inline-block;
  text-align: left;
}

.text-end {
  margin-right: 15px;
  text-align: right;
}

.text-start {
  margin-right: 15px;
  text-align: left;
}

.text-end p {
  margin-bottom: 4px;
  margin-right: 4px;
}

.text-start p {
  margin-bottom: 4px;
  margin-left: 4px;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.card {
  flex-grow: 1;
  overflow-y: auto;
}

.card-body {
  overflow-y: auto;
  max-height: 100%;
}

.d-flex {
  display: flex;
}

.mt-2 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.toast-container {
  top: 20px;
  right: 20px;
  z-index: 1050;
}
</style>
