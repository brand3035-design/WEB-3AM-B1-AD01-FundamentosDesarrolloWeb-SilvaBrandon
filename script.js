/* ===== AutoControl 360 - script.js ===== */

// Atajo para no repetir document.getElementById
const $ = (id) => document.getElementById(id);

/* =========================================================
   1. DATOS BASE (arrays, objetos y diccionarios)
   ========================================================= */
const CLAVE_SOLICITUDES = "ac360_solicitudes";
const CLAVE_USUARIOS = "ac360_usuarios";
const CLAVE_SESION = "ac360_sesion";
const CLAVE_VERSION = "ac360_version";

// Si cambias los datos iniciales, sube este número y el navegador se limpia solo
const VERSION_DATOS = "4";

const ESTADOS = ["Pendiente", "En revisión", "En proceso", "Finalizado", "Cancelado"];

// Diccionario: estado -> clase de Bootstrap
const CLASES_ESTADO = {
    "Pendiente": "bg-warning text-dark",
    "En revisión": "bg-info text-dark",
    "En proceso": "bg-primary",
    "Finalizado": "bg-success",
    "Cancelado": "bg-danger"
};

const MARCAS = ["Chevrolet", "Kia", "Hyundai", "Toyota", "Mazda", "Nissan", "Ford", "Suzuki", "Renault", "Volkswagen", "Otra"];

const SERVICIOS = [
    { codigo: "aceite", nombre: "Cambio de aceite y filtro", descripcion: "Aceite de calidad y filtro nuevo para proteger tu motor.", precio: 35, icono: "bi-droplet-half" },
    { codigo: "alineacion", nombre: "Alineación y balanceo", descripcion: "Mejora la estabilidad y alarga la vida de tus llantas.", precio: 25, icono: "bi-bullseye" },
    { codigo: "frenos", nombre: "Revisión de frenos", descripcion: "Inspección y cambio de pastillas, discos y líquido.", precio: 60, icono: "bi-disc" },
    { codigo: "bateria", nombre: "Cambio de batería", descripcion: "Prueba de carga e instalación de batería nueva.", precio: 20, icono: "bi-battery-charging" },
    { codigo: "diagnostico", nombre: "Diagnóstico con escáner", descripcion: "Lectura de códigos de falla con equipo computarizado.", precio: 30, icono: "bi-cpu" },
    { codigo: "revision", nombre: "Revisión general (30 puntos)", descripcion: "Chequeo completo de seguridad y desempeño del vehículo.", precio: 45, icono: "bi-clipboard-check" }
];

// Usuarios iniciales: 1 administrador, 2 clientes activos y 1 cliente deshabilitado
// Los clientes nuevos se agregan a este arreglo y se guardan en localStorage
const USUARIOS_INICIALES = [
    { id: 1, nombre: "Brandon Silva", usuario: "admin", clave: "admin123", rol: "Administrador", correo: "admin@autocontrol360.ec", telefono: "0991234567", activo: true },
    { id: 2, nombre: "Brandon Silva", usuario: "brandon", clave: "brandon123", rol: "Cliente", correo: "brand3035@gmail.com", telefono: "0995020706", activo: true },
    { id: 3, nombre: "Jair Cevallos", usuario: "jair", clave: "jair123", rol: "Cliente", correo: "jair.cevallos@gmail.com", telefono: "0995836357", activo: true },
    { id: 4, nombre: "Cristofer Silva", usuario: "cristofer", clave: "cristofer123", rol: "Cliente", correo: "cristofer.silva@gmail.com", telefono: "0995020701", activo: false }
];

// Diccionario: vista -> roles que pueden entrar
const PERMISOS_VISTA = {
    solicitud: ["Cliente", "Administrador"],
    mis: ["Cliente", "Administrador"],
    perfil: ["Cliente", "Administrador"],
    admin: ["Administrador"]
};

// Registros iniciales (solo se usan la primera vez)
const SOLICITUDES_INICIALES = [
    {
        id: 1, clienteId: 2, cliente: "Brandon Silva", correo: "brand3035@gmail.com", telefono: "0995020706",
        placa: "PBA-1234", marca: "Chevrolet", modelo: "Sail", anio: 2019, km: 45200,
        servicio: "aceite", fecha: "2026-11-14", hora: "09:00", combustible: "Gasolina",
        extras: ["Lavado exterior"], observaciones: "Ruido leve al frenar.",
        estado: "Pendiente", creadoPor: "brandon", fechaRegistro: "2026-11-10"
    },
    {
        id: 2, clienteId: 3, cliente: "Jair Cevallos", correo: "jair.cevallos@gmail.com", telefono: "0995836357",
        placa: "PCH-567", marca: "Kia", modelo: "Rio", anio: 2021, km: 28000,
        servicio: "frenos", fecha: "2026-11-12", hora: "10:30", combustible: "Gasolina",
        extras: ["Revisión de luces", "Niveles de fluidos"], observaciones: "",
        estado: "En proceso", creadoPor: "jair", fechaRegistro: "2026-11-09"
    },
    {
        id: 3, clienteId: 4, cliente: "Cristofer Silva", correo: "cristofer.silva@gmail.com", telefono: "0995020701",
        placa: "PBA-1234", marca: "Chevrolet", modelo: "Sail", anio: 2019, km: 44000,
        servicio: "alineacion", fecha: "2026-10-28", hora: "15:00", combustible: "Gasolina",
        extras: [], observaciones: "Vibración en el volante.",
        estado: "Finalizado", creadoPor: "cristofer", fechaRegistro: "2026-10-25"
    }
];

