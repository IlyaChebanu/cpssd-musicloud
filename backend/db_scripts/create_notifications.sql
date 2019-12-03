CREATE TABLE `musicloud_db`.`Notifications` (
    `did` INT NOT NULL UNIQUE PRIMARY KEY,
    `uid` INT NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid)
);