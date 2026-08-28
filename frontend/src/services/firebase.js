import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured with real credentials
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your-firebase-api-key' &&
  firebaseConfig.projectId
);

// Initialize Firebase App instance
let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

/**
 * Register a new user with Firebase Auth and save user profile to Cloud Firestore
 */
export const registerWithFirebase = async (fullName, email, password) => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to frontend/.env.');
  }

  // 1. Create user in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const firebaseUser = userCredential.user;

  // 2. Update display name in Firebase Auth
  await updateProfile(firebaseUser, { displayName: fullName.trim() });

  // 3. Store user record in Cloud Firestore database ("users" collection)
  const userData = {
    uid: firebaseUser.uid,
    full_name: fullName.trim(),
    email: firebaseUser.email.toLowerCase(),
    auth_provider: 'firebase_email',
    is_verified: firebaseUser.emailVerified,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    role: 'engineer',
  };

  const userDocRef = doc(db, 'users', firebaseUser.uid);
  await setDoc(userDocRef, userData);

  // 4. Retrieve ID token for API authentication
  const idToken = await firebaseUser.getIdToken();

  return {
    access_token: idToken,
    refresh_token: firebaseUser.refreshToken || idToken,
    user: {
      id: firebaseUser.uid,
      full_name: fullName.trim(),
      email: firebaseUser.email,
      auth_provider: 'firebase',
      is_verified: firebaseUser.emailVerified,
      created_at: userData.created_at,
    },
  };
};

/**
 * Log in an existing user with Firebase Auth and fetch Firestore profile
 */
export const loginWithFirebase = async (email, password) => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to frontend/.env.');
  }

  // 1. Authenticate with Firebase Authentication
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const firebaseUser = userCredential.user;

  // 2. Fetch user profile from Cloud Firestore
  let profileData = {
    full_name: firebaseUser.displayName || 'Software Engineer',
    email: firebaseUser.email,
    auth_provider: 'firebase',
    created_at: new Date().toISOString(),
  };

  try {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      profileData = { ...profileData, ...userDoc.data() };
    } else {
      // Create user doc if it doesn't exist yet
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        full_name: firebaseUser.displayName || 'Software Engineer',
        email: firebaseUser.email,
        auth_provider: 'firebase_email',
        created_at: new Date().toISOString(),
        role: 'engineer',
      });
    }
  } catch (firestoreErr) {
    console.warn('Could not fetch Firestore user doc:', firestoreErr);
  }

  // 3. Get JWT token
  const idToken = await firebaseUser.getIdToken();

  return {
    access_token: idToken,
    refresh_token: firebaseUser.refreshToken || idToken,
    user: {
      id: firebaseUser.uid,
      full_name: profileData.full_name || firebaseUser.displayName || 'Software Engineer',
      email: firebaseUser.email,
      auth_provider: profileData.auth_provider || 'firebase',
      is_verified: firebaseUser.emailVerified,
      created_at: profileData.created_at,
    },
  };
};

/**
 * Sign in using Google OAuth via Firebase Popup
 */
export const googleSignInWithFirebase = async () => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to frontend/.env.');
  }

  const userCredential = await signInWithPopup(auth, googleProvider);
  const firebaseUser = userCredential.user;

  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  let profileData = {
    uid: firebaseUser.uid,
    full_name: firebaseUser.displayName || 'Google User',
    email: firebaseUser.email,
    auth_provider: 'google_firebase',
    photo_url: firebaseUser.photoURL || '',
    is_verified: true,
    last_login: new Date().toISOString(),
  };

  if (!userDoc.exists()) {
    profileData.created_at = new Date().toISOString();
    profileData.role = 'engineer';
    await setDoc(userDocRef, profileData);
  } else {
    profileData = { ...userDoc.data(), ...profileData };
    await updateDoc(userDocRef, { last_login: profileData.last_login });
  }

  const idToken = await firebaseUser.getIdToken();

  return {
    access_token: idToken,
    refresh_token: firebaseUser.refreshToken || idToken,
    user: {
      id: firebaseUser.uid,
      full_name: profileData.full_name,
      email: firebaseUser.email,
      auth_provider: 'google',
      is_verified: true,
      created_at: profileData.created_at || new Date().toISOString(),
    },
  };
};

/**
 * Send password reset email via Firebase Auth
 */
