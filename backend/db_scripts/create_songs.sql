CREATE TABLE `musicloud_db`.`Songs` (
    `sid` INT NOT NULL UNIQUE AUTO_INCREMENT,
    `uid` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `duration` INT NOT NULL,
    `created` DATETIME NOT NULL,
    `updated` DATETIME NOT NULL,
    `public` BOOLEAN NOT NULL DEFAULT 0,
    `state` JSON NOT NULL,
    `url` VARCHAR(255),
    `cover` VARCHAR(255),
    `genre` VARCHAR(50),
    PRIMARY KEY (`sid`),
    UNIQUE INDEX `uid_UNIQUE` (`sid` ASC)
);
