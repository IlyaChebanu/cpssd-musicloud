CREATE TABLE `musicloud_db`.`Verification` (
    `code` VARCHAR(64) UNIQUE NOT NULL,
    `uid` INT NOT NULL,
    PRIMARY KEY (`code`)
);