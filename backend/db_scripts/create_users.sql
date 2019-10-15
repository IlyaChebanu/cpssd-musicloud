CREATE TABLE `musicloud_db`.`Users` (
    `uid` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(100) NOT NULL,
    `verified` TINYINT DEFAULT 0,
    PRIMARY KEY (`uid`),
    UNIQUE INDEX `uid_UNIQUE` (`uid` ASC)
);
