import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getAuth} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import {getFirestore} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

// Firebase Web configuration identifies the app; server-side Rules protect data.
const firebaseConfig={
 apiKey:'AIzaSyC4EosccyXSFpMv35E8Nzh6wijV3YTCRhA',
 authDomain:'jeivan-82577.firebaseapp.com',
 projectId:'jeivan-82577',
 storageBucket:'jeivan-82577.firebasestorage.app',
 messagingSenderId:'198218199725',
 appId:'1:198218199725:web:e2567028a857f35e740c24',
 measurementId:'G-EVMHES3J98'
};
export const app=initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getFirestore(app);
export const CONTENT_COLLECTION='invitationTamanRomantis';
export const RESPONSE_COLLECTION='invitationTamanRomantisResponses';
export const ADMIN_EMAIL='remajasilo.rs@gmail.com';
