-- Use the 'mydatabase' database
USE `gestion_cartes_cadeaux`;
ALTER TABLE `client` ADD `telephone` VARCHAR(25) NULL AFTER `adresse`, ADD `Appartement` VARCHAR(255) NULL AFTER `telephone`, ADD `code_postal` VARCHAR(20) NULL AFTER `Appartement`, ADD `ville` VARCHAR(150) NULL AFTER `code_postal`, ADD `pays` VARCHAR(150) NULL AFTER `ville`;


-- mysql -u "carteKado_user" -p"so_complicate_passwd" gestion_cartes_cadeaux < script_
