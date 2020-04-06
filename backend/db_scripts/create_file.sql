CREATE TABLE `musicloud_db`.`File` (
    `file_id` INT UNIQUE NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `folder_id` INT NOT NULL,
    `name` VARCHAR(3072) NOT NULL,
    `url` VARCHAR(3072) NOT NULL,
    FOREIGN KEY (folder_id) REFERENCES Folder(folder_id) ON DELETE CASCADE
);
