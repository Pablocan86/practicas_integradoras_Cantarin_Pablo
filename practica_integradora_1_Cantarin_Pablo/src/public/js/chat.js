const usuario = document.getElementById("usuario");
const mensaje = document.getElementById("mensaje");
const listaDeMensajes = document.getElementById("muestraMensajes");
const btnEnviar = document.getElementById("btnEnviar");

const mensajes = [];

const listado = mensajes.forEach((m) => {
  `<div><p>${user} dice: ${message}</p></div>`;
});

if (mensajes.length >= 0) {
  listaDeMensajes.innerHTML = listado;
} else if ((mensajes = [])) {
  listaDeMensajes.innerText = `<p>Aun no hay mensajes</p>`;
}

btnEnviar.addEventListener("click", () => {
  const nuevoMensaje = {
    user: usuario.value,
    message: mensaje.value,
  };
  mensajes.push(nuevoMensaje);
  listaDeMensajes.innerHTML += `<div><p>${nuevoMensaje.user} dice: ${nuevoMensaje.message}</p></div>`;
  console.log(mensajes);
});
