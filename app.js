// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Tu configuración de Firebase (sin cambios)
const firebaseConfig = {
  apiKey: "AIzaSyCa51rOo_SK2aqxw7a0xQeeFhnGL1fZLg0",
  authDomain: "dbpruebas-775e2.firebaseapp.com",
  projectId: "dbpruebas-775e2",
  storageBucket: "dbpruebas-775e2.firebasestorage.app",
  messagingSenderId: "346017370226",
  appId: "1:346017370226:web:f808d8e76f206af9e172eb",
  measurementId: "G-YBN8TFZRBS"
};

// ✅ Inicializa Firebase con la configuración
const app = initializeApp(firebaseConfig);

// ✅ Ahora sí, inicializamos Firestore después de la app
const db = getFirestore(app);

// Referencia a la colección de productos
const productosRef = collection(db, "productos");

// Escucha cuando se agrega un producto nuevo
document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const stock = parseInt(document.getElementById("stock").value);

  if (nombre && !isNaN(precio) && !isNaN(stock)) {
    try {
      await addDoc(productosRef, { nombre, precio, stock });
      e.target.reset();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  }
});

// Mostrar productos en tiempo real
onSnapshot(productosRef, (snapshot) => {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  snapshot.forEach((doc) => {
    const p = doc.data();
    contenedor.innerHTML += `
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${p.nombre}</h5>
            <p class="card-text">💲 ${p.precio} | Stock: ${p.stock}</p>
          </div>
        </div>
      </div>
    `;
  });
});