/* =========================================================
   2. VERSIÓN DE DATOS Y ESTADO DE LA APLICACIÓN
   ========================================================= */
// Si el navegador guarda datos de una versión anterior, se limpian una sola vez
if (localStorage.getItem(CLAVE_VERSION) !== VERSION_DATOS) {
    localStorage.removeItem(CLAVE_USUARIOS);
    localStorage.removeItem(CLAVE_SOLICITUDES);
    sessionStorage.removeItem(CLAVE_SESION);
    localStorage.setItem(CLAVE_VERSION, VERSION_DATOS);
}

let usuarios = cargarUsuarios();
let solicitudes = cargarSolicitudes();
let usuarioActual = cargarSesion();
let idEnEdicion = null;

/* =========================================================
   3. PERSISTENCIA (localStorage / sessionStorage)
   ========================================================= */
function cargarUsuarios() {
    const guardado = localStorage.getItem(CLAVE_USUARIOS);
    if (guardado) {
        try {
            return JSON.parse(guardado);
        } catch (error) {
            console.error("Usuarios corruptos, se restauran los iniciales");
        }
    }
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(USUARIOS_INICIALES));
    return JSON.parse(JSON.stringify(USUARIOS_INICIALES));
}

function guardarUsuarios() {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

function cargarSolicitudes() {
    const guardado = localStorage.getItem(CLAVE_SOLICITUDES);
    if (guardado) {
        try {
            return JSON.parse(guardado);
        } catch (error) {
            console.error("Datos corruptos, se restauran los iniciales");
        }
    }
    localStorage.setItem(CLAVE_SOLICITUDES, JSON.stringify(SOLICITUDES_INICIALES));
    return JSON.parse(JSON.stringify(SOLICITUDES_INICIALES));
}

function guardarSolicitudes() {
    localStorage.setItem(CLAVE_SOLICITUDES, JSON.stringify(solicitudes));
}

function cargarSesion() {
    const id = Number(sessionStorage.getItem(CLAVE_SESION));
    const usuario = usuarios.find(u => u.id === id);
    return usuario && usuario.activo ? usuario : null;
}

/* =========================================================
   4. UTILIDADES
   ========================================================= */
function escaparHtml(texto) {
    const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(texto).replace(/[&<>"']/g, caracter => mapa[caracter]);
}

function hoyISO() {
    const h = new Date();
    const mes = String(h.getMonth() + 1).padStart(2, "0");
    const dia = String(h.getDate()).padStart(2, "0");
    return `${h.getFullYear()}-${mes}-${dia}`;
}

function horaActual() {
    const h = new Date();
    const horas = String(h.getHours()).padStart(2, "0");
    const minutos = String(h.getMinutes()).padStart(2, "0");
    return `${horas}:${minutos}`;
}

function nombreServicio(codigo) {
    const servicio = SERVICIOS.find(s => s.codigo === codigo);
    return servicio ? servicio.nombre : codigo;
}

// Ciclo for clásico: busca el id más alto y suma 1
function siguienteId() {
    let mayor = 0;
    for (let i = 0; i < solicitudes.length; i++) {
        if (solicitudes[i].id > mayor) {
            mayor = solicitudes[i].id;
        }
    }
    return mayor + 1;
}

// Ciclo for...of: lo mismo para los usuarios
function siguienteIdUsuario() {
    let mayor = 0;
    for (const u of usuarios) {
        if (u.id > mayor) {
            mayor = u.id;
        }
    }
    return mayor + 1;
}

function toast(icono, titulo) {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: icono,
        title: titulo,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
    });
}

function mostrarErrores(errores, titulo = "No se guardó el registro") {
    const lista = errores.map(e => `<li>${escaparHtml(e)}</li>`).join("");
    Swal.fire({
        icon: "error",
        title: titulo,
        html: `<ul class="text-start mb-0">${lista}</ul>`
    });
}

function llenarSelect(select, opciones, placeholder) {
    const inicial = placeholder ? `<option value="">${placeholder}</option>` : "";
    select.innerHTML = inicial + opciones.map(o => `<option value="${o.valor}">${o.texto}</option>`).join("");
}

function exigirAdmin() {
    if (!usuarioActual || usuarioActual.rol !== "Administrador") {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "Solo el administrador puede realizar esta operación."
        });
        return false;
    }
    return true;
}

