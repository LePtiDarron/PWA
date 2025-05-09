import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const QUEUE_KEY = 'offlineQueue';

function queueRequest(config) {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  queue.push({
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers,
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

async function replayQueuedRequests() {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  for (const config of queue) {
    try {
      await api(config);
    } catch (e) {
      console.error('Erreur en rejouant une requête offline :', e);
    }
  }
  localStorage.removeItem(QUEUE_KEY);
}

window.addEventListener('online', replayQueuedRequests);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!navigator.onLine && config.method === 'post') {
    queueRequest(config);
    console.warn('Requête POST mise en file d’attente (offline)');
    return Promise.reject({ message: 'Offline - Request queued', queued: true });
  }

  return config;
});

api.interceptors.response.use((response) => {
  if (response.config.method === 'get') {
    const cacheKey = `cache:${response.config.url}`;
    localStorage.setItem(cacheKey, JSON.stringify(response.data));
  }
  return response;
}, (error) => {
  const config = error.config;
  if (!navigator.onLine && config?.method === 'get') {
    const cacheKey = `cache:${config.url}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.warn('Réponse GET chargée depuis le cache');
      return Promise.resolve({ data: JSON.parse(cached), fromCache: true });
    }
  }
  return Promise.reject(error);
});

export default api;
