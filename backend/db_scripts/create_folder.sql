CREATE TABLE `musicloud_db`.`Folder` (
    `folder_id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `parent_id` INT DEFAULT NULL,
    `name` VARCHAR(3072) NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES Folder(folder_id) ON DELETE CASCADE
);
