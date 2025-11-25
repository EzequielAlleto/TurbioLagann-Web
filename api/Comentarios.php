<?php
// 💬 SISTEMA DE COMENTARIOS
// TurbioLagann Web - Gestión de comentarios

session_start();
require_once '../Conexion.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

class Comments {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function addComment($contenido, $pagina) {
        // Verificar que el usuario esté logueado
        if (!isset($_SESSION['user_id'])) {
            return ["success" => false, "message" => "Debes iniciar sesión para comentar"];
        }

        // Validaciones
        $contenido = trim($contenido);
        if (empty($contenido)) {
            return ["success" => false, "message" => "El comentario no puede estar vacío"];
        }

        if (strlen($contenido) > 1000) {
            return ["success" => false, "message" => "El comentario no puede exceder 1000 caracteres"];
        }

        // Filtrar palabras prohibidas
        $contenidoFiltrado = $this->filtrarPalabras($contenido);
        if ($contenidoFiltrado !== $contenido) {
            return ["success" => false, "message" => "Tu comentario contiene palabras no permitidas"];
        }

        // Insertar comentario
        $query = "INSERT INTO comentarios (idUsuario, contenido, pagina) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        try {
            $stmt->execute([$_SESSION['user_id'], $contenidoFiltrado, $pagina]);
            return ["success" => true, "message" => "¡Comentario publicado exitosamente!"];
        } catch(PDOException $e) {
            return ["success" => false, "message" => "Error al publicar el comentario"];
        }
    }

    public function getComments($pagina) {
        $query = "SELECT c.idComentario, c.contenido, c.fechaComentario, 
                         u.nombreUsuario, u.tipoUsuario, c.idUsuario
                  FROM comentarios c 
                  JOIN usuarios u ON c.idUsuario = u.idUsuario 
                  WHERE c.pagina = ? 
                  ORDER BY c.fechaComentario DESC 
                  LIMIT 50";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$pagina]);
        
        $comments = $stmt->fetchAll();
        
        return [
            "success" => true, 
            "comments" => $comments,
            "total" => count($comments)
        ];
    }

    public function deleteComment($idComentario) {
        if (!isset($_SESSION['user_id'])) {
            return ["success" => false, "message" => "No autorizado"];
        }

        // Verificar permisos (solo el autor o Turbio pueden eliminar)
        $checkQuery = "SELECT idUsuario FROM comentarios WHERE idComentario = ?";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->execute([$idComentario]);
        $comment = $checkStmt->fetch();

        if (!$comment) {
            return ["success" => false, "message" => "Comentario no encontrado"];
        }

        $isTurbio = isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'turbio';
        $isAuthor = $comment['idUsuario'] == $_SESSION['user_id'];

        if (!$isTurbio && !$isAuthor) {
            return ["success" => false, "message" => "No tienes permisos para eliminar este comentario"];
        }

        // Eliminar comentario
        $deleteQuery = "DELETE FROM comentarios WHERE idComentario = ?";
        $deleteStmt = $this->conn->prepare($deleteQuery);
        
        try {
            $deleteStmt->execute([$idComentario]);
            return ["success" => true, "message" => "Comentario eliminado"];
        } catch(PDOException $e) {
            return ["success" => false, "message" => "Error al eliminar comentario"];
        }
    }

    // Filtrar palabras prohibidas
    private function filtrarPalabras($contenido) {
        // Lista de palabras prohibidas (puedes agregar más)
        $palabrasProhibidas = [
            'spam', 'hack', 'mierda', 'puto', 'puta', 'idiota', 'imbecil',
            'pendejo', 'cabron', 'joder', 'coño', 'pija', 'verga', 'chingar',
            'fuck', 'shit', 'bitch', 'ass', 'damn', 'crap', 'stupid',
            'virus', 'malware', 'phishing', 'scam', 'fraud', 'cagar'
        ];
        
        $contenidoLimpio = $contenido;
        
        foreach ($palabrasProhibidas as $palabra) {
            // Buscar palabra (case insensitive)
            $pattern = '/\b' . preg_quote($palabra, '/') . '\b/i';
            if (preg_match($pattern, $contenidoLimpio)) {
                return false; // Encontró palabra prohibida, retorna false
            }
        }
        
        return $contenidoLimpio; // No encontró palabras prohibidas
    }


}

// Procesar requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $comments = new Comments();
    
    switch ($action) {
        case 'add':
            echo json_encode($comments->addComment($input['content'], $input['page']));
            break;
            
        case 'get':
            echo json_encode($comments->getComments($input['page']));
            break;
            
        case 'delete':
            echo json_encode($comments->deleteComment($input['commentId']));
            break;
            

            
        default:
            echo json_encode(["success" => false, "message" => "Acción no válida"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
}
?>