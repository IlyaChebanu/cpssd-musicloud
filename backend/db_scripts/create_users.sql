CREATE TABLE `musicloud_db`.`Users` (
    `uid` INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` TEXT NOT NULL,
    `verified` TINYINT DEFAULT 0,
    `profiler` VARCHAR(255),
    `silence_follow_notifcation` TINYINT DEFAULT 0,
    `silence_post_notifcation` TINYINT DEFAULT 0,
    `silence_song_notifcation` TINYINT DEFAULT 0,
    `silence_like_notifcation` TINYINT DEFAULT 0
);
