drop database if exists Turbio;
create database Turbio;
USE Turbio;

CREATE TABLE usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena BINARY(32) NOT NULL,
    tipoUsuario ENUM('turbio','usuario') DEFAULT 'usuario',
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comentarios (
    idComentario INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    contenido TEXT NOT NULL,
    pagina VARCHAR(50) NOT NULL,
    fechaComentario DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario)
);
