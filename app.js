import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB_RyDSWNbpPQ7jscN7uu6Hr1vm827ofSI",
  authDomain: "db-pruebas-37531.firebaseapp.com",
  projectId: "db-pruebas-37531",
  storageBucket: "db-pruebas-37531.appspot.com",
  messagingSenderId: "992341714286",
  appId: "1:992341714286:web:cdb7b76c678d5ab6924d7f",
  measurementId: "G-QBB6WG7N4P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productosRef = collection(db, "productos");

let idEditando = null;

// Guardar o editar producto
document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const stock = parseInt(document.getElementById("stock").value);

  if (nombre && !isNaN(precio) && !isNaN(stock)) {
    try {
      if (idEditando) {
        const productoDoc = doc(db, "productos", idEditando);
        await updateDoc(productoDoc, { nombre, precio, stock });
        idEditando = null;
      } else {
        await addDoc(productosRef, { nombre, precio, stock });
      }
      e.target.reset();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  }
});

// Escuchar en tiempo real
onSnapshot(productosRef, (snapshot) => {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  snapshot.forEach((docItem) => {
    const p = docItem.data();
    const id = docItem.id;

    contenedor.innerHTML += `
      <div class="col-12 mb-3">
        <div class="card shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title mb-1">${p.nombre}</h5>
              <p class="card-text mb-0">💲 ${p.precio} | Stock: ${p.stock}</p>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2" onclick="editarProducto('${id}', '${p.nombre}', ${p.precio}, ${p.stock})">Editar</button>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto('${id}')">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
});

// Eliminar producto
window.eliminarProducto = async (id) => {
  if (confirm("¿Eliminar este producto?")) {
    try {
      await deleteDoc(doc(db, "productos", id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
};

// Editar producto
window.editarProducto = (id, nombre, precio, stock) => {
  document.getElementById("nombre").value = nombre;
  document.getElementById("precio").value = precio;
  document.getElementById("stock").value = stock;
  idEditando = id;
};
