DROP TABLE `musicloud_db`.`Verification`;
DROP TABLE `musicloud_db`.`Users`;
DROP TABLE `musicloud_db`.`Songs`;
DROP TABLE `musicloud_db`.`Song_Likes`;
DROP TABLE `musicloud_db`.`Song_Editors`;
DROP TABLE `musicloud_db`.`Resets`;
DROP TABLE `musicloud_db`.`Posts`;
DROP TABLE `musicloud_db`.`Logins`;
DROP TABLE `musicloud_db`.`Followers`;
DROP TABLE `musicloud_db`.`Song_State`;

CREATE TABLE `musicloud_db`.`Verification` (
    `code` VARCHAR(64) UNIQUE NOT NULL,
    `uid` INT NOT NULL,
    PRIMARY KEY (`code`)
);

CREATE TABLE `musicloud_db`.`Users` (
    `uid` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL,
    `verified` TINYINT DEFAULT 0,
    PRIMARY KEY (`uid`),
    UNIQUE INDEX `uid_UNIQUE` (`uid` ASC)
);

CREATE TABLE `musicloud_db`.`Songs` (
    `sid` INT NOT NULL UNIQUE AUTO_INCREMENT,
    `uid` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `duration` INT NOT NULL,
    `created` DATETIME NOT NULL,
    `public` TINYINT NOT NULL DEFAULT 0,
    `url` VARCHAR(255),
    `cover` VARCHAR(255),
    `genre` VARCHAR(50),
    PRIMARY KEY (`sid`),
    UNIQUE INDEX `uid_UNIQUE` (`sid` ASC)
);

CREATE TABLE `musicloud_db`.`Song_Likes` (
    `uid` INT NOT NULL,
    `sid` INT NOT NULL
);

CREATE TABLE `musicloud_db`.`Song_Editors` (
    `sid` INT NOT NULL,
    `uid` INT NOT NULL
);

CREATE TABLE `musicloud_db`.`Resets` (
    `uid` INT NOT NULL UNIQUE PRIMARY KEY,
    `code` INT NOT NULL,
    `time_issued` DATETIME NOT NULL
);

CREATE TABLE `musicloud_db`.`Posts` (
    `uid` INT NOT NULL,
    `message` VARCHAR(21844) NOT NULL,
    `time` DATETIME NOT NULL
);

CREATE TABLE `musicloud_db`.`Logins` (
    `uid` INT NOT NULL,
    `access_token` TEXT NOT NULL,
    `time_issued` DATETIME NOT NULL
);

CREATE TABLE `musicloud_db`.`Followers` (
    `follower` INT NOT NULL,
    `following` INT NOT NULL
);

CREATE TABLE `musicloud_db`.`Song_State` (
    `sid` INT NOT NULL,
    `state` JSON NOT NULL,
    `time_updated` DATETIME NOT NULL
);
