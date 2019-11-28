CREATE TABLE `musicloud_db`.`Song_State` (
    `sid` INT NOT NULL,
    `state` JSON NOT NULL,
    `time_updated` DATETIME NOT NULL,
    FOREIGN KEY (sid) REFERENCES Songs(sid)
);
