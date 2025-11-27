<?php
//  SISTEMA DE AUTENTICACIÓN
// Login y Registro

session_start();
require_once '../Conexion.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Acccoess-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

class Auth {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function register($nombreUsuario, $contrasena) {
        // Validaciones básicas
        if (strlen($nombreUsuario) < 3) {
            return ["success" => false, "message" => "El nombre de usuario debe tener al menos 3 caracteres"];
        }
        
        if (strlen($contrasena) < 6) {
            return ["success" => false, "message" => "La contraseña debe tener al menos 6 caracteres"];
        }

        // Verificar si el usuario ya existe
        $checkQuery = "SELECT idUsuario FROM usuarios WHERE nombreUsuario = ?";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->execute([$nombreUsuario]);
        
        if ($checkStmt->rowCount() > 0) {
            return ["success" => false, "message" => "El nombre de usuario ya está en uso"];
        }

        // Insertar nuevo usuario
        $insertQuery = "INSERT INTO usuarios (nombreUsuario, contrasena) VALUES (?, UNHEX(SHA2(?, 256)))";
        $insertStmt = $this->conn->prepare($insertQuery);
        
        try {
            $insertStmt->execute([$nombreUsuario, $contrasena]);
            return ["success" => true, "message" => "¡Usuario registrado exitosamente! Ya puedes iniciar sesión"];
        } catch(PDOException $e) {
            return ["success" => false, "message" => "Error al registrar usuario"];
        }
    }

    public function login($nombreUsuario, $contrasena) {
        $query = "SELECT idUsuario, nombreUsuario, contrasena, tipoUsuario FROM usuarios WHERE nombreUsuario = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$nombreUsuario]);
        
        if ($user = $stmt->fetch()) {

            $hashedInput = hash('sha256', $contrasena);
            if ($hashedInput === bin2hex($user['contrasena'])) {

                $_SESSION['user_id'] = $user['idUsuario'];
                $_SESSION['username'] = $user['nombreUsuario'];
                $_SESSION['user_type'] = $user['tipoUsuario'];
                
                return [
                    "success" => true, 
                    "message" => "¡Bienvenido, " . $user['nombreUsuario'] . "!",
                    "user" => [
                        "id" => $user['idUsuario'],
                        "username" => $user['nombreUsuario'],
                        "type" => $user['tipoUsuario']
                    ]
                ];
            }
        }
        
        return ["success" => false, "message" => "Usuario o contraseña incorrectos"];
    }

    public function logout() {
        session_destroy();
        return ["success" => true, "message" => "Sesión cerrada exitosamente"];
    }

    public function checkSession() {
        if (isset($_SESSION['user_id'])) {
            return [
                "success" => true,
                "loggedIn" => true,
                "user" => [
                    "id" => $_SESSION['user_id'],
                    "username" => $_SESSION['username'],
                    "type" => $_SESSION['user_type']
                ]
            ];
        }
        
        return ["success" => true, "loggedIn" => false, "user" => null];
    }

    public function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }

    public function isTurbio() {
        return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'turbio';
    }
}

// Procesar requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $auth = new Auth();
    
    switch ($action) {
        case 'register':
            echo json_encode($auth->register($input['username'], $input['password']));
            break;
            
        case 'login':
            echo json_encode($auth->login($input['username'], $input['password']));
            break;
            
        case 'logout':
            echo json_encode($auth->logout());
            break;
            
        case 'check':
            echo json_encode($auth->checkSession());
            break;
            
        default:
            echo json_encode(["success" => false, "message" => "Acción no válida"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
}
?>