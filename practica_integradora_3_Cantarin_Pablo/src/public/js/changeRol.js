document.addEventListener("DOMContentLoaded", () => {
  const changeButton = document.querySelector(".changeButton");
  const path = window.location.pathname;
  const segment = path.split("/");
  const uid = segment[4];

  changeButton.addEventListener("click", async () => {
    const confirmUpdate = confirm(`¿Desea cambiar el rol del usuario?`);
    if (confirmUpdate) {
      try {
        const response = await fetch(`./${uid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (response.ok) {
          window.location.reload();
        } else {
          const errorData = await response.text();
          console.log("Error al cambiar rol", errorData);
        }

        // window.location.reload();
      } catch (error) {
        console.log("No se ha cambiado rol", error);
      }
    }
  });
});
