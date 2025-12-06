-- 1. ROLES (Reincorporado)
-- Define si es un usuario normal o un super-admin
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE -- 'admin', 'user'
);

-- Insertamos los roles base de una vez
INSERT INTO roles (name) VALUES ('admin'), ('user');

-- 2. USUARIOS
-- Vinculado a un rol
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT DEFAULT 2, -- Por defecto '2' seria 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. PROYECTOS (Personal)
-- Pertenece a un solo usuario
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. TAREAS
-- Pertenece al proyecto (y por transitividad al usuario)
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'review', 'completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 5. ETIQUETAS (TAGS)
-- Personales por usuario
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    name VARCHAR(30) NOT NULL,
    color VARCHAR(7),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. TAREAS_ETIQUETAS
CREATE TABLE task_tags (
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);