/* =========================================================
   5. NAVEGACIÓN ENTRE VISTAS Y CONTROL DE ACCESO
   ========================================================= */
function cerrarMenuMovil() {
    const menu = $("menuPrincipal");
    if (menu.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
}

function mostrarVista(nombre) {
    const permitidos = PERMISOS_VISTA[nombre];

    if (permitidos) {
        if (!usuarioActual) {
            Swal.fire({
                icon: "warning",
                title: "Inicia sesión",
                text: "Debes ingresar con tu usuario para acceder a esta sección."
            });
            nombre = "login";
        } else if (!permitidos.includes(usuarioActual.rol)) {
            Swal.fire({
                icon: "error",
                title: "Acceso denegado",
                text: "Tu rol no tiene permiso para entrar en esta sección."
            });
            return;
        }
    }

    // El registro es público, pero un cliente con sesión ya tiene su cuenta
    if (nombre === "registro" && usuarioActual && usuarioActual.rol === "Cliente") {
        Swal.fire({
            icon: "info",
            title: "Ya tienes una cuenta",
            text: "Cierra sesión si deseas registrar otra cuenta."
        });
        return;
    }

    document.querySelectorAll(".vista").forEach(v => v.classList.add("d-none"));
    $("vista-" + nombre).classList.remove("d-none");

    document.querySelectorAll("#menuPrincipal .nav-link").forEach(enlace => {
        enlace.classList.toggle("active", enlace.dataset.vista === nombre);
    });

    if (nombre === "registro") prepararRegistro();
    if (nombre === "solicitud") prepararFormularioSolicitud();
    if (nombre === "mis") renderMis();
    if (nombre === "perfil") renderPerfil();
    if (nombre === "admin") renderAdmin();

    window.scrollTo({ top: 0, behavior: "smooth" });
    cerrarMenuMovil();
}

function actualizarInterfaz() {
    const logueado = usuarioActual !== null;

    document.querySelectorAll(".solo-sesion").forEach(el => el.classList.toggle("d-none", !logueado));
    document.querySelectorAll(".solo-invitado").forEach(el => el.classList.toggle("d-none", logueado));

    const etiqueta = $("usuarioNav");
    etiqueta.classList.toggle("d-none", !logueado);
    if (logueado) {
        etiqueta.textContent = `${usuarioActual.nombre} · ${usuarioActual.rol}`;
    }

    const boton = $("btnAccesoNav");
    boton.textContent = logueado ? "Salir" : "Ingresar";
    boton.className = logueado ? "btn btn-outline-light btn-sm" : "btn btn-warning btn-sm";
}

/* =========================================================
   6. LOGIN Y SESIÓN
   ========================================================= */
function iniciarSesion(evento) {
    evento.preventDefault();

    const usuario = $("loginUsuario").value.trim().toLowerCase();
    const clave = $("loginClave").value;

    if (usuario === "" || clave === "") {
        Swal.fire({ icon: "warning", title: "Campos incompletos", text: "Ingresa tu usuario y contraseña." });
        return;
    }

    const encontrado = usuarios.find(u => u.usuario === usuario && u.clave === clave);

    if (!encontrado) {
        Swal.fire({ icon: "error", title: "Acceso inválido", text: "Usuario o contraseña incorrectos." });
        return;
    }

    if (!encontrado.activo) {
        Swal.fire({ icon: "error", title: "Cuenta deshabilitada", text: "Tu cuenta está deshabilitada. Comunícate con el taller." });
        return;
    }

    usuarioActual = encontrado;
    sessionStorage.setItem(CLAVE_SESION, encontrado.id);
    $("formLogin").reset();
    actualizarInterfaz();
    toast("success", `Bienvenido, ${encontrado.nombre}`);
    mostrarVista(encontrado.rol === "Administrador" ? "admin" : "perfil");
}

function cerrarSesion() {
    Swal.fire({
        title: "¿Cerrar sesión?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar"
    }).then(resultado => {
        if (resultado.isConfirmed) {
            usuarioActual = null;
            sessionStorage.removeItem(CLAVE_SESION);
            actualizarInterfaz();
            mostrarVista("inicio");
            toast("info", "Sesión cerrada");
        }
    });
}

/* =========================================================
   7. NUEVO CLIENTE (autoregistro y registro por el administrador)
   ========================================================= */
function prepararRegistro() {
    const esAdmin = usuarioActual && usuarioActual.rol === "Administrador";

    $("grupoEstadoAdmin").classList.toggle("d-none", !esAdmin);
    $("tituloRegistro").textContent = esAdmin ? "Nuevo cliente" : "Crear cuenta de cliente";
    $("textoRegistro").textContent = esAdmin
        ? "Registra un cliente nuevo. Podrá iniciar sesión con el usuario y la contraseña que definas."
        : "Completa tus datos para poder solicitar mantenimientos en línea.";
}

function validarRegistro(d) {
    const errores = [];

    if (d.nombre.length < 3 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(d.nombre)) {
        errores.push("El nombre es obligatorio (solo letras, mínimo 3 caracteres).");
    }

    if (!/^[a-z0-9_]{4,15}$/.test(d.usuario)) {
        errores.push("El usuario debe tener de 4 a 15 caracteres (minúsculas, números o guion bajo).");
    } else if (usuarios.some(u => u.usuario === d.usuario)) {
        errores.push("Ese nombre de usuario ya está en uso. Elige otro.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo)) {
        errores.push("Ingresa un correo electrónico válido (ej: nombre@correo.com).");
    } else if (usuarios.some(u => u.correo.toLowerCase() === d.correo)) {
        errores.push("Ese correo ya está registrado.");
    }

    if (!/^09\d{8}$/.test(d.telefono)) {
        errores.push("El teléfono debe tener 10 dígitos y empezar con 09 (ej: 0987654321).");
    }

    if (d.clave.length < 6 || !/[A-Za-z]/.test(d.clave) || !/\d/.test(d.clave)) {
        errores.push("La contraseña debe tener mínimo 6 caracteres, con letras y números.");
    }

    if (d.clave !== d.clave2) {
        errores.push("Las contraseñas no coinciden.");
    }

    return errores;
}

function registrarCliente(evento) {
    evento.preventDefault();

    const esAdmin = usuarioActual && usuarioActual.rol === "Administrador";

    // Un cliente con sesión iniciada no puede crear otras cuentas
    if (usuarioActual && !esAdmin) {
        Swal.fire({ icon: "error", title: "Acceso denegado", text: "Cierra sesión para registrar otra cuenta." });
        return;
    }

    const datos = {
        nombre: $("regNombre").value.trim(),
        usuario: $("regUsuario").value.trim().toLowerCase(),
        correo: $("regCorreo").value.trim().toLowerCase(),
        telefono: $("regTelefono").value.trim(),
        clave: $("regClave").value,
        clave2: $("regClave2").value
    };

    const errores = validarRegistro(datos);
    if (errores.length > 0) {
        mostrarErrores(errores, "No se pudo crear la cuenta");
        return;
    }

    const nuevo = {
        id: siguienteIdUsuario(),
        nombre: datos.nombre,
        usuario: datos.usuario,
        clave: datos.clave,
        rol: "Cliente",                       // siempre Cliente: nadie crea administradores desde la interfaz
        correo: datos.correo,
        telefono: datos.telefono,
        activo: esAdmin ? $("regEstado").value === "activa" : true
    };

    usuarios.push(nuevo);
    guardarUsuarios();
    $("formRegistro").reset();

    if (esAdmin) {
        toast("success", `Cliente ${nuevo.nombre} creado`);
        mostrarVista("admin");
    } else {
        Swal.fire({
            icon: "success",
            title: "¡Cuenta creada!",
            text: "Ya puedes iniciar sesión con tu usuario y contraseña."
        });
        mostrarVista("login");
        $("loginUsuario").value = nuevo.usuario;
    }
}

function renderClientes() {
    const clientes = usuarios.filter(u => u.rol === "Cliente");

    if (clientes.length === 0) {
        $("tablaClientes").innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No hay clientes registrados.</td></tr>`;
        return;
    }

    $("tablaClientes").innerHTML = clientes.map(u => {
        const total = solicitudes.filter(s => s.clienteId === u.id).length;
        const estado = u.activo
            ? `<span class="badge bg-success">Activa</span>`
            : `<span class="badge bg-secondary">Deshabilitada</span>`;
        const botonEstado = u.activo
            ? `<button class="btn btn-sm btn-outline-secondary" data-cuenta="${u.id}">Deshabilitar</button>`
            : `<button class="btn btn-sm btn-outline-success" data-cuenta="${u.id}">Habilitar</button>`;
        const botonEliminar = `
            <button class="btn btn-sm btn-outline-danger" data-eliminar-cliente="${u.id}" title="Eliminar cliente">
                <i class="bi bi-trash"></i>
            </button>`;

        return `
            <tr>
                <td>${u.id}</td>
                <td>${escaparHtml(u.nombre)}</td>
                <td>${escaparHtml(u.usuario)}</td>
                <td>${escaparHtml(u.correo)}</td>
                <td>${escaparHtml(u.telefono)}</td>
                <td>${total}</td>
                <td>${estado}</td>
                <td class="text-nowrap">${botonEstado} ${botonEliminar}</td>
            </tr>`;
    }).join("");
}

function cambiarEstadoCuenta(id) {
    const cliente = usuarios.find(u => u.id === id && u.rol === "Cliente");
    if (!cliente) return;

    cliente.activo = !cliente.activo;
    guardarUsuarios();
    renderClientes();
    toast("success", `Cuenta de ${cliente.nombre}: ${cliente.activo ? "habilitada" : "deshabilitada"}`);
}

function eliminarCliente(id) {
    // Solo se pueden eliminar clientes, nunca administradores
    const cliente = usuarios.find(u => u.id === id && u.rol === "Cliente");
    if (!cliente) return;

    const total = solicitudes.filter(s => s.clienteId === id).length;
    const aviso = total > 0
        ? ` También se eliminarán sus ${total} solicitud(es) de mantenimiento.`
        : "";

    Swal.fire({
        title: `¿Eliminar a ${cliente.nombre}?`,
        text: `Se borrará la cuenta "${cliente.usuario}".${aviso} Esta acción no se puede deshacer.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(resultado => {
        if (resultado.isConfirmed) {
            usuarios = usuarios.filter(u => u.id !== id);
            solicitudes = solicitudes.filter(s => s.clienteId !== id);
            guardarUsuarios();
            guardarSolicitudes();
            renderAdmin();
            toast("success", `Cliente ${cliente.nombre} eliminado`);
        }
    });
}

/* =========================================================
   8. MÓDULO 1: CATÁLOGO DE SERVICIOS
   ========================================================= */
function renderServicios() {
    $("catalogoServicios").innerHTML = SERVICIOS.map(s => `
        <div class="col-md-6 col-lg-4">
            <div class="card tarjeta servicio-card h-100 p-4">
                <div class="icono-servicio mb-3"><i class="bi ${s.icono}"></i></div>
                <h5>${s.nombre}</h5>
                <p class="text-muted">${s.descripcion}</p>
                <p class="fw-bold text-primary mb-0 mt-auto">Desde $${s.precio.toFixed(2)}</p>
            </div>
        </div>
    `).join("");
}

/* =========================================================
   9. MÓDULO 2: SOLICITUD DE MANTENIMIENTO
   ========================================================= */
function prepararFormularioSolicitud() {
    const esAdmin = usuarioActual.rol === "Administrador";
    $("grupoClienteAdmin").classList.toggle("d-none", !esAdmin);

    if (esAdmin) {
        const activos = usuarios.filter(u => u.activo);
        $("solCliente").innerHTML = activos.map(u =>
            `<option value="${u.id}" ${u.id === usuarioActual.id ? "selected" : ""}>${escaparHtml(u.nombre)} (${u.rol})</option>`
        ).join("");
    }
    autocompletarCliente();
}

function autocompletarCliente() {
    const esAdmin = usuarioActual.rol === "Administrador";
    const id = esAdmin ? Number($("solCliente").value) : usuarioActual.id;
    const cliente = usuarios.find(u => u.id === id);
    if (!cliente) return;

    $("solNombre").value = cliente.nombre;
    $("solCorreo").value = cliente.correo;
    $("solTelefono").value = cliente.telefono;
}

function leerFormularioSolicitud() {
    const combustible = document.querySelector('input[name="combustible"]:checked');
    const extras = Array.from(document.querySelectorAll('input[name="extras"]:checked')).map(c => c.value);
    const esAdmin = usuarioActual.rol === "Administrador";

    return {
        // Un cliente SIEMPRE registra a su propio nombre
        clienteId: esAdmin ? Number($("solCliente").value) : usuarioActual.id,
        cliente: $("solNombre").value.trim(),
        correo: $("solCorreo").value.trim(),
        telefono: $("solTelefono").value.trim(),
        placa: $("solPlaca").value.trim().toUpperCase(),
        marca: $("solMarca").value,
        modelo: $("solModelo").value.trim(),
        anio: $("solAnio").value,
        km: $("solKm").value,
        servicio: $("solServicio").value,
        fecha: $("solFecha").value,
        hora: $("solHora").value,
        combustible: combustible ? combustible.value : "",
        extras: extras,
        observaciones: $("solObs").value.trim()
    };
}

/* Validación compartida por el formulario nuevo y por la edición del admin */
function validarSolicitud(d, esEdicion = false, idActual = null) {
    const errores = [];
    const anioActual = new Date().getFullYear();

    if (!esEdicion) {
        if (d.cliente.length < 3 || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(d.cliente)) {
            errores.push("El nombre del cliente es obligatorio (solo letras, mínimo 3 caracteres).");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo)) {
            errores.push("Ingresa un correo electrónico válido (ej: nombre@correo.com).");
        }
        if (!/^09\d{8}$/.test(d.telefono)) {
            errores.push("El teléfono debe tener 10 dígitos y empezar con 09 (ej: 0987654321).");
        }
        if (d.combustible === "") {
            errores.push("Selecciona el tipo de combustible.");
        }
    }

    if (!/^[A-Z]{3}-\d{3,4}$/.test(d.placa)) {
        errores.push("La placa no es válida. Usa el formato ABC-1234 (3 letras, guion y 3 o 4 números).");
    }
    if (d.marca === "") {
        errores.push("Selecciona la marca del vehículo.");
    }
    if (d.modelo.length < 2) {
        errores.push("Ingresa el modelo del vehículo (mínimo 2 caracteres).");
    }

    const anio = Number(d.anio);
    if (d.anio === "" || !Number.isInteger(anio) || anio < 1980 || anio > anioActual + 1) {
        errores.push(`El año debe ser un número entero entre 1980 y ${anioActual + 1}.`);
    }

    const km = Number(d.km);
    if (d.km === "" || !Number.isInteger(km) || km < 0 || km > 999999) {
        errores.push("El kilometraje debe ser un número entero entre 0 y 999999.");
    }

    if (!SERVICIOS.some(s => s.codigo === d.servicio)) {
        errores.push("Selecciona un tipo de servicio.");
    }

    if (d.fecha === "") {
        errores.push("Selecciona la fecha del mantenimiento.");
    } else {
        const fecha = new Date(d.fecha + "T00:00:00");
        if (isNaN(fecha.getTime())) {
            errores.push("La fecha ingresada no es válida.");
        } else {
            if (!esEdicion && d.fecha < hoyISO()) {
                errores.push("La fecha no puede ser anterior a hoy.");
            }
            if (fecha.getDay() === 0) {
                errores.push("El taller no atiende los domingos. Elige otro día.");
            }
        }
    }

    // Horario: lunes a viernes 08:00-17:00 y sábados 08:00-13:00
    if (d.hora === "") {
        errores.push("Selecciona la hora del mantenimiento.");
    } else {
        const esSabado = d.fecha !== "" && new Date(d.fecha + "T00:00:00").getDay() === 6;
        const horaCierre = esSabado ? "13:00" : "17:00";

        if (d.hora < "08:00" || d.hora > horaCierre) {
            errores.push(esSabado
                ? "Los sábados el horario de atención es de 08:00 a 13:00."
                : "El horario de atención es de 08:00 a 17:00.");
        } else if (!esEdicion && d.fecha === hoyISO() && d.hora < horaActual()) {
            errores.push("La hora no puede ser anterior a la hora actual.");
        }
    }

    if (d.observaciones.length > 300) {
        errores.push("Las observaciones no pueden superar los 300 caracteres.");
    }

    // Regla extra: evitar duplicados (misma placa y misma fecha)
    if (errores.length === 0) {
        const duplicado = solicitudes.some(s =>
            s.id !== idActual && s.placa === d.placa && s.fecha === d.fecha && s.estado !== "Cancelado"
        );
        if (duplicado) {
            errores.push("Ya existe una solicitud activa para esa placa en la misma fecha.");
        }
    }

    return errores;
}

function registrarSolicitud(evento) {
    evento.preventDefault();

    if (!usuarioActual) {
        mostrarVista("login");
        return;
    }

    const datos = leerFormularioSolicitud();
    const errores = validarSolicitud(datos);

    if (errores.length > 0) {
        mostrarErrores(errores);
        return;
    }

    const nueva = {
        id: siguienteId(),
        clienteId: datos.clienteId,
        cliente: datos.cliente,
        correo: datos.correo,
        telefono: datos.telefono,
        placa: datos.placa,
        marca: datos.marca,
        modelo: datos.modelo,
        anio: Number(datos.anio),
        km: Number(datos.km),
        servicio: datos.servicio,
        fecha: datos.fecha,
        hora: datos.hora,
        combustible: datos.combustible,
        extras: datos.extras,
        observaciones: datos.observaciones,
        estado: "Pendiente",
        creadoPor: usuarioActual.usuario,
        fechaRegistro: hoyISO()
    };

    solicitudes.push(nueva);
    guardarSolicitudes();

    Swal.fire({
        icon: "success",
        title: "¡Solicitud registrada!",
        text: `La solicitud #${nueva.id} quedó en estado Pendiente.`
    });

    $("formSolicitud").reset();
    mostrarVista(usuarioActual.rol === "Administrador" ? "admin" : "mis");
}

/* =========================================================
   10. RENDERIZADO DE TABLAS
   ========================================================= */
function selectEstado(s) {
    const opciones = ESTADOS.map(e =>
        `<option value="${e}" ${e === s.estado ? "selected" : ""}>${e}</option>`
    ).join("");
    return `<select class="form-select form-select-sm select-estado" data-id="${s.id}">${opciones}</select>`;
}

function filaSolicitud(s, conAcciones) {
    const vehiculo = `${escaparHtml(s.marca)} ${escaparHtml(s.modelo)} (${s.anio})`;
    const estado = conAcciones
        ? selectEstado(s)
        : `<span class="badge ${CLASES_ESTADO[s.estado]}">${s.estado}</span>`;
    const celdaCliente = conAcciones ? `<td>${escaparHtml(s.cliente)}</td>` : "";
    const acciones = conAcciones ? `
        <td class="text-nowrap">
            <button class="btn btn-sm btn-outline-primary me-1" data-accion="editar" data-id="${s.id}" title="Editar">
                <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" data-accion="eliminar" data-id="${s.id}" title="Eliminar">
                <i class="bi bi-trash"></i>
            </button>
        </td>` : "";

    return `
        <tr>
            <td>#${s.id}</td>
            ${celdaCliente}
            <td class="fw-semibold">${escaparHtml(s.placa)}</td>
            <td>${vehiculo}</td>
            <td>${escaparHtml(nombreServicio(s.servicio))}</td>
            <td>${s.fecha}<br><small class="text-muted">${s.hora}</small></td>
            <td>${Number(s.km).toLocaleString("es-EC")} km</td>
            <td>${estado}</td>
            ${acciones}
        </tr>`;
}

function renderTabla(tbody, lista, conAcciones) {
    if (lista.length === 0) {
        const columnas = conAcciones ? 9 : 7;
        tbody.innerHTML = `<tr><td colspan="${columnas}" class="text-center text-muted py-4">No hay solicitudes para mostrar.</td></tr>`;
        return;
    }
    const ordenadas = lista.slice().sort((a, b) => b.id - a.id);
    tbody.innerHTML = ordenadas.map(s => filaSolicitud(s, conAcciones)).join("");
}

function renderMis() {
    const filtro = $("filtroMis").value;
    const propias = solicitudes.filter(s =>
        s.clienteId === usuarioActual.id && (filtro === "" || s.estado === filtro)
    );
    renderTabla($("tablaMis"), propias, false);
}

function renderPerfil() {
    const u = usuarioActual;
    const propias = solicitudes.filter(s => s.clienteId === u.id);

    $("perfilDatos").innerHTML = `
        <div class="col-md-6"><strong>Nombre:</strong> ${escaparHtml(u.nombre)}</div>
        <div class="col-md-6"><strong>Usuario:</strong> ${escaparHtml(u.usuario)}</div>
        <div class="col-md-6"><strong>Correo:</strong> ${escaparHtml(u.correo)}</div>
        <div class="col-md-6"><strong>Teléfono:</strong> ${escaparHtml(u.telefono)}</div>
        <div class="col-md-6"><strong>Rol:</strong> <span class="badge bg-dark">${u.rol}</span></div>
        <div class="col-md-6"><strong>Solicitudes registradas:</strong> ${propias.length}</div>
    `;
    renderTabla($("tablaPerfil"), propias, false);
}

/* =========================================================
   11. MÓDULO 3: ADMINISTRACIÓN (CRUD)
   ========================================================= */
function filtrarAdmin() {
    const texto = $("buscarAdmin").value.trim().toLowerCase();
    const estado = $("filtroAdmin").value;

    return solicitudes.filter(s =>
        (estado === "" || s.estado === estado) &&
        (s.placa.toLowerCase().includes(texto) || s.cliente.toLowerCase().includes(texto))
    );
}

function renderStats() {
    const tarjetas = [{ etiqueta: "Total", total: solicitudes.length }];

    // Ciclo for...of: una tarjeta por cada estado
    for (const estado of ESTADOS) {
        tarjetas.push({
            etiqueta: estado,
            total: solicitudes.filter(s => s.estado === estado).length
        });
    }

    $("adminStats").innerHTML = tarjetas.map(t => `
        <div class="col-6 col-md-2">
            <div class="tarjeta-stat">
                <span class="num">${t.total}</span>
                <span class="etq">${t.etiqueta}</span>
            </div>
        </div>
    `).join("");
}

function renderAdmin() {
    if (!usuarioActual || usuarioActual.rol !== "Administrador") return;
    renderStats();
    renderTabla($("tablaAdmin"), filtrarAdmin(), true);
    renderClientes();
}

function cambiarEstado(id, nuevoEstado) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud || !ESTADOS.includes(nuevoEstado)) return;

    solicitud.estado = nuevoEstado;
    guardarSolicitudes();
    renderAdmin();
    toast("success", `Solicitud #${id} → ${nuevoEstado}`);
}

