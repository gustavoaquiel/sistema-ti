import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAdG2I9naqVe1tT2Y1dRAD-McuGaJiyTNU",
  authDomain: "AIzaSyAdG2I9naqVe1tT2Y1dRAD-McuGaJiyTNU",
  projectId: "sistema-ti-jbs",
  storageBucket: "sistema-ti-jbs.firebasestorage.app",
  messagingSenderId: "1033258512541",
  appId: "1:1033258512541:web:1b9755d5957c7e37736474"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let isAdmin = false;


onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  const adminEmail = "SEU_EMAIL_ADMIN_AQUI";
  if (user.email === adminEmail) {
    isAdmin = true;
  }

  carregarComputadores();
});



async function carregarComputadores() {

  const tabela = document.getElementById("tabelaComputadores");
  if (!tabela) return;

  tabela.innerHTML = "";

  let consulta;

  if (isAdmin) {
    consulta = collection(db, "computadores");
  } else {
    consulta = query(
      collection(db, "computadores"),
      where("createdBy", "==", currentUser.uid)
    );
  }

  const snapshot = await getDocs(consulta);

  snapshot.forEach(docSnap => {

    const data = docSnap.data();
    const id = docSnap.id;

    tabela.innerHTML += `
      <tr>
        <td>${data.usuario}</td>
        <td>${data.nomeComputador}</td>
        <td>${data.setor}</td>
        <td>${data.serviceTag}</td>
        <td>${data.patrimonio}</td>
        <td>${data.office}</td>
        <td>${data.obs || ""}</td>
        <td>
          ${isAdmin ? `
            <button onclick="editar('${id}')">Editar</button>
            <button onclick="excluir('${id}')">Excluir</button>
          ` : ""}
        </td>
      </tr>
    `;
  });
}



window.cadastrarComputador = async function() {

  const usuario = document.getElementById("usuario").value;
  const nomeComputador = document.getElementById("nomeComputador").value;

  if (!usuario || !nomeComputador) {
    alert("Preencha os campos obrigatórios!");
    return;
  }

  await addDoc(collection(db, "computadores"), {
    usuario,
    nomeComputador,
    setor: document.getElementById("setor").value,
    serviceTag: document.getElementById("serviceTag").value,
    patrimonio: document.getElementById("patrimonio").value,
    office: document.getElementById("office").value,
    obs: document.getElementById("obs").value,
    createdBy: currentUser.uid
  });

  alert("Computador cadastrado com sucesso!");

  carregarComputadores();

  document.querySelectorAll("input").forEach(i => i.value = "");
};



window.editar = async function(id) {

  if (!isAdmin) return;

  const usuario = prompt("Usuário:");
  const nomeComputador = prompt("Nome do Computador:");

  const docRef = doc(db, "computadores", id);

  await updateDoc(docRef, {
    usuario,
    nomeComputador
  });

  carregarComputadores();
};



window.excluir = async function(id) {

  if (!isAdmin) return;

  if (!confirm("Deseja excluir?")) return;

  await deleteDoc(doc(db, "computadores", id));

  carregarComputadores();
};