import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const config = window.client_config.firebase;
const app = firebase.initializeApp(config);

export default app;
