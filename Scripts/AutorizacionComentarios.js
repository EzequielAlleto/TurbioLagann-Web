// SISTEMA DE AUTENTICACIÓN Y COMENTARIOS
// TurbioLagann Web - Login/Registro + Comentarios con Base de Datos

class AuthComments {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'index'; // Cambiar según la página
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        this.setupEventListeners();
        await this.loadComments();
        this.updateUI();
    }

    // Verificar estado de autenticación
    async checkAuthStatus() {
        try {
            const response = await fetch('../api/Autorizacion.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'check' })
            });
            
            const data = await response.json();
            this.currentUser = data.loggedIn ? data.user : null;
        } catch (error) {
            console.error('Error verificando estado de auth:', error);
            this.currentUser = null;
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botones de mostrar login/registro
        document.getElementById('show-login')?.addEventListener('click', () => {
            this.showAuthForms('login');
        });
        
        document.getElementById('show-register')?.addEventListener('click', () => {
            this.showAuthForms('register');
        });

        // Tabs de auth
        document.getElementById('login-tab')?.addEventListener('click', () => {
            this.switchAuthTab('login');
        });
        
        document.getElementById('register-tab')?.addEventListener('click', () => {
            this.switchAuthTab('register');
        });

        // Formularios
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Botones de cancelar
        document.getElementById('cancel-auth')?.addEventListener('click', () => {
            this.hideAuthForms();
        });
        
        document.getElementById('cancel-auth-reg')?.addEventListener('click', () => {
            this.hideAuthForms();
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });

        // Comentarios
        document.getElementById('submit-comment')?.addEventListener('click', () => {
            this.addComment();
        });

        // Contador de caracteres
        document.getElementById('comment-text')?.addEventListener('input', (e) => {
            this.updateCharCount(e.target.value.length);
        });

        // Enviar comentario con Ctrl+Enter
        document.getElementById('comment-text')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.addComment();
            }
        });
    }

    // Login
    async login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        try {
            const response = await fetch('../api/Autorizacion.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'login',
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.showNotification(data.message, 'success');
                this.hideAuthForms();
                this.updateUI();
                this.clearAuthForms();
            } else {
                this.showNotification(+ data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error de conexión', 'error');
        }
    }

    // Registro
    async register() {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;

        if (!username || !password) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        if (username.length < 3) {
            this.showNotification('El nombre de usuario debe tener al menos 3 caracteres', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            const response = await fetch('../api/Autorizacion.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register',
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message, 'success');
                this.switchAuthTab('login');
                this.clearAuthForms();
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error de conexión', error);
        }
    }

    // Logout
    async logout() {
        try {
            const response = await fetch('../api/Autorizacion.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logout' })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = null;
                this.showNotification(data.message, 'success');
                this.updateUI();
                await this.loadComments(); // Recargar comentarios para ocultar botones de eliminar
            }
        } catch (error) {
            this.showNotification('Error cerrando sesión', 'error');
        }
    }

    // Agregar comentario
    async addComment() {
        const content = document.getElementById('comment-text').value.trim();

        if (!content) {
            this.showNotification('El comentario no puede estar vacío', 'error');
            return;
        }

        try {
            const response = await fetch('../api/Comentarios.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    content: content,
                    page: this.currentPage
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message, 'success');
                document.getElementById('comment-text').value = '';
                this.updateCharCount(0);
                await this.loadComments();
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error de conexión', 'error');
        }
    }

    // Cargar comentarios
    async loadComments() {
        try {
            const response = await fetch('../api/Comentarios.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get',
                    page: this.currentPage
                })
            });

            const data = await response.json();

            if (data.success) {
                this.renderComments(data.comments);
                this.updateCommentsTitle(data.total);
            }
        } catch (error) {
            console.error('Error cargando comentarios:', error);
        }
    }

    // Eliminar comentario
    async deleteComment(commentId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            return;
        }

        try {
            const response = await fetch('../api/Comentarios.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete',
                    commentId: commentId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message, 'success');
                await this.loadComments();
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Error de conexión', 'error');
        }
    }

    // Renderizar comentarios
    renderComments(comments) {
        const container = document.getElementById('comments-list');
        
        if (comments.length === 0) {
            container.innerHTML = `
                <div class="no-comments">
                    <p>¡Sé el primero en comentar!</p>
                    <p>Comparte tus ideas a través de un comentario.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <div class="comment-author-info">
                        <span class="comment-author ${comment.tipoUsuario}">
                            ${comment.tipoUsuario === 'turbio' ? '👑 ' : '👤 '}${this.escapeHtml(comment.nombreUsuario)}
                        </span>
                        <span class="comment-date">${this.formatDate(comment.fechaComentario)}</span>
                    </div>
                    ${this.canDeleteComment(comment) ? `
                        <button class="comment-delete" onclick="authComments.deleteComment(${comment.idComentario})" title="Eliminar comentario">
                            Eliminar Comentario
                        </button>
                    ` : ''}
                </div>
                <div class="comment-content">${this.escapeHtml(comment.contenido)}</div>
            </div>
        `).join('');
    }

    // Verificar permisos de eliminación
    canDeleteComment(comment) {
        return this.currentUser && 
               (this.currentUser.id == comment.idUsuario || this.currentUser.type === 'turbio');
    }

    // UI Management
    showAuthForms(tab = 'login') {
        document.getElementById('auth-forms').style.display = 'block';
        document.getElementById('login-prompt').style.display = 'none';
        this.switchAuthTab(tab);
    }

    hideAuthForms() {
        document.getElementById('auth-forms').style.display = 'none';
        document.getElementById('login-prompt').style.display = 'block';
        this.clearAuthForms();
    }

    switchAuthTab(tab) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');

        if (tab === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }

    clearAuthForms() {
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
    }

    updateUI() {
        const isLoggedIn = this.currentUser !== null;
        
        // Mostrar/ocultar elementos según estado de login
        document.getElementById('user-info').style.display = isLoggedIn ? 'flex' : 'none';
        document.getElementById('comment-form-container').style.display = isLoggedIn ? 'block' : 'none';
        document.getElementById('login-prompt').style.display = isLoggedIn ? 'none' : 'block';
        
        if (isLoggedIn) {
            document.getElementById('current-user').textContent = this.currentUser.username;
        }
    }

    updateCharCount(count) {
        document.getElementById('char-counter').textContent = `${count}/1000`;
    }

    updateCommentsTitle(total) {
        document.getElementById('comments-title').textContent = 
            `Comentarios de la comunidad (${total})`;
    }

    // Utilidades
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'hace unos segundos';
        if (diff < 3600) return `hace ${Math.floor(diff / 60)} minutos`;
        if (diff < 86400) return `hace ${Math.floor(diff / 3600)} horas`;
        if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
        
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type) {
        // Eliminar notificación anterior si existe
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Estilos inline para asegurar visualización
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#f44336'};
        `;

        document.body.appendChild(notification);

        // Auto-remove después de 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }


}

// 🚀 Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.authComments = new AuthComments();
    
    // Agregar estilos de animación si no existen
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});