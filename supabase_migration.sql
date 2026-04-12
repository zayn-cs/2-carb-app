-- PostgreSQL Migration Script for Supabase

CREATE TABLE IF NOT EXISTS laboratoire (
  id_laboratoire SERIAL PRIMARY KEY,
  nom_labo TEXT NOT NULL,
  lieu_labo TEXT,
  contact_labo TEXT,
  region TEXT
);

CREATE TABLE IF NOT EXISTS organisme (
  id_organisme SERIAL PRIMARY KEY,
  nom_organisme TEXT NOT NULL,
  adresse_organisme TEXT,
  contact_organisme TEXT,
  lieu_organisme TEXT
);

CREATE TABLE IF NOT EXISTS utilisateur (
  id_user SERIAL PRIMARY KEY,
  nom_user TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  ip_address TEXT,
  id_laboratoire INTEGER REFERENCES laboratoire(id_laboratoire) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS echantillon (
  id_echantillon SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type_carburant TEXT,
  date_prelevement DATE,
  etat_echant TEXT,
  lieu_prelevement INTEGER,
  quantite NUMERIC,
  etiquetage TEXT,
  recipent BOOLEAN,
  decision_de_recevabilite TEXT,
  date_reception DATE,
  conforme_echant BOOLEAN,
  id_laboratoire INTEGER REFERENCES laboratoire(id_laboratoire) ON DELETE CASCADE,
  id_organisme INTEGER REFERENCES organisme(id_organisme) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS laboriste (
  id_laboriste SERIAL PRIMARY KEY,
  matricule INTEGER UNIQUE NOT NULL,
  nom_laboriste TEXT NOT NULL,
  prenom TEXT,
  sexe TEXT,
  date_naissance DATE,
  lieu_naissance TEXT,
  id_laboratoire INTEGER REFERENCES laboratoire(id_laboratoire) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diplome (
  id_diplome SERIAL PRIMARY KEY,
  nom_diplome TEXT NOT NULL,
  specialite TEXT
);

CREATE TABLE IF NOT EXISTS obtenir (
  id_laboriste INTEGER REFERENCES laboriste(id_laboriste) ON DELETE CASCADE,
  id_diplome INTEGER REFERENCES diplome(id_diplome) ON DELETE CASCADE,
  lieu_diplome TEXT,
  date_diplome DATE,
  PRIMARY KEY (id_laboriste, id_diplome)
);

CREATE TABLE IF NOT EXISTS norme (
  id_norme SERIAL PRIMARY KEY,
  nom_norme TEXT NOT NULL,
  date_norme DATE,
  national BOOLEAN
);

CREATE TABLE IF NOT EXISTS processus_analyse (
  id_analyse SERIAL PRIMARY KEY,
  nom_analyse TEXT NOT NULL,
  type_analyse TEXT,
  id_norme INTEGER REFERENCES norme(id_norme) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS resultat (
  id_resultat SERIAL PRIMARY KEY,
  conforme_analyse BOOLEAN,
  remarque TEXT,
  bulletin_analyse TEXT,
  validite_resultat TEXT,
  date_resultat DATE,
  id_analyse INTEGER REFERENCES processus_analyse(id_analyse) ON DELETE CASCADE,
  id_echantillon INTEGER REFERENCES echantillon(id_echantillon) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS equipement (
  id_equipement SERIAL PRIMARY KEY,
  nom_equipement TEXT NOT NULL,
  categorie TEXT,
  marque_equipement TEXT,
  marque TEXT,
  etat_equipement BOOLEAN,
  date_depart DATE,
  id_laboratoire INTEGER REFERENCES laboratoire(id_laboratoire) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS etalonnage (
  id_etalonnage SERIAL PRIMARY KEY,
  nom_etalonnage TEXT NOT NULL,
  specification_etalonnage TEXT
);

CREATE TABLE IF NOT EXISTS effectuer_analyse (
  id_echantillon INTEGER REFERENCES echantillon(id_echantillon) ON DELETE CASCADE,
  id_analyse INTEGER REFERENCES processus_analyse(id_analyse) ON DELETE CASCADE,
  id_laboriste INTEGER REFERENCES laboriste(id_laboriste) ON DELETE CASCADE,
  observation_analyse TEXT,
  date_analyse DATE,
  PRIMARY KEY (id_echantillon, id_analyse, id_laboriste)
);

CREATE TABLE IF NOT EXISTS effectuer_etalonnage (
  id_equipement INTEGER REFERENCES equipement(id_equipement) ON DELETE CASCADE,
  id_etalonnage INTEGER REFERENCES etalonnage(id_etalonnage) ON DELETE CASCADE,
  date_etalonnage DATE,
  observation TEXT,
  reserve_etalonnage TEXT,
  PRIMARY KEY (id_equipement, id_etalonnage)
);

CREATE TABLE IF NOT EXISTS comparer_norme (
  id_analyse INTEGER REFERENCES processus_analyse(id_analyse) ON DELETE CASCADE,
  id_norme INTEGER REFERENCES norme(id_norme) ON DELETE CASCADE,
  PRIMARY KEY (id_analyse, id_norme)
);

CREATE TABLE IF NOT EXISTS historique (
  id_historique NUMERIC PRIMARY KEY,
  action TEXT NOT NULL,
  date_action TIMESTAMP,
  adresse_ip TEXT,
  nom_connexion TEXT,
  user_id NUMERIC,
  message TEXT,
  is_alert INTEGER
);

CREATE TABLE IF NOT EXISTS emploie (
  id_emploie SERIAL PRIMARY KEY,
  date_join DATE NOT NULL,
  date_sortie DATE,
  id_laboratoire INTEGER REFERENCES laboratoire(id_laboratoire) ON DELETE CASCADE,
  id_laboriste INTEGER REFERENCES laboriste(id_laboriste) ON DELETE CASCADE
);
