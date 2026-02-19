
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, 
  deleteDoc, doc, updateDoc, query, where 
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

  
  const adminEmail = "gustavo.aquiel@jbs.com.br"; 
  if (user.email === adminEmail) isAdmin = true;

  carregarTarefas();
  carregarComputadores();
});


async function carregarTarefas() {
  const lista = document.getElementById("listaTarefas");
  if(!lista) return;
  lista.innerHTML = "";

  const q = query(
    collection(db, "tarefas"),
    where("createdBy", "==", currentUser.uid)
  );

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    lista.innerHTML += `<li>${data.titulo || data.tarefa}</li>`;
  });
}


async function carregarComputadores() {
  const tabela = document.getElementById("tabelaComputadores");
  tabela.innerHTML = "";

  let q = isAdmin 
    ? collection(db, "computadores") 
    : query(collection(db, "computadores"), where("createdBy", "==", currentUser.uid));

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
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
          ` : ``}
        </td>
      </tr>
    `;
  });
}


window.cadastrarComputador = async function() {

  if (isAdmin) {
    alert("Administrador não pode cadastrar computador!");
    return;
  }

  const usuario = document.getElementById("usuario").value;
  const nomeComputador = document.getElementById("nomeComputador").value;

  if(!usuario || !nomeComputador) {
    alert("Preencha Usuário e Nome do Computador!");
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

  alert("Computador cadastrado!");
  carregarComputadores();

  
  document.querySelectorAll("#usuario, #nomeComputador, #setor, #serviceTag, #patrimonio, #office, #obs").forEach(i=>i.value="");
}


window.editar = async function(id) {
  if(!isAdmin) return;

  const docRef = doc(db, "computadores", id);
  const docSnap = await getDocs(docRef).catch(()=>null);
  
  
  const usuario = prompt("Nome do Usuário:");
  const nomeComputador = prompt("Nome do Computador:");
  const setor = prompt("Setor:");
  const serviceTag = prompt("Service Tag:");
  const patrimonio = prompt("Patrimônio:");
  const office = prompt("Office:");
  const obs = prompt("Observações:");

  const updateData = {};
  if(usuario) updateData.usuario = usuario;
  if(nomeComputador) updateData.nomeComputador = nomeComputador;
  if(setor) updateData.setor = setor;
  if(serviceTag) updateData.serviceTag = serviceTag;
  if(patrimonio) updateData.patrimonio = patrimonio;
  if(office) updateData.office = office;
  if(obs) updateData.obs = obs;

  await updateDoc(docRef, updateData);
  carregarComputadores();
}


window.excluir = async function(id) {
  if(!isAdmin) return;
  if(!confirm("Deseja excluir este computador?")) return;

  await deleteDoc(doc(db, "computadores", id));
  carregarComputadores();
}


window.exportarExcel = async function() {
  if(!isAdmin) {
    alert("Apenas admin pode exportar!");
    return;
  }

  const querySnapshot = await getDocs(collection(db, "computadores"));
  const dados = [];

  querySnapshot.forEach(docSnap => {
    const d = docSnap.data();
    dados.push({
      "Usuário": d.usuario,
      "Nome do Computador": d.nomeComputador,
      "Setor": d.setor,
      "Service Tag": d.serviceTag,
      "Patrimônio": d.patrimonio,
      "Office": d.office,
      "Observações": d.obs || ""
    });
  });

  
  const ws = XLSX.utils.json_to_sheet(dados);

  
  ws['!cols'] = [
    {wch:20}, {wch:25}, {wch:15}, {wch:20}, {wch:15}, {wch:15}, {wch:30}
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Computadores");
  XLSX.writeFile(wb, "computadores.xlsx");
};
