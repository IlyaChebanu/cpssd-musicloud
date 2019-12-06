CREATE TABLE `musicloud_db`.`Song_Editors` (
    `sid` INT NOT NULL,
    `uid` INT NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid),
    FOREIGN KEY (sid) REFERENCES Songs(sid)
);
