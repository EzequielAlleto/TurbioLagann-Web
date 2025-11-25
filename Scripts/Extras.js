// GALERÍA Y MODAL PARA Extras.html
// TurbioLagann Web - JavaScript para la sección Extras

document.addEventListener('DOMContentLoaded', function() {
    console.log('Galería Extras cargada correctamente');
});

// Abrir modal con imagen
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    modal.style.display = 'block';
    modalImg.src = imageSrc;
    
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}

// Cerrar modal al hacer clic fuera de la imagen
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        closeModal();
    }
}
