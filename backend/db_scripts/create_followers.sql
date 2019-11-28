CREATE TABLE `musicloud_db`.`Followers` (
    `follower` INT NOT NULL,
    `following` INT NOT NULL,
    FOREIGN KEY (following) REFERENCES Users(uid),
    FOREIGN KEY (follower) REFERENCES Users(uid)
);
