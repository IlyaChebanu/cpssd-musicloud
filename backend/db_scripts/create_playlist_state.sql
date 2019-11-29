CREATE TABLE `musicloud_db`.`Playlist_State` (
    `pid` INT  NOT NULL,
    `sid` INT NOT NULL,
    FOREIGN KEY (sid) REFERENCES Songs(sid),
    FOREIGN KEY (pid) REFERENCES Playlists(pid)
);