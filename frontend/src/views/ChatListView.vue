<template>
  <div class="container mt-5 text-center">
    <!-- Profile Section -->
    <div class="card mb-4 card-body text-center">
      <h2 class="mb-0">{{ user.username }}</h2>
      <div class="mt-0 mb-2">
        <span>{{ user.email }}</span>
      </div>

      <!-- Push Notifications Toggle -->
      <h5 class="mt-2 mb-0">Push Notifications</h5>
      <div class="mt-2 d-flex align-items-center justify-content-center gap-2">
        <i class="fa" :class="pushNotificationsEnabled ? 'fa-bell text-success' : 'fa-bell-slash text-danger'"></i>
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="pushSwitch"
            v-model="pushNotificationsEnabled"
            @change="togglePushNotifications"
            :class="pushNotificationsEnabled ? 'bg-success border-success' : 'bg-danger border-danger'"
          />
        </div>
      </div>

      <!-- Logout button -->
      <button @click="logout" class="btn btn-danger mt-2">
        <i class="fa fa-sign-out me-2"></i>
        <span>Logout</span>
      </button>
    </div>

    <!-- Conversations List -->
    <div class="card card-body">
      <h2 class="mb-4">My conversations</h2>
      <button
        v-for="conv in conversations" 
        :key="conv._id"
        @click="goToConversation(conv._id)"
        class="btn btn-outline-primary mb-2 w-100 text-center"
      >
        {{ conv.name || 'Conversation sans nom' }}
      </button>

      <!-- Create Conversation Button -->
      <div class="mt-2">
        <button @click="goToCreateConversation" class="btn btn-primary w-100">
          <i class="fa fa-plus"></i>
          <label class="ms-2">Create a conversation</label>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert alert-danger mt-2 text-center" role="alert">
      {{ error }}
    </div>

    <!-- Offline Indicator -->
    <div v-if="isOffline" class="alert alert-warning">
      You are currently offline. Some actions may be queued.
    </div>

    <!-- Toast Component -->
    <div v-if="showToast" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1050;">
      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
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
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../api';
import { useRoute, useRouter } from 'vue-router';
import { socket, setupSocketIdentification } from '../socket';

const VAPID_PUBLIC_KEY = 'BNXhe5ApvICwVmnrEY6n20lyYdpkZNOs5zIeNpQ6-YWBz8tuRT_T1nKXkooeT3CM0WHM3ZxKiY3VWOMrMEVHSSI';
const route = useRoute();
const router = useRouter();
const conversations = ref([]);
const error = ref('');
const user = ref({
  email: localStorage.getItem('email') || 'No email',
  username: localStorage.getItem('username') || 'No username',
});
const showToast = ref(false);
const toastMessage = ref('');
const pushNotificationsEnabled = ref(false);

const isOffline = ref(!navigator.onLine);

function displayToast(message) {
  toastMessage.value = message;
  showToast.value = true;

  setTimeout(() => {
    showToast.value = false;
  }, 5000);
}

const getCurrentUserId = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.id
  } catch (e) {
    console.error('Erreur de décodage du token:', e)
    return null
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function getNotificationStatus() {
  const currentUserId = getCurrentUserId();

  if (!currentUserId) {
    error.value = err || 'Could not get push notifications status';
    setTimeout(() => (error.value = ''), 5000);
    pushNotificationsEnabled.value = false;
    return;
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    const existingSubscription = await swRegistration.pushManager.getSubscription();

    if (existingSubscription) {
      pushNotificationsEnabled.value = true;
    } else {
      pushNotificationsEnabled.value = false;
    }
  } catch (err) {
    error.value = err || 'Could not get push notifications status';
    setTimeout(() => (error.value = ''), 5000);
    pushNotificationsEnabled.value = false;
  }
}

async function togglePushNotifications() {
  const currentUserId = getCurrentUserId();

  if (!currentUserId) {
    error.value = 'Could not update push notifications';
    setTimeout(() => (error.value = ''), 5000);
    pushNotificationsEnabled.value = false;
    return;
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    const existingSubscription = await swRegistration.pushManager.getSubscription();

    if (existingSubscription) {
      await existingSubscription.unsubscribe();
      await api.post(`/push/unsubscribe`, {userId: currentUserId});
      pushNotificationsEnabled.value = false;
    } else {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      const token = localStorage.getItem('token')
      await api.post('/push/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
        },
        userId: currentUserId
      });

      const result = await response.json();
      if (response.ok) {
        pushNotificationsEnabled.value = true;
      } else {
        error.value = 'Could not update push notifications';
        setTimeout(() => (error.value = ''), 5000);
        pushNotificationsEnabled.value = false;
      }
    }
  } catch (err) {
    console.error(err);
    error.value = err || 'Could not update push notifications';
    setTimeout(() => (error.value = ''), 5000);
    pushNotificationsEnabled.value = false;
  }
}

function goToConversation(conversationId) {
  router.push(`/chat/${conversationId}`);
}

function goToCreateConversation() {
  router.push('/create-conversation');
}

function logout() {
  localStorage.removeItem('userId');
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('username');
  router.push('/login');
}

async function fetchConversations() {
  try {
    const res = await api.get('/conversations');
    conversations.value = res.data;
    localStorage.setItem('conversations-cache', JSON.stringify(`${socket.username}-conversations-cache`));
  } catch (err) {
    if (err?.queued) {
      error.value = 'You are offline. The request has been queued and will be sent when you are back online.';
    } else {
      error.value = err.response?.data?.message || 'Failed to fetch conversations.';
    }
    setTimeout(() => error.value = '', 5000);
  }
}

// Handle online/offline status
window.addEventListener('offline', () => {
  isOffline.value = true;
  displayToast('You are now offline. Some actions may be queued.');
});

window.addEventListener('online', () => {
  isOffline.value = false;
  displayToast('You are back online.');
});

onMounted(() => {
  const cachedConversations = localStorage.getItem(`${socket.username}-conversations-cache`);
  if (cachedConversations) {
    try {
      conversations.value = JSON.parse(cachedConversations);
    } catch (e) {
      console.error('Erreur lors du parsing du cache des conversations', e);
    }
  }

  fetchConversations();
  setupSocketIdentification();
  getNotificationStatus();

  socket.on("user invited", ({ conversation }) => {
    conversations.value.push(conversation);
  });
  
  socket.on("kick user", ({ username, conversationId }) => {
    conversations.value = conversations.value.filter(c => c._id !== conversationId);
  });

  socket.on("chat message", async (msg) => {
    if (document.visibilityState !== "visible") {
      try {
        await api.post('/push/notify', {
          url: `/chat/${msg.conversationId}`,
          username: msg.username,
          body: msg.text,
        });
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to invite user.';
        setTimeout(() => error.value = '', 5000);
      }
    } else {
      displayToast(`${msg?.username} sent a message.`);
    }
  });
});

onUnmounted(() => {
  const to = router.currentRoute.value.fullPath;
  const from = route.fullPath;

  const quittingChat = from.startsWith('/chat') && !to.startsWith('/chat/') && !to.startsWith('/create-conversation');

  if (quittingChat) {
    socket.disconnect();
  } else {
    socket.off('user invited');
    socket.off('kick user');
    socket.off('chat message');
  }
});
</script>

<style scoped>
.toast-container {
  top: 20px;
  right: 20px;
  z-index: 1050;
}

.form-check-input {
  width: 3rem !important;
  height: 1.5rem !important;
}

.form-check-input:checked {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
}

.form-check-input:not(:checked) {
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
}
</style>
