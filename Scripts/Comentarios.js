// 💬 SISTEMA DE COMENTARIOS SIN REGISTRO
// TurbioLagann Web - Comentarios con localStorage

(function() {
    'use strict';
    
    // Configuración
    const MAX_COMMENTS = 50; // Máximo de comentarios almacenados
    const STORAGE_KEY = 'turbiolagann_comments';
    
    // Variables DOM
    let userName, commentText, submitBtn, commentsContainer;
    
    // Función para obtener comentarios del localStorage
    function getComments() {
        try {
            const comments = localStorage.getItem(STORAGE_KEY);
            return comments ? JSON.parse(comments) : [];
        } catch (e) {
            console.error('Error al cargar comentarios:', e);
            return [];
        }
    }
    
    // Función para guardar comentarios en localStorage
    function saveComments(comments) {
        try {
            // Limitar el número de comentarios
            if (comments.length > MAX_COMMENTS) {
                comments = comments.slice(-MAX_COMMENTS);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
        } catch (e) {
            console.error('Error al guardar comentarios:', e);
        }
    }
    
    // Función para crear elemento de comentario
    function createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        const timeAgo = getTimeAgo(comment.timestamp);
        const safeUserName = sanitizeText(comment.userName || 'Anónimo');
        const safeComment = sanitizeText(comment.text);
        
        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">👤 ${safeUserName}</span>
                <span class="comment-time"> ${timeAgo}</span>
                <button class="comment-delete" onclick="deleteComment('${comment.id}')" title="Eliminar comentario">Eliminar</button>
            </div>
            <div class="comment-content">${safeComment}</div>
            <div class="comment-actions">
                <button class="comment-like" onclick="likeComment('${comment.id}')">
                    Me gusta <span class="like-count">${comment.likes || 0}</span>
                </button>
            </div>
        `;
        
        return commentDiv;
    }
    
    // Función para mostrar comentarios
    function displayComments() {
        const comments = getComments();
        commentsContainer.innerHTML = '';
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="no-comments">
                    <p>¡Sé el primero en comentar!</p>
                    <p>Comparte tus ideas a través de un comentario.</p>
                </div>
            `;
            return;
        }
        
        // Mostrar comentarios más recientes primero
        comments.reverse().forEach(comment => {
            const commentElement = createCommentElement(comment);
            commentsContainer.appendChild(commentElement);
        });
        
        // Mostrar contador de comentarios
        updateCommentsCount(comments.length);
    }
    
    // Función para agregar nuevo comentario
    function addComment() {
        const text = commentText.value.trim();
        const name = userName.value.trim();
        
        if (!text) {
            showMessage(' Por favor escribe un comentario', 'warning');
            return;
        }
        
        // Filtro básico de palabras inapropiadas
        if (containsInappropriateWords(text)) {
            showMessage(' Por favor mantén un lenguaje apropiado', 'error');
            return;
        }
        
        const comment = {
            id: generateId(),
            userName: name || 'Anónimo',
            text: text,
            timestamp: Date.now(),
            likes: 0
        };
        
        const comments = getComments();
        comments.push(comment);
        saveComments(comments);
        
        // Limpiar formulario
        userName.value = '';
        commentText.value = '';
        updateCharCount();
        
        // Actualizar vista
        displayComments();
        showMessage(' ¡Comentario publicado!', 'success');
        
        // Scroll al nuevo comentario
        setTimeout(() => {
            commentsContainer.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
    
    // Función para generar ID único
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Función para sanitizar texto
    function sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Función para calcular tiempo transcurrido
    function getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'hace un momento';
    }
    
    // Función para mostrar mensajes
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `comment-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#f44336'};
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
    
    // Función para actualizar contador de caracteres
    function updateCharCount() {
        const nameCount = document.querySelector('#comentarios .form-group:first-child .char-count');
        const textCount = document.querySelector('#comentarios .form-group:last-child .char-count');
        
        if (nameCount) nameCount.textContent = `${userName.value.length}/50`;
        if (textCount) textCount.textContent = `${commentText.value.length}/500`;
    }
    
    // Función para actualizar contador de comentarios
    function updateCommentsCount(count) {
        const title = document.querySelector('#commentsList h4');
        if (title) {
            title.textContent = `Comentarios recientes (${count}):`;
        }
    }
    
    // Filtro básico de palabras inapropiadas
    function containsInappropriateWords(text) {
        const inappropriateWords = ['spam', 'virus', 'hack'];
        return inappropriateWords.some(word => 
            text.toLowerCase().includes(word.toLowerCase())
        );
    }
    
    // Funciones globales para botones
    window.deleteComment = function(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            let comments = getComments();
            comments = comments.filter(comment => comment.id !== id);
            saveComments(comments);
            displayComments();
            showMessage(' Comentario eliminado', 'success');
        }
    };
    
    window.likeComment = function(id) {
        const comments = getComments();
        const comment = comments.find(c => c.id === id);
        if (comment) {
            comment.likes = (comment.likes || 0) + 1;
            saveComments(comments);
            displayComments();
        }
    };
    
    window.reportComment = function(id) {
        showMessage(' Comentario reportado. Gracias por mantener la comunidad limpia.', 'success');
    };
    
    // Inicialización cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Obtener elementos DOM
        userName = document.getElementById('userName');
        commentText = document.getElementById('commentText');
        submitBtn = document.getElementById('submitComment');
        commentsContainer = document.getElementById('commentsContainer');
        
        if (!userName || !commentText || !submitBtn || !commentsContainer) {
            console.error('No se pudieron encontrar los elementos de comentarios');
            return;
        }
        
        // Event listeners
        submitBtn.addEventListener('click', addComment);
        
        // Permitir envío con Enter (Ctrl+Enter)
        commentText.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                addComment();
            }
        });
        
        // Actualizar contador de caracteres
        userName.addEventListener('input', updateCharCount);
        commentText.addEventListener('input', updateCharCount);
        
        // Cargar comentarios existentes
        displayComments();
        updateCharCount();
        
        console.log('Sistema de comentarios inicializado correctamente');
    });
    
})();