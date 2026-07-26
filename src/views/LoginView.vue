<!-- src/views/LoginView.vue -->
<template>
  <div class="page-container">
    <div class="split-layout">
      <!-- Section de bienvenue (Gauche) -->
      <header class="home-welcome">
        <h1>Plateforme Firebase</h1>
        <p>Un moyen simple et sécurisé de commencer votre projet.</p>
      </header>

      <!-- Zone de formulaire (Droite) -->
      <main class="form-section">
        <Auth /> <!-- Ton composant Auth.vue s'affiche ici -->
      </main>
    </div>
  </div>
</template>

<script setup>
import Auth from '../components/Auth.vue';
</script>

<style scoped>
.page-container {
  height: 100vh;
  width: 100vw;
  background: #2C384A;
  display: flex;
  justify-content: center;
  align-items: center;
}

.split-layout {
  display: flex;
  width: 90%;
  max-width: 1200px;
  height: 80vh;
  min-height: 600px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.home-welcome {
  flex: 1;
  padding: 4rem;
  background: linear-gradient(135deg, #FFCA28 0%, #F57C00 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.home-welcome h1 { font-size: 3rem; margin-bottom: 1rem; }
.form-section { flex: 1; display: flex; justify-content: center; align-items: center; padding: 2rem; background: #f8fafc; }
</style>