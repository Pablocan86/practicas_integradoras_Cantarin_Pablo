document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".deleteButton");
  const divData = document.querySelector(".productInCart");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const productId = button.getAttribute("data-id");
      console.log(productId);
      const cartId = divData.getAttribute("data-id");
      const confirmDelete = confirm(
        "¿Estás seguro de que deseas eliminar este producto?"
      );

      if (confirmDelete) {
        try {
          const response = await fetch(
            `/carts/${cartId}/products/${productId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            alert("Producto eliminado exitosamente");
            // Opcional: remover el elemento del DOM
            button.parentElement.remove();
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
