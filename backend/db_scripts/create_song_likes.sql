CREATE TABLE `musicloud_db`.`Song_Likes` (
    `uid` INT NOT NULL,
    `sid` INT NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid),
    FOREIGN KEY (sid) REFERENCES Songs(sid)
);
