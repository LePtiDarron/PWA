<template>
  <div v-if="loading" class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <div v-else-if="error" class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="alert alert-danger" role="alert">
      The link is invalid or the conversation does not exist.
    </div>
  </div>

  <div v-else class="d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="alert alert-success" role="alert">
      Invitation accepted! Redirecting to the conversation...
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  data() {
    return {
      loading: true,
      error: false,
    };
  },
  created() {
    const conversationId = this.$route.params.id;
    this.checkInvitation(conversationId);
  },
  methods: {
    async checkInvitation(conversationId) {
      try {
        const response = await api.get(`/conversations/invite/${conversationId}`);

        if (response.status === 200) {
          this.$router.push(`/chat/${conversationId}`);
        } else {
          this.error = true;
        }
      } catch (err) {
        console.error('Error during invitation check:', err);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
