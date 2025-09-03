-- Create database if not exist
CREATE DATABASE IF NOT EXISTS `gestion_cartes_cadeaux` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Use the 'mydatabase' database
USE `gestion_cartes_cadeaux`;

-- Pour cohérence des FK
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1) ENTREPRISE (vendeur)
-- =====================================================================
CREATE TABLE entreprise (
                            id_entreprise       INT UNSIGNED NOT NULL AUTO_INCREMENT,
                            raison_sociale      VARCHAR(255) NOT NULL,
                            siren               CHAR(9) NOT NULL,
                            adresse_facturation TEXT NOT NULL,
                            tva_intracom        VARCHAR(20) NULL,
                            email_facturation   VARCHAR(255) NOT NULL,

                            PRIMARY KEY (id_entreprise),
                            UNIQUE KEY uk_entreprise_siren (siren)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 2) UTILISATEUR
-- =====================================================================
CREATE TABLE utilisateur (
                             id_user         INT UNSIGNED NOT NULL AUTO_INCREMENT,
                             id_entreprise   INT UNSIGNED NOT NULL,
                             email           VARCHAR(255) NOT NULL,
                             hash_mot_de_passe VARCHAR(255) NOT NULL,
                             role            ENUM('admin','employe') NOT NULL,
                             actif           TINYINT(1) NOT NULL DEFAULT 1,
                             derniere_connexion DATETIME NULL,

                             PRIMARY KEY (id_user),
                             UNIQUE KEY uk_utilisateur_email (email),
                             KEY idx_user_entreprise (id_entreprise),
                             CONSTRAINT fk_user_entreprise
                                 FOREIGN KEY (id_entreprise) REFERENCES entreprise(id_entreprise)
                                     ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 3) CLIENT (acheteur)
-- =====================================================================
CREATE TABLE client (
                        id_client      INT UNSIGNED NOT NULL AUTO_INCREMENT,
                        id_entreprise  INT UNSIGNED NOT NULL,
                        nom            VARCHAR(150) NOT NULL,
                        email          VARCHAR(255) NOT NULL,
                        adresse        TEXT NULL,

                        PRIMARY KEY (id_client),
                        KEY idx_client_entreprise (id_entreprise),
                        CONSTRAINT fk_client_entreprise
                            FOREIGN KEY (id_entreprise) REFERENCES entreprise(id_entreprise)
                                ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 4) INVITE (destinataire)
-- =====================================================================
CREATE TABLE invite (
                        id_invite  INT UNSIGNED NOT NULL AUTO_INCREMENT,
                        nom        VARCHAR(150) NULL,
                        email      VARCHAR(255) NOT NULL,

                        PRIMARY KEY (id_invite),
                        KEY idx_invite_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 5) PRODUIT (optionnel)
-- =====================================================================
CREATE TABLE produit (
                         id_produit     INT UNSIGNED NOT NULL AUTO_INCREMENT,
                         id_entreprise  INT UNSIGNED NOT NULL,
                         nom            VARCHAR(255) NOT NULL,
                         prix_ttc       DECIMAL(10,2) NOT NULL,
                         actif          TINYINT(1) NOT NULL DEFAULT 1,

                         PRIMARY KEY (id_produit),
                         KEY idx_produit_entreprise (id_entreprise),
                         CONSTRAINT fk_produit_entreprise
                             FOREIGN KEY (id_entreprise) REFERENCES entreprise(id_entreprise)
                                 ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 6) CARTE CADEAU