function abrirEdicion(id) {
    const s = solicitudes.find(x => x.id === id);
    if (!s) return;

    idEnEdicion = id;
    $("editPlaca").value = s.placa;
    $("editMarca").value = s.marca;
    $("editModelo").value = s.modelo;
    $("editAnio").value = s.anio;
    $("editKm").value = s.km;
    $("editEstado").value = s.estado;
    $("editServicio").value = s.servicio;
    $("editFecha").value = s.fecha;
    $("editHora").value = s.hora;
    $("editObs").value = s.observaciones;

    bootstrap.Modal.getOrCreateInstance($("modalEditar")).show();
}

function guardarEdicion(evento) {
    evento.preventDefault();
    if (!exigirAdmin()) return;

    const datos = {
        placa: $("editPlaca").value.trim().toUpperCase(),
        marca: $("editMarca").value,
        modelo: $("editModelo").value.trim(),
        anio: $("editAnio").value,
        km: $("editKm").value,
        servicio: $("editServicio").value,
        fecha: $("editFecha").value,
        hora: $("editHora").value,
        observaciones: $("editObs").value.trim()
    };

    const errores = validarSolicitud(datos, true, idEnEdicion);
    if (errores.length > 0) {
        mostrarErrores(errores);
        return;
    }

    const solicitud = solicitudes.find(s => s.id === idEnEdicion);
    solicitud.placa = datos.placa;
    solicitud.marca = datos.marca;
    solicitud.modelo = datos.modelo;
    solicitud.anio = Number(datos.anio);
    solicitud.km = Number(datos.km);
    solicitud.servicio = datos.servicio;
    solicitud.fecha = datos.fecha;
    solicitud.hora = datos.hora;
    solicitud.observaciones = datos.observaciones;
    solicitud.estado = $("editEstado").value;

    guardarSolicitudes();
    bootstrap.Modal.getOrCreateInstance($("modalEditar")).hide();
    renderAdmin();
    toast("success", `Solicitud #${idEnEdicion} actualizada`);
}

