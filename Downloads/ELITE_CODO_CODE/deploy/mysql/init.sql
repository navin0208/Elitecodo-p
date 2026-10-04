-- ==========================================================
-- EliteCodo Database Initialization Script
-- ==========================================================

CREATE DATABASE IF NOT EXISTS elitecodo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE elitecodo_db;

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(20) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default application roles
INSERT IGNORE INTO roles (id, name) VALUES 
(1, 'ROLE_SUPER_ADMIN'),
(2, 'ROLE_ADMIN'),
(3, 'ROLE_TEACHER'),
(4, 'ROLE_STUDENT'),
(5, 'ROLE_PARENT'),
(6, 'ROLE_INSTITUTE');
