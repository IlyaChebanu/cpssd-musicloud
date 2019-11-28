CREATE TABLE `musicloud_db`.`Resets` (
    `uid` INT NOT NULL UNIQUE PRIMARY KEY,
    `code` INT NOT NULL,
    `time_issued` DATETIME NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid)
);
