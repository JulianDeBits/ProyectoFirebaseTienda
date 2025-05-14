import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCa51rOo_SK2aqxw7a0xQeeFhnGL1fZLg0",
  authDomain: "dbpruebas-775e2.firebaseapp.com",
  projectId: "dbpruebas-775e2",
  storageBucket: "dbpruebas-775e2.firebasestorage.app",
  messagingSenderId: "346017370226",
  appId: "1:346017370226:web:f808d8e76f206af9e172eb",
  measurementId: "G-YBN8TFZRBS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productosRef = collection(db, "productos");
const clientesRef = collection(db, "clientes");
const ventasRef = collection(db, "ventas");

let idEditando = null;
let nombresProductos = [];



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

onSnapshot(productosRef, (snapshot) => {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";
  nombresProductos = []; 

  snapshot.forEach((docItem) => {
    const p = docItem.data();
    const id = docItem.id;

    nombresProductos.push(p.nombre); 

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

window.eliminarProducto = async (id) => {
  if (confirm("¿Eliminar este producto?")) {
    try {
      await deleteDoc(doc(db, "productos", id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
};

window.editarProducto = (id, nombre, precio, stock) => {
  document.getElementById("nombre").value = nombre;
  document.getElementById("precio").value = precio;
  document.getElementById("stock").value = stock;
  idEditando = id;
};


document.getElementById("formCliente").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("clienteNombre").value;
  const correo = document.getElementById("clienteCorreo").value;

  try {
    await addDoc(clientesRef, { nombre, correo });
    alert("Cliente registrado ✅");
    e.target.reset();
  } catch (error) {
    console.error("Error al registrar cliente:", error);
  }
});

onSnapshot(clientesRef, (snapshot) => {
  const contenedor = document.getElementById("clientes");
  contenedor.innerHTML = "";

  snapshot.forEach((docItem) => {
    const cliente = docItem.data();
    const id = docItem.id;

    contenedor.innerHTML += `
      <div class="col-12 mb-3">
        <div class="card shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title mb-1">${cliente.nombre}</h5>
              <p class="card-text mb-0">${cliente.correo}</p>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente('${id}')">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
});

window.eliminarCliente = async (id) => {
  if (confirm("¿Eliminar este cliente?")) {
    try {
      await deleteDoc(doc(db, "clientes", id));
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  }
};


document.getElementById("formVenta").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombreBuscado = document.getElementById("buscadorProducto").value.trim().toLowerCase();
  const cantidad = parseInt(document.getElementById("cantidadVenta").value);
  const resultadoVenta = document.getElementById("resultadoVenta");
  resultadoVenta.innerHTML = "";

  if (!nombreBuscado || isNaN(cantidad) || cantidad <= 0) {
    resultadoVenta.innerHTML = "<div class='alert alert-danger'>Datos inválidos.</div>";
    return;
  }

  const snapshot = await getDocs(productosRef);
  let productoEncontrado = null;
  let docId = null;

  snapshot.forEach((doc) => {
    const p = doc.data();
    if (p.nombre.toLowerCase() === nombreBuscado) {
      productoEncontrado = p;
      docId = doc.id;
    }
  });

  if (!productoEncontrado) {
    resultadoVenta.innerHTML = "<div class='alert alert-warning'>Producto no encontrado.</div>";
    return;
  }

  if (productoEncontrado.stock < cantidad) {
    resultadoVenta.innerHTML = `<div class='alert alert-danger'>Stock insuficiente. Solo hay ${productoEncontrado.stock} unidades.</div>`;
    return;
  }

  await addDoc(ventasRef, {
    producto: productoEncontrado.nombre,
    cantidad,
    precioUnitario: productoEncontrado.precio,
    total: cantidad * productoEncontrado.precio,
    fecha: new Date()
  });

  const productoDoc = doc(db, "productos", docId);
  await updateDoc(productoDoc, {
    stock: productoEncontrado.stock - cantidad
  });

  resultadoVenta.innerHTML = "<div class='alert alert-success'>Venta registrada ✅</div>";
  e.target.reset();
});

onSnapshot(ventasRef, (snapshot) => {
  const contenedor = document.getElementById("ventas");
  contenedor.innerHTML = "";

  snapshot.forEach((docItem) => {
    const venta = docItem.data();
    const id = docItem.id;

    contenedor.innerHTML += `
      <div class="col-12 mb-3">
        <div class="card shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title mb-1">${venta.producto}</h5>
              <p class="card-text mb-0">Cantidad: ${venta.cantidad} | Total: 💲${venta.total}</p>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarVenta('${id}')">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
});

window.eliminarVenta = async (id) => {
  if (confirm("¿Eliminar esta venta?")) {
    try {
      await deleteDoc(doc(db, "ventas", id));
    } catch (error) {
      console.error("Error al eliminar venta:", error);
    }
  }
};

const buscadorInput = document.getElementById("buscadorProducto");
const sugerenciasDiv = document.getElementById("sugerenciasProducto");

buscadorInput.addEventListener("input", () => {
  const texto = buscadorInput.value.toLowerCase();
  sugerenciasDiv.innerHTML = "";

  if (!texto) return;

  const filtrados = nombresProductos.filter(nombre =>
    nombre.toLowerCase().includes(texto)
  );

  filtrados.forEach((nombre) => {
    const item = document.createElement("button");
    item.className = "list-group-item list-group-item-action";
    item.textContent = nombre;
    item.onclick = () => {
      buscadorInput.value = nombre;
      sugerenciasDiv.innerHTML = "";
    };
    sugerenciasDiv.appendChild(item);
  });
});

document.addEventListener("click", (e) => {
  if (!sugerenciasDiv.contains(e.target) && e.target !== buscadorInput) {
    sugerenciasDiv.innerHTML = "";
  }
});

