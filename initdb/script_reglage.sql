USE `gestion_cartes_cadeaux`;

-- Pour cohérence des FK
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- =====================================================================
-- 9) MODELE DE CARTE
-- =====================================================================
CREATE TABLE reglage (
                              id_reglage       INT UNSIGNED NOT NULL AUTO_INCREMENT,
                              id_entreprise            INT UNSIGNED NOT NULL,
                              nom_boutique             VARCHAR(255) NOT NULL,         -- ex : "Classique doré", "Minimaliste"
                              couleur    VARCHAR(20) NULL,              -- ex: #FFFFFF ou "bleu_pastel"
                              logo    VARCHAR(255) NULL,             -- chemin vers image ou asset
                              liste_montants VARCHAR(255) NOT NULL,
                              PRIMARY KEY (id_reglage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 10) personnalisation de carte
-- =====================================================================
CREATE TABLE ligne_reglage_produit (
                                        id_ligne INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                        id_reglage            INT UNSIGNED NOT NULL,
                                        id_produit           INT UNSIGNED NOT NULL,

                                                   -- flexibilité : stickers, layout, etc.

                                        PRIMARY KEY (id_ligne),
                                        CONSTRAINT fk_ligne_reglage
                                            FOREIGN KEY (id_reglage) REFERENCES reglage(id_reglage)
                                                ON UPDATE CASCADE ON DELETE RESTRICT ,
                                        CONSTRAINT fk_ligne_produitr
                                            FOREIGN KEY (id_produit) REFERENCES produit(id_produit)
                                                ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