export const resetPasswordWithFirebase = async (email) => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please add your Firebase credentials to frontend/.env.');
  }

  await sendPasswordResetEmail(auth, email.trim());
  return {
    message: 'Password reset link sent to your email by Firebase Authentication.',
  };
};

/**
 * Sign out of Firebase
 */
export const logoutFirebase = async () => {
  if (auth) {
    await signOut(auth);
  }
};

/**
 * Get current user profile document from Firestore
 */
export const getUserProfileFromFirestore = async (uid) => {
  if (!db) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.error('Error fetching Firestore user profile:', err);
  }
  return null;
};

/**
 * Save a software failure prediction / analysis run to Cloud Firestore
 * Stores summary metrics, risk distribution, top hotspots, and model comparison.
 * @param {Object} predictionResult - Output from prediction pipeline
 * @param {Object} user - Active user object
 */
export const savePredictionToFirestore = async (predictionResult, user = null) => {
  if (!isFirebaseConfigured || !db) {
    console.info('Firestore not configured. Skipping cloud sync.');
    return null;
  }

  try {
    const criticalCount = predictionResult.risk_distribution?.critical || 0;
    const highCount = predictionResult.risk_distribution?.high || 0;
    const mediumCount = predictionResult.risk_distribution?.medium || 0;
    const lowCount = predictionResult.risk_distribution?.low || 0;
    
    let overallRisk = 'Low';
    if (criticalCount > 0) overallRisk = 'Critical';
    else if (highCount > 0) overallRisk = 'High';
    else if (mediumCount > 0) overallRisk = 'Medium';

    // Prepare top hotspots preview (max 10 to keep document compact and fast)
    const topHotspots = (predictionResult.predictions || [])
      .filter((p) => p.risk_level === 'Critical' || p.risk_level === 'High')
      .slice(0, 10)
      .map((p) => ({
        module_name: p.module_name,
        final_risk_score: p.final_risk_score,
        risk_level: p.risk_level,
        primary_cause: p.primary_cause || 'McCabe complexity',
        mccabe_loc: p.mccabe_loc || null,
        cyclomatic_complexity: p.cyclomatic_complexity || null,
      }));

    const firestoreRecord = {
      filename: predictionResult.filename || 'Uploaded Dataset.csv',
      user_id: user?.id || user?.uid || 'anonymous',
      user_email: user?.email || 'anonymous',
      total_modules: predictionResult.total_modules || (predictionResult.predictions?.length || 0),
      overall_risk_level: overallRisk,
      avg_risk_score: predictionResult.risk_distribution?.avg_risk_score || 0.0,
      risk_distribution: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      model_comparison: predictionResult.model_comparison || {},
      top_hotspots: topHotspots,
      created_at: new Date().toISOString(),
      updated_at: serverTimestamp(),
    };

    // Save to Firestore collection "predictions"
    const docRef = await addDoc(collection(db, 'predictions'), firestoreRecord);
    console.info('Prediction run successfully synced to Cloud Firestore with ID:', docRef.id);
    return { docId: docRef.id, ...firestoreRecord };
  } catch (err) {
    console.warn('Failed to save prediction run to Cloud Firestore:', err);
    return null;
  }
};

/**
 * Fetch prediction history from Cloud Firestore for a specific user
 * @param {string} userId - User UID or ID
 * @param {number} maxItems - Maximum documents to fetch
 */
export const getPredictionHistoryFromFirestore = async (userId = null, maxItems = 20) => {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const predictionsRef = collection(db, 'predictions');
    let q;
    
    if (userId) {
      q = query(
        predictionsRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        firestoreLimit(maxItems)
      );
    } else {
      q = query(
        predictionsRef,
        orderBy('created_at', 'desc'),
        firestoreLimit(maxItems)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (err) {
    console.warn('Failed to load predictions from Cloud Firestore:', err);
    return [];
  }
};

/**
 * Delete a prediction record from Cloud Firestore
 * @param {string} docId - Document ID in "predictions" collection
 */
export const deletePredictionFromFirestore = async (docId) => {
  if (!isFirebaseConfigured || !db || !docId) return false;

  try {
    const docRef = doc(db, 'predictions', docId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Failed to delete prediction from Firestore:', err);
    return false;
  }
};

export { app, auth, db, googleProvider };