-- =====================================================================
CREATE TABLE carte_cadeau (
                              id_carte            INT UNSIGNED NOT NULL AUTO_INCREMENT,
                              id_entreprise       INT UNSIGNED NOT NULL,
                              id_client           INT UNSIGNED NOT NULL,
                              id_invite           INT UNSIGNED NOT NULL,
                              id_user_createur    INT UNSIGNED NOT NULL,
                              code                VARCHAR(64) NOT NULL,
                              type_valeur         ENUM('montant','panier_produits') NOT NULL,
                              montant_initial     DECIMAL(10,2) NULL,
                              montant_restant     DECIMAL(10,2) NOT NULL,
                              couleur             VARCHAR(50) NULL,
                              date_emission       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              date_expiration     DATE NOT NULL,
                              statut              ENUM('active','utilisee','expiree','annulee') NOT NULL DEFAULT 'active',

                              PRIMARY KEY (id_carte),
                              UNIQUE KEY uk_carte_code (code),
                              KEY idx_carte_entreprise (id_entreprise),
                              KEY idx_carte_client (id_client),
                              KEY idx_carte_invite (id_invite),
                              KEY idx_carte_user (id_user_createur),

                              CONSTRAINT fk_carte_entreprise
                                  FOREIGN KEY (id_entreprise) REFERENCES entreprise(id_entreprise)
                                      ON UPDATE CASCADE ON DELETE CASCADE,
                              CONSTRAINT fk_carte_client
                                  FOREIGN KEY (id_client) REFERENCES client(id_client)
                                      ON UPDATE CASCADE ON DELETE RESTRICT,
                              CONSTRAINT fk_carte_invite
                                  FOREIGN KEY (id_invite) REFERENCES invite(id_invite)
                                      ON UPDATE CASCADE ON DELETE RESTRICT,
                              CONSTRAINT fk_carte_user
                                  FOREIGN KEY (id_user_createur) REFERENCES utilisateur(id_user)
                                      ON UPDATE CASCADE ON DELETE RESTRICT,

    -- MySQL 8.0 applique bien les CHECK
                              CHECK (montant_restant >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 7) LIGNES PRODUIT (si type panier_produits)
-- =====================================================================
CREATE TABLE carte_ligne_produit (
                                     id_carte    INT UNSIGNED NOT NULL,
                                     id_produit  INT UNSIGNED NOT NULL,
                                     quantite    INT UNSIGNED NOT NULL,

                                     PRIMARY KEY (id_carte, id_produit),
                                     CONSTRAINT fk_clp_carte
                                         FOREIGN KEY (id_carte) REFERENCES carte_cadeau(id_carte)
                                             ON UPDATE CASCADE ON DELETE CASCADE,
                                     CONSTRAINT fk_clp_produit
                                         FOREIGN KEY (id_produit) REFERENCES produit(id_produit)
                                             ON UPDATE CASCADE ON DELETE RESTRICT,
                                     CHECK (quantite > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- 8) ENVOIS EMAIL (log)
-- =====================================================================
CREATE TABLE envoi_email (
                             id_email     INT UNSIGNED NOT NULL AUTO_INCREMENT,
                             id_carte     INT UNSIGNED NOT NULL,
                             dest_type    ENUM('client','invite') NOT NULL,
                             dest_email   VARCHAR(255) NOT NULL,
                             template_code VARCHAR(100) NOT NULL,
                             date_envoi   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             statut       ENUM('envoye','echec') NOT NULL,

                             PRIMARY KEY (id_email),
                             KEY idx_email_carte (id_carte),
                             CONSTRAINT fk_email_carte
                                 FOREIGN KEY (id_carte) REFERENCES carte_cadeau(id_carte)
                                     ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- VUES / INDEX UTILES (facultatif)
-- =====================================================================
-- Vue simple : solde des cartes actives
CREATE OR REPLACE VIEW v_cartes_actives AS
SELECT
    c.id_carte, c.code, c.montant_initial, c.montant_restant, c.date_expiration,
    c.statut, cl.nom AS client_nom, cl.email AS client_email, i.email AS invite_email
FROM carte_cadeau c
         JOIN client cl  ON cl.id_client = c.id_client
         JOIN invite i   ON i.id_invite  = c.id_invite
WHERE c.statut IN ('active');

-- Index pour recherche par code au comptoir
CREATE INDEX idx_carte_code_like ON carte_cadeau (code);
