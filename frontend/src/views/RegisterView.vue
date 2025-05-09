<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="card" style="width: 20rem;">
      <div class="card-body">
        <h2 class="text-center mb-4">Register</h2>
        <form @submit.prevent="register">
          <div class="mb-3">
            <label for="email" class="form-label">Username</label>
            <input
              v-model="username"
              type="username"
              class="form-control"
              id="username"
              placeholder="Username"
              required
            />
          </div>
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
          <button type="submit" class="btn btn-primary w-100">Register</button>
        </form>
        <div class="text-center mt-3">
          <p>Already have an account? <router-link to="/login">Login</router-link></p>
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

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

async function register() {
  try {
    const res = await api.post('/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('userId', res.data.id);
    localStorage.setItem('email', res.data.email);
    localStorage.setItem('username', res.data.username);
    localStorage.setItem('token', res.data.token);
    router.push('/chat');
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed.';
    setTimeout(() => error.value = '', 5000);
  }
}
</script>
