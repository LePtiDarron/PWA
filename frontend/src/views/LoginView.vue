<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="card" style="width: 20rem;">
      <div class="card-body">
        <h2 class="text-center mb-4">Login</h2>
        <form @submit.prevent="login">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              id="email"
              placeholder="Email"
              required
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              id="password"
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>
        <div class="text-center mt-3">
          <p>Don't have an account? <router-link to="/register">Register</router-link></p>
        </div>
        <div v-if="error" class="alert alert-danger mt-2 text-center" role="alert">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

async function login() {
  try {
    const res = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('userId', res.data.id);
    localStorage.setItem('email', res.data.email);
    localStorage.setItem('username', res.data.username);
    localStorage.setItem('token', res.data.token);
    router.push('/chat');
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed.';
    setTimeout(() => error.value = '', 5000);
  }
}
</script>
