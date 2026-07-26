// src/router.js
import { createRouter, createWebHashHistory } from 'vue-router';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// On importe nos futures vraies pages
import LoginView from './views/LoginView.vue';
import DashboardView from './views/DashboardView.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView, meta: { requiresUnauth: true } },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHashHistory(), 
  routes,
});

// Promesse pour attendre que Firebase vérifie qui est connecté au chargement
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Garde de navigation : vérifie les droits avant chaque changement de page
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresUnauth = to.matched.some(record => record.meta.requiresUnauth);
  const user = await getCurrentUser();

  if (requiresAuth && !user) {
    next('/login'); // Redirige vers login si non connecté
  } else if (requiresUnauth && user) {
    next('/dashboard'); // Redirige vers dashboard si DÉJÀ connecté
  } else {
    next(); // Laisse passer normalement
  }
});

export default router;