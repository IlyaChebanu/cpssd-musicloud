DROP TABLE `musicloud_db`.`Verification`;
DROP TABLE `musicloud_db`.`Song_Likes`;
DROP TABLE `musicloud_db`.`Song_Editors`;
DROP TABLE `musicloud_db`.`Resets`;
DROP TABLE `musicloud_db`.`Posts`;
DROP TABLE `musicloud_db`.`Logins`;
DROP TABLE `musicloud_db`.`Followers`;
DROP TABLE `musicloud_db`.`Song_State`;
DROP TABLE `musicloud_db`.`Playlist_State`;
DROP TABLE `musicloud_db`.`Notifications`;
DROP TABLE `musicloud_db`.`Playlists`;
DROP TABLE `musicloud_db`.`Songs`;
DROP TABLE `musicloud_db`.`Users`;


CREATE TABLE `musicloud_db`.`Users` (
    `uid` INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password` TEXT NOT NULL,
    `verified` TINYINT DEFAULT 0,
    `profiler` VARCHAR(255),
    `silence_follow_notifcation` TINYINT DEFAULT 0,
    `silence_post_notifcation` TINYINT DEFAULT 0,
    `silence_song_notifcation` TINYINT DEFAULT 0,
    `silence_like_notifcation` TINYINT DEFAULT 0
);

CREATE TABLE `musicloud_db`.`Songs` (
    `sid` INT NOT NULL UNIQUE AUTO_INCREMENT PRIMARY KEY,
    `uid` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `duration` INT NOT NULL,
    `created` DATETIME NOT NULL,
    `public` TINYINT NOT NULL DEFAULT 0,
    `published` DATETIME,
    `url` VARCHAR(255),
    `cover` VARCHAR(255),
    `genre` VARCHAR(50),
    FOREIGN KEY (uid) REFERENCES Users(uid)
);

CREATE TABLE `musicloud_db`.`Verification` (
    `code` VARCHAR(64) UNIQUE NOT NULL PRIMARY KEY,
    `uid` INT NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid)
);

CREATE TABLE `musicloud_db`.`Song_Likes` (
    `uid` INT NOT NULL,
    `sid` INT NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid),
    FOREIGN KEY (sid) REFERENCES Songs(sid)
);

CREATE TABLE `musicloud_db`.`Song_Editors` (
    `sid` INT NOT NULL,
    `uid` INT NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid),
    FOREIGN KEY (sid) REFERENCES Songs(sid)
);

CREATE TABLE `musicloud_db`.`Resets` (
    `uid` INT NOT NULL UNIQUE PRIMARY KEY,
    `code` INT NOT NULL,
    `time_issued` DATETIME NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid)
);

CREATE TABLE `musicloud_db`.`Posts` (
    `uid` INT NOT NULL,
    `message` VARCHAR(21844) NOT NULL,
    `time` DATETIME NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid)
);

CREATE TABLE `musicloud_db`.`Logins` (
    `uid` INT NOT NULL,
    `access_token` TEXT NOT NULL,
    `time_issued` DATETIME NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid)
);

CREATE TABLE `musicloud_db`.`Followers` (
    `follower` INT NOT NULL,
    `following` INT NOT NULL,
    FOREIGN KEY (following) REFERENCES Users(uid),
    FOREIGN KEY (follower) REFERENCES Users(uid)
);

CREATE TABLE `musicloud_db`.`Song_State` (
    `sid` INT NOT NULL,
    `state` JSON NOT NULL,
    `time_updated` DATETIME NOT NULL,
    FOREIGN KEY (sid) REFERENCES Songs(sid)
);

CREATE TABLE `musicloud_db`.`Playlists` (
    `pid` INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `uid` INT NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES Users(uid)
);

CREATE TABLE `musicloud_db`.`Playlist_State` (
    `pid` INT  NOT NULL,
    `sid` INT NOT NULL,
    FOREIGN KEY (sid) REFERENCES Songs(sid),
    FOREIGN KEY (pid) REFERENCES Playlists(pid)
);

CREATE TABLE `musicloud_db`.`Notifications` (
    `did` VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
    `uid` INT NOT NULL,
    FOREIGN KEY (uid) REFERENCES Users(uid)
);
