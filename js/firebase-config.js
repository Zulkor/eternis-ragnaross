// 🔹 FIREBASE CONFIG (egy helyen init)
const firebaseConfig = {
  apiKey: "AIzaSyDxXh_68XFG_n8zUTAg1IPUe0lI4qQalsM",
  authDomain: "eternis-progress.firebaseapp.com",
  databaseURL:
    "https://eternis-progress-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "eternis-progress",
  storageBucket: "eternis-progress.appspot.com",
  messagingSenderId: "820448513456",
  appId: "1:820448513456:web:521976f61a9f6cdc34da75",
};

// 🔹 INIT
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
export { db };
