import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ChatView from '../views/ChatView.vue';
import ChatListView from '../views/ChatListView.vue';
import CreateConversation from '../views/CreateConversation.vue';
import Invite from '../views/InviteView.vue';

const routes = [
  {
    path: '/',
    redirect: '/chat',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  {
    path: '/chat',
    name: 'Chats',
    component: ChatListView,
    meta: { requiresAuth: true },
  },
  {
    path: '/chat/:id',
    name: 'Chat',
    component: ChatView,
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/create-conversation',
    name: 'Create Conversation',
    meta: { requiresAuth: true },
    component: CreateConversation,
  },
  {
    path: '/invite/:id',
    name: 'Invite',
    meta: { requiresAuth: true },
    props: true,
    component: Invite,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