function eliminarSolicitud(id) {
    const s = solicitudes.find(x => x.id === id);
    if (!s) return;

    Swal.fire({
        title: `¿Eliminar la solicitud #${id}?`,
        text: `Placa ${s.placa} · ${s.cliente}. Esta acción no se puede deshacer.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(resultado => {
        if (resultado.isConfirmed) {
            solicitudes = solicitudes.filter(x => x.id !== id);
            guardarSolicitudes();
            renderAdmin();
            toast("success", "Solicitud eliminada");
        }
    });
}

/* =========================================================
   12. EVENTOS
   ========================================================= */
function registrarEventos() {
    // Navegación: todo elemento con data-vista
    document.querySelectorAll("[data-vista]").forEach(elemento => {
        elemento.addEventListener("click", function (e) {
            e.preventDefault();
            mostrarVista(this.dataset.vista);
        });
    });

    // Botón Ingresar / Salir del navbar
    $("btnAccesoNav").addEventListener("click", function () {
        if (usuarioActual) {
            cerrarSesion();
        } else {
            mostrarVista("login");
        }
    });

    $("formLogin").addEventListener("submit", iniciarSesion);

    // Registro de nuevo cliente
    $("formRegistro").addEventListener("submit", registrarCliente);
    $("regUsuario").addEventListener("input", function () {
        this.value = this.value.toLowerCase().replace(/\s/g, "");
    });

    // Solicitud
    $("formSolicitud").addEventListener("submit", registrarSolicitud);
    $("solCliente").addEventListener("change", autocompletarCliente);
    $("solPlaca").addEventListener("input", function () {
        this.value = this.value.toUpperCase();
    });
    $("formSolicitud").addEventListener("reset", function () {
        // Tras limpiar, se vuelven a cargar los datos del cliente
        setTimeout(() => { if (usuarioActual) autocompletarCliente(); }, 0);
    });

    // Filtros
    $("filtroMis").addEventListener("change", renderMis);
    $("buscarAdmin").addEventListener("input", renderAdmin);
    $("filtroAdmin").addEventListener("change", renderAdmin);

    // Tabla admin (delegación de eventos)
    $("tablaAdmin").addEventListener("click", function (e) {
        const boton = e.target.closest("button[data-accion]");
        if (!boton || !exigirAdmin()) return;

        const id = Number(boton.dataset.id);
        if (boton.dataset.accion === "editar") abrirEdicion(id);
        if (boton.dataset.accion === "eliminar") eliminarSolicitud(id);
    });

    $("tablaAdmin").addEventListener("change", function (e) {
        if (!e.target.classList.contains("select-estado")) return;
        if (!exigirAdmin()) {
            renderAdmin();
            return;
        }
        cambiarEstado(Number(e.target.dataset.id), e.target.value);
    });

    // Tabla de clientes: habilitar / deshabilitar y eliminar cuenta
    $("tablaClientes").addEventListener("click", function (e) {
        if (!exigirAdmin()) return;

        const botonEstado = e.target.closest("button[data-cuenta]");
        if (botonEstado) {
            cambiarEstadoCuenta(Number(botonEstado.dataset.cuenta));
            return;
        }

        const botonEliminar = e.target.closest("button[data-eliminar-cliente]");
        if (botonEliminar) {
            eliminarCliente(Number(botonEliminar.dataset.eliminarCliente));
        }
    });

    // Modal de edición
    $("formEditar").addEventListener("submit", guardarEdicion);
}

/* =========================================================
   13. INICIALIZACIÓN
   ========================================================= */
function iniciar() {
    const marcas = MARCAS.map(m => ({ valor: m, texto: m }));
    const servicios = SERVICIOS.map(s => ({ valor: s.codigo, texto: s.nombre }));
    const estados = ESTADOS.map(e => ({ valor: e, texto: e }));

    llenarSelect($("solMarca"), marcas, "Selecciona una marca...");
    llenarSelect($("editMarca"), marcas);
    llenarSelect($("solServicio"), servicios, "Selecciona un servicio...");
    llenarSelect($("editServicio"), servicios);
    llenarSelect($("editEstado"), estados);
    llenarSelect($("filtroMis"), estados, "Todos los estados");
    llenarSelect($("filtroAdmin"), estados, "Todos los estados");

    $("solFecha").min = hoyISO();

    renderServicios();
    registrarEventos();
    actualizarInterfaz();
    mostrarVista("inicio");
}

iniciar();