import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA6o-MA9oTFlpilySEpIlJMKcM00e6CwHk',
  authDomain: 'career-compass-df951.firebaseapp.com',
  projectId: 'career-compass-df951',
  storageBucket: 'career-compass-df951.firebasestorage.app',
  messagingSenderId: '234166697809',
  appId: '1:234166697809:web:1074be59b3d80c6a77dd70',
  measurementId: 'G-VM10SR4YD9',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
