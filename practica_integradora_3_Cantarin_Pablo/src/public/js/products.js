document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".deleteButton");
  const titleProduct = document.querySelector(".titleProduct").textContent;
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const productId = button.getAttribute("data-id");
      const confirmDelete = confirm(
        `¿Estás seguro de que deseas eliminar ${titleProduct} ?`
      );

      if (confirmDelete) {
        try {
          const response = await fetch(`/productsManager/${productId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            alert("Producto eliminado exitosamente");
            // Opcional: remover el elemento del DOM
            button.parentElement.parentElement.remove();
          } else {
            alert("Error al eliminar el producto");
          }
        } catch (error) {
          alert("Error de red al intentar eliminar el producto");
        }
      }
    });
  });
});
