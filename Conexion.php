<?php
// 🗄️ CONEXIÓN A BASE DE DATOS
// TurbioLagann Web - Configuración MySQL

class Database {
    private $host = "";
    private $database = ""; 
    private $username = "";
    private $password = "";
    private $connection;

    public function getConnection() {
        $this->connection = null;
        
        try {
            $this->connection = new PDO(
                "mysql:host=" . $this->host . ";port=3306;dbname=" . $this->database . ";charset=utf8",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch(PDOException $exception) {
            die("Error de conexión a la base de datos: " . $exception->getMessage());
        }
        
        return $this->connection;
    }
}
?>