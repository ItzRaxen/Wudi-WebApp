import { onAuthStateChanged as firebaseOnAuthStateChanged, signInWithCustomToken, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { apiClient, getDeviceId, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from './apiClient.js';
import { auth, isFirebaseConfigured } from './firebase.js';

function normalizeUser(data) {
  const user = data?.user ?? data;
  if (!user) return null;
  return {
    id: user.id ?? null,
    name: user.name ?? '',
    email: user.email ?? '',
    avatarUrl: user.avatar_url ?? user.avatarUrl ?? user.avatar ?? null,
    todayTarget: user.today_target ?? user.todayTarget ?? 0,
    emailVerifiedAt: user.email_verified_at ?? user.emailVerifiedAt ?? null,
    googleId: user.google_id ?? user.googleId ?? null,
  };
}

async function signInFirebase(customToken) {
  if (!isFirebaseConfigured || !auth || !customToken) return null;
  try {
    return await signInWithCustomToken(auth, customToken);
  } catch {
    return null;
  }
}

async function persistAuthResponse(data) {
  const token = data?.token;
  const user = normalizeUser(data?.user ?? data);
  if (token) setStoredToken(token);
  if (user) setStoredUser(user);
  await signInFirebase(data?.firebase_custom_token);
  return { user, token };
}

export const authService = {
  async register({ name, email, password, passwordConfirmation }) {
    return apiClient.post(
      'register',
      {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        device_id: getDeviceId(),
      },
      { auth: false },
    );
  },

  async verifyEmail({ email, code }) {
    const data = await apiClient.post('auth/verify-email', { email, otp: code, device_id: getDeviceId() }, { auth: false });
    return persistAuthResponse(data);
  },

  async login({ email, password }) {
    const data = await apiClient.post('login', { email, password, device_id: getDeviceId() }, { auth: false });
    return persistAuthResponse(data);
  },

  async loginWithGoogle() {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured');
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    const payload = {
      google_id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || 'Google User',
      avatar_url: firebaseUser.photoURL || null,
      device_id: getDeviceId(),
    };
    
    // Send the user details to the Laravel backend for authentication
    const data = await apiClient.post('auth/google', payload, { auth: false });
    return persistAuthResponse(data);
  },

  async logout() {
    apiClient.clearSession();
    if (auth) {
      await signOut(auth).catch(() => {});
    }
  },

  async getCurrentUser({ forceRefresh = false } = {}) {
    const cached = getStoredUser();
    const token = getStoredToken();
    if (!forceRefresh && cached && token) return cached;
    if (!token) return null;
    const data = await apiClient.get('user');
    const user = normalizeUser(data);
    if (user) {
      setStoredUser(user);
      await signInFirebase(data?.firebase_custom_token);
    }
    return user;
  },

  onAuthStateChanged(callback) {
    const unsubscribeFirebase =
      auth && isFirebaseConfigured
        ? firebaseOnAuthStateChanged(auth, () => callback(getStoredUser()))
        : null;
    callback(getStoredUser());
    return () => unsubscribeFirebase?.();
  },
};
