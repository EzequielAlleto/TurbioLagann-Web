// 🎯 CARRUSEL Y MODAL PARA Extras.html
// TurbioLagann Web - JavaScript para la sección Extras

let slideIndex = 0;
const images = [
    { src: '../Imagenes/Extras/1.png'},
    { src: '../Imagenes/Extras/2.png'},
    { src: '../Imagenes/Extras/3.png'},
    { src: '../Imagenes/Extras/4.png'},
    { src: '../Imagenes/Extras/5.png'},
    { src: '../Imagenes/Extras/6.png'},
    { src: '../Imagenes/Extras/7.png'},
    { src: '../Imagenes/Extras/8.png'}

];

// 🎠 FUNCIONES DEL CARRUSEL
function changeSlide(direction) {
    slideIndex += direction;
    if (slideIndex >= images.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = images.length - 1;
    
    const carousel = document.querySelector('.carousel');
    carousel.style.transform = `translateX(-${slideIndex * 100}%)`;
    
    updateIndicators();
}

function currentSlide(n) {
    slideIndex = n - 1;
    const carousel = document.querySelector('.carousel');
    carousel.style.transform = `translateX(-${slideIndex * 100}%)`;
    updateIndicators();
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === slideIndex);
    });
}

// 🖼️ FUNCIONES DEL MODAL
function openModal(index) {
    slideIndex = index;
    document.getElementById('imageModal').style.display = 'block';
    updateModalImage();
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}

function modalPrev() {
    slideIndex = slideIndex > 0 ? slideIndex - 1 : images.length - 1;
    updateModalImage();
}

function modalNext() {
    slideIndex = slideIndex < images.length - 1 ? slideIndex + 1 : 0;
    updateModalImage();
}

function updateModalImage() {
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    
    modalImage.src = images[slideIndex].src;
    modalCaption.textContent = images[slideIndex].caption;
}

// 🚀 INICIALIZACIÓN CUANDO LA PÁGINA CARGA
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos de las imágenes para abrir modal
    document.querySelectorAll('.gallery-image').forEach((img, index) => {
        img.addEventListener('click', () => {
            openModal(index);
        });
    });

    // Configurar botón de cerrar modal
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Cerrar modal al hacer click en el fondo
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Auto-play del carrusel (cada 5 segundos)
    setInterval(() => {
        changeSlide(1);
    }, 5000);
});