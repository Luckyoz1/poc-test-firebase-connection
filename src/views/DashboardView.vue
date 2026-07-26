<!-- src/views/DashboardView.vue -->
<template>
  <div class="dashboard-page">
    <nav class="navbar">
      <h2>Test POC Firebase Auth</h2>
      <button @click="handleLogout" class="btn-logout">Se déconnecter</button>
    </nav>

    <main class="dashboard-content">
      <div class="welcome-card">
        <h1>Bienvenue sur le site !</h1>
        <p>Vous êtes connecté avec l'adresse : <strong>{{ userEmail }}</strong></p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const router = useRouter();
const userEmail = ref('');

onMounted(() => {
  if (auth.currentUser) {
    userEmail.value = auth.currentUser.email;
  }
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error("Erreur de déconnexion", error);
  }
};
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background-color: #f0f4f8;
}

.navbar {
  background: #ffffff;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.navbar h2 {
  margin: 0;
  color: #F57C00;
}

.btn-logout {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.dashboard-content {
  padding: 3rem;
  display: flex;
  justify-content: center;
}

.welcome-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  text-align: center;
}
</style>