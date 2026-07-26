<!-- src/components/Auth.vue -->
<template>
  <div class="auth-card">
    <div class="auth-header">
      <h2>{{ isLogin ? 'Connexion' : 'Créer un compte' }}</h2>
      <p>{{ isLogin ? 'Ravi de vous revoir !' : 'Rejoignez-nous en quelques clics.' }}</p>
    </div>

    <!-- Formulaire Email / Mot de passe -->
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="input-group">
        <span class="icon">✉️</span>
        <input v-model="email" type="email" placeholder="Adresse email" required :disabled="isLocked" />
      </div>
      
      <div class="input-group">
        <span class="icon">🔒</span>
        <input v-model="password" type="password" placeholder="Mot de passe" required :disabled="isLocked" />
      </div>

      <!-- Règles de mot de passe (visible uniquement à l'inscription) -->
      <div v-if="!isLogin" class="password-rules">
        <small :class="{ 'valid': passwordCriteria.length }">12 caractères minimum</small>
        <small :class="{ 'valid': passwordCriteria.upperLower }">Majuscule et minuscule</small>
        <small :class="{ 'valid': passwordCriteria.number }">Au moins 1 chiffre</small>
        <small :class="{ 'valid': passwordCriteria.special }">Au moins 1 caractère spécial</small>
      </div>

      <!-- CAPTCHA Mathématique (visible uniquement à l'inscription) -->
      <div v-if="!isLogin" class="input-group captcha-group">
        <span class="captcha-question">{{ captchaQuestion }}</span>
        <input v-model="userCaptchaInput" type="number" placeholder="Résultat" required :disabled="isLocked" />
      </div>

      <!-- Bouton de validation avec gestion du blocage -->
      <button type="submit" class="btn-primary" :disabled="isLocked">
        <span v-if="isLocked">Bloqué ({{ lockTimer }}s)</span>
        <span v-else>{{ isLogin ? 'Se connecter' : "S'inscrire" }}</span>
      </button>
    </form>

    <!-- Message d'erreur -->
    <transition name="fade">
      <div v-if="errorMessage" class="error-msg">
        ⚠️ {{ errorMessage }}
      </div>
    </transition>

    <div class="divider">
      <span>ou continuer avec</span>
    </div>

    <!-- Bouton Google -->
    <button @click="signInWithGoogle" class="btn-google" :disabled="isLocked">
      <svg viewBox="0 0 24 24" class="google-icon">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Google
    </button>

    <!-- Bascule Inscription / Connexion -->
    <div class="auth-switch">
      <p>
        {{ isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?' }}
        <span @click="toggleAuthMode" class="switch-link">
          {{ isLogin ? "S'inscrire" : 'Se connecter' }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // <-- Import du routeur
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

const router = useRouter(); // <-- Initialisation du routeur

const email = ref('');
const password = ref('');
const isLogin = ref(true);
const errorMessage = ref('');

const failedAttempts = ref(0);
const isLocked = ref(false);
const lockTimer = ref(0);

const captchaQuestion = ref('');
const captchaExpectedResult = ref(0);
const userCaptchaInput = ref('');

const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  captchaExpectedResult.value = num1 + num2;
  captchaQuestion.value = `Combien font ${num1} + ${num2} ?`;
  userCaptchaInput.value = '';
};

onMounted(() => {
  generateCaptcha();
});

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
  if (!isLogin.value) generateCaptcha();
};

const passwordCriteria = computed(() => {
  const pwd = password.value;
  return {
    length: pwd.length >= 12,
    upperLower: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
  };
});

const isPasswordValid = computed(() => {
  return passwordCriteria.value.length && 
         passwordCriteria.value.upperLower && 
         passwordCriteria.value.number && 
         passwordCriteria.value.special;
});

const initiateLockout = () => {
  isLocked.value = true;
  lockTimer.value = 30;
  
  const timerInterval = setInterval(() => {
    lockTimer.value--;
    if (lockTimer.value <= 0) {
      clearInterval(timerInterval);
      isLocked.value = false;
      failedAttempts.value = 0;
    }
  }, 1000);
};

const handleFailure = (errorMsg) => {
  errorMessage.value = errorMsg;
  failedAttempts.value++;
  
  if (failedAttempts.value >= 3) {
    initiateLockout();
    errorMessage.value = "Trop de tentatives échouées. Compte temporairement bloqué par sécurité.";
  }
};

const handleSubmit = async () => {
  if (isLocked.value) return;
  errorMessage.value = '';

  if (!isLogin.value) {
    if (!isPasswordValid.value) {
      errorMessage.value = "Le mot de passe ne respecte pas les critères de sécurité CNIL.";
      return;
    }
    
    if (parseInt(userCaptchaInput.value) !== captchaExpectedResult.value) {
      errorMessage.value = "La réponse au Captcha est incorrecte.";
      generateCaptcha();
      return;
    }
  }

  try {
    if (isLogin.value) {
      await signInWithEmailAndPassword(auth, email.value, password.value);
    } else {
      await createUserWithEmailAndPassword(auth, email.value, password.value);
    }
    failedAttempts.value = 0;
    // <-- Redirection vers le dashboard après succès
    router.push('/dashboard'); 
  } catch (error) {
    let msg = "Identifiants incorrects ou erreur réseau.";
    if (error.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
    if (error.code === 'auth/user-not-found') msg = "Aucun compte trouvé avec cet email.";
    if (error.code === 'auth/wrong-password') msg = "Mot de passe incorrect.";
    
    handleFailure(msg);
  }
};

const signInWithGoogle = async () => {
  if (isLocked.value) return;
  errorMessage.value = '';
  
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    failedAttempts.value = 0;
    // <-- Redirection vers le dashboard après succès
    router.push('/dashboard'); 
  } catch (error) {
    handleFailure("La connexion avec Google a échoué.");
  }
};
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  font-size: 1.8rem;
  color: #1a202c; /* Gris très foncé pour le contraste */
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #718096;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-group .icon {
  position: absolute;
  left: 1rem;
  font-size: 1.2rem;
  color: #a0aec0;
}

.input-group input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

/* Modification : Focus avec la couleur Orange/Amber de Firebase */
.input-group input:focus:not(:disabled) {
  border-color: #FFA000;
  box-shadow: 0 0 0 3px rgba(255, 160, 0, 0.15);
}

.input-group input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.password-rules {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: -0.5rem;
  padding-left: 0.5rem;
}

.password-rules small {
  font-size: 0.75rem;
  color: #e53e3e;
  transition: color 0.3s ease;
}

.password-rules small.valid {
  color: #38a169;
}

.password-rules small::before {
  content: '❌ ';
}

.password-rules small.valid::before {
  content: '✅ ';
}

.captcha-group {
  display: flex;
  gap: 1rem;
}

.captcha-question {
  background: #edf2f7;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
  user-select: none;
}

.captcha-group input {
  padding-left: 1rem;
}

/* Modification : Bouton principal avec le dégradé Firebase (Jaune/Orange) */
.btn-primary {
  background: linear-gradient(135deg, #FFCB2B 0%, #F5820D 100%);
  color: #ffffff; /* Texte blanc sur fond orange */
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.3s;
  margin-top: 0.5rem;
}

.btn-primary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 130, 13, 0.4);
}

.btn-primary:disabled {
  background: #a0aec0;
  color: #ffffff;
  text-shadow: none;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #a0aec0;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 10px;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 0.8rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: background 0.2s, opacity 0.3s;
}

.btn-google:not(:disabled):hover {
  background: #f7fafc;
}

.btn-google:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.error-msg {
  background: #fff5f5;
  color: #c53030;
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #fed7d7;
}

.auth-switch {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: #718096;
}

/* Modification : Liens en Bleu Firebase */
.switch-link {
  color: #039BE5; /* Bleu clair Firebase */
  font-weight: 600;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: color 0.2s;
}

.switch-link:hover {
  color: #0277BD; /* Bleu foncé Firebase au survol */
  text-decoration: underline;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>