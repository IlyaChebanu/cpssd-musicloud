CREATE TABLE `musicloud_db`.`Sample_Directory` (
    file_id INT UNIQUE NOT NULL PRIMARY KEY,
    `url` VARCHAR(3072) NOT NULL UNIQUE,
    `filename` VARCHAR(3072) NOT NULL,
    `directory` VARCHAR(3072) NOT NULL
);
