import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdG2I9naqVe1tT2Y1dRAD-McuGaJiyTNU",
  authDomain: "sistema-ti-jbs.firebaseapp.com",
  projectId: "sistema-ti-jbs",
  storageBucket: "sistema-ti-jbs.firebasestorage.app",
  messagingSenderId: "1033258512541",
  appId: "1:1033258512541:web:1b9755d5957c7e37736474"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


