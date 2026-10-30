-- Структура бази даних AI-асистента для аналізу стартап-ідей
-- Запуск: спочатку вибрати базу (USE назва_бази;), потім виконати цей файл

-- Користувачі
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ідеї та результати аналізу за NABC
CREATE TABLE IF NOT EXISTS ideas (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    idea_text TEXT NOT NULL,
    need TEXT,
    approach TEXT,
    benefit TEXT,
    competition TEXT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY user_id (user_id),
    CONSTRAINT ideas_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;