-- Use the 'mydatabase' database
USE `gestion_cartes_cadeaux`;

-- Pour cohérence des FK
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- =====================================================================
-- 9) MODELE DE CARTE
-- =====================================================================
CREATE TABLE carte_modele (
                              id_modele       INT UNSIGNED NOT NULL AUTO_INCREMENT,
                              nom             VARCHAR(100) NOT NULL,         -- ex : "Classique doré", "Minimaliste"
                              description     TEXT NULL,                     -- texte explicatif pour l’UI
                              fond_couleur    VARCHAR(20) NULL,              -- ex: #FFFFFF ou "bleu_pastel"
                              illustration    VARCHAR(255) NULL,             -- chemin vers image ou asset
                              police          VARCHAR(100) NULL,             -- ex: "Roboto Bold"
                              actif           TINYINT(1) NOT NULL DEFAULT 1, -- modèle dispo ou pas

                              PRIMARY KEY (id_modele)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 10) personnalisation de carte
-- =====================================================================
CREATE TABLE carte_personnalisation (
                                        id_personnalisation INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                        id_carte            INT UNSIGNED NOT NULL,
                                        id_modele           INT UNSIGNED NOT NULL,

                                        couleur_fond        VARCHAR(20) NULL,          -- si client choisit une variante
                                        illustration        VARCHAR(255) NULL,         -- custom si différent du modèle
                                        message_perso       TEXT NULL,                 -- texte perso imprimé
                                        police              VARCHAR(100) NULL,         -- police choisie
                                        autres_options_json JSON NULL,                 -- flexibilité : stickers, layout, etc.

                                        PRIMARY KEY (id_personnalisation),
                                        UNIQUE KEY uk_personnalisation_carte (id_carte), -- 1 personnalisation par carte
                                        CONSTRAINT fk_perso_carte
                                            FOREIGN KEY (id_carte) REFERENCES carte_cadeau(id_carte)
                                                ON UPDATE CASCADE ON DELETE CASCADE,
                                        CONSTRAINT fk_perso_modele
                                            FOREIGN KEY (id_modele) REFERENCES carte_modele(id_modele)
                                                ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
