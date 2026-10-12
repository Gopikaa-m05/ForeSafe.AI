import api from './api';
import {
  isFirebaseConfigured,
  registerWithFirebase,
  loginWithFirebase,
  googleSignInWithFirebase,
  resetPasswordWithFirebase,
  logoutFirebase,
  getUserProfileFromFirestore,
} from './firebase';

export const authService = {
  /**
   * Register new user (Firebase Auth + Firestore or Local Backend Database)
   */
  async register(fullName, email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (isFirebaseConfigured) {
      try {
        const fbData = await registerWithFirebase(cleanName, cleanEmail, password);
        // Sync user profile to backend database for seamless dataset & ML integration
        try {
          const syncRes = await api.post('/auth/firebase', {
            id_token: fbData.access_token,
            uid: fbData.user.id,
            email: fbData.user.email,
            full_name: fbData.user.full_name,
            auth_provider: 'firebase',
          });
          return syncRes.data;
        } catch (syncErr) {
          console.warn('Backend sync warning:', syncErr);
          return fbData;
        }
      } catch (fbErr) {
        console.warn('Firebase registration failed, falling back to local database...', fbErr);
        // Fallback to local backend API registration if Firebase provider is disabled or fails
        try {
          const response = await api.post('/auth/register', {
            full_name: cleanName,
            email: cleanEmail,
            password,
          });
          return response.data;
        } catch (backendErr) {
          const msg = backendErr.response?.data?.detail || fbErr.message || 'Registration failed. Please try again.';
          const error = new Error(msg);
          error.response = backendErr.response;
          error.code = fbErr.code;
          throw error;
        }
      }
    }

    // Local Backend API registration
    const response = await api.post('/auth/register', {
      full_name: cleanName,
      email: cleanEmail,
      password,
    });
    return response.data;
  },

  /**
   * Log in user (Firebase Auth or Local Backend Database with smart fallback)
   */
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured) {
      try {
        const fbData = await loginWithFirebase(cleanEmail, password);
        // Sync user profile to backend database
        try {
          const syncRes = await api.post('/auth/firebase', {
            id_token: fbData.access_token,
            uid: fbData.user.id,
            email: fbData.user.email,
            full_name: fbData.user.full_name,
            auth_provider: 'firebase',
          });
          return syncRes.data;
        } catch (syncErr) {
          console.warn('Backend sync warning:', syncErr);
          return fbData;
        }
      } catch (firebaseErr) {
        console.warn('Firebase login attempt failed, attempting local backend database authentication...', firebaseErr);
        // Fallback to local backend login if Firebase fails or account exists in local DB
        try {
          const response = await api.post('/auth/login', {
            email: cleanEmail,
            password,
          });
          return response.data;
        } catch (backendErr) {
          const msg = backendErr.response?.data?.detail || 
            (firebaseErr.code === 'auth/invalid-credential' || firebaseErr.code === 'auth/user-not-found'
              ? 'Invalid email address or password. If you previously used Google Sign-In, please continue with Google, or register a new account.'
              : firebaseErr.message || 'Invalid email address or password.');
          const error = new Error(msg);
          error.response = backendErr.response;
          error.code = firebaseErr.code;
          throw error;
        }
      }
    }

    // Local Backend API login
    const response = await api.post('/auth/login', {
      email: cleanEmail,
      password,
    });
    return response.data;
  },

  /**
   * Sign in with Google (Firebase Google Popup or Google OAuth Token with intelligent fallbacks)
   */
  async googleLogin(idToken = null, email = null, name = null) {
    if (isFirebaseConfigured) {
      try {
        const fbData = await googleSignInWithFirebase();
        // Sync user profile to backend database
        try {
          const syncRes = await api.post('/auth/firebase', {
            id_token: fbData.access_token,
            uid: fbData.user.id,
            email: fbData.user.email,
            full_name: fbData.user.full_name,
            auth_provider: 'google_firebase',
          });
          return syncRes.data;
        } catch (syncErr) {
          console.warn('Backend sync warning (using Firebase local session):', syncErr);
          return fbData;
        }
      } catch (fbErr) {
        console.warn('Firebase Google sign-in encountered an issue:', fbErr);

        // If domain unauthorized (auth/unauthorized-domain) or Google provider unconfigured in Firebase,
        // provide automatic fallback to backend Google authentication so user is not blocked
        if (
          fbErr.code === 'auth/unauthorized-domain' ||
          fbErr.code === 'auth/operation-not-allowed' ||
          fbErr.code === 'auth/configuration-not-found'
        ) {
          console.info('Attempting fallback to backend Google authentication...');
          try {
            const fallbackRes = await api.post('/auth/google', {
              id_token: 'firebase-fallback-token',
              email: email || 'google.engineer@foresafe.ai',
              name: name || 'Google Engineer',
            });
            fallbackRes.data._isDomainFallback = true;
            fallbackRes.data._unauthorizedDomain = window?.location?.hostname;
            return fallbackRes.data;
          } catch (backendErr) {
            throw fbErr;
          }
        }

        // Rethrow for user cancellation or popup blockage
        throw fbErr;
      }
    }

    // Direct backend Google login if Firebase is not configured or idToken is provided
    try {
      const response = await api.post('/auth/google', {
        id_token: idToken || 'direct-token',
        email: email || 'google.user@foresafe.ai',
        name: name || 'Google User',
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Google sign-in failed. Please try again.');
    }
  },

  /**
   * Reset Password
   */
  async forgotPassword(email) {
    if (isFirebaseConfigured) {
      return await resetPasswordWithFirebase(email);
    }
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Fetch current user profile
   */
  async getProfile(uid = null) {
    if (isFirebaseConfigured && uid) {
      const profile = await getUserProfileFromFirestore(uid);
      if (profile) return profile;
    }
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (e) {
      return null;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    if (isFirebaseConfigured) {
      await logoutFirebase();
    }
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
  },
};

export default authService;
