CREATE TABLE `musicloud_db`.`Users` (
    `uid` INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL,
    `verified` TINYINT DEFAULT 0,
    `profiler` VARCHAR(255)
);
