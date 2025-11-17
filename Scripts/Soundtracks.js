// 🎯 CARRUSEL Y MODAL PARA Soundtracks.html
// TurbioLagann Web - JavaScript para la sección Soundtracks

let slideIndex = 0;
const images = [
    { src: '../Imagenes/Soundtracks/1.jpg'},
    { src: '../Imagenes/Soundtracks/2.jpg'},
    { src: '../Imagenes/Soundtracks/3.jpg'},
    { src: '../Imagenes/Soundtracks/4.jpg'},
    { src: '../Imagenes/Soundtracks/5.jpg'},
    { src: '../Imagenes/Soundtracks/6.jpg'},
    { src: '../Imagenes/Soundtracks/7.jpg'},
    { src: '../Imagenes/Soundtracks/8.jpg'}
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