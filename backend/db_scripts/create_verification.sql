CREATE TABLE `musicloud_db`.`Verification` (
    `code` VARCHAR(64) UNIQUE NOT NULL PRIMARY KEY,
    `uid` INT NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid)
);