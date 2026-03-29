import { 
  FlaskConical, 
  History, 
  Building2, 
  UserCog, 
  GraduationCap, 
  TestTubes, 
  ClipboardCheck, 
  Scale, 
  Landmark,
  Users,
  Briefcase,
  Wrench,
  Activity,
  CheckSquare,
  FileText
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "datetime-local";
  required?: boolean;
  isPrimaryKey?: boolean;
}

export interface EntityConfig {
  key: string;
  table: string;
  label: string;
  icon: LucideIcon;
  fields: FieldConfig[];
}

export const entities: EntityConfig[] = [
  {
    key: "user",
    table: "user",
    label: "Utilisateur",
    icon: Users,
    fields: [
      { name: "id", label: "ID Utilisateur", type: "number", isPrimaryKey: true },
      { name: "nom_user", label: "Nom Utilisateur", type: "text", required: true },
      { name: "password", label: "Mot de passe", type: "text", required: true },
      { name: "ip_adress", label: "Adresse IP", type: "text" },
    ],
  },
  {
    key: "organisme",
    table: "organisme",
    label: "Organisme",
    icon: Landmark,
    fields: [
      { name: "id", label: "ID Organisme", type: "number", isPrimaryKey: true },
      { name: "nom_organisme", label: "Nom Organisme", type: "text", required: true },
      { name: "lieu_organisme", label: "Lieu", type: "text" },
      { name: "contact_organisme", label: "Contact", type: "text" },
    ],
  },
  {
    key: "laboratoire",
    table: "laboratoire",
    label: "Laboratoire",
    icon: Building2,
    fields: [
      { name: "id", label: "ID Laboratoire", type: "number", isPrimaryKey: true },
      { name: "nom_labo", label: "Nom Laboratoire", type: "text", required: true },
      { name: "lieu_labo", label: "Lieu", type: "text" },
      { name: "contact_labo", label: "Contact", type: "text" },
      { name: "region", label: "Région", type: "text" },
      { name: "id_user", label: "ID Utilisateur", type: "number", required: true },
    ],
  },
  {
    key: "echantillon",
    table: "echantillon",
    label: "Échantillon",
    icon: FlaskConical,
    fields: [
      { name: "id", label: "ID Échantillon", type: "number", isPrimaryKey: true },
      { name: "code", label: "Code", type: "text", required: true },
      { name: "type_carburant", label: "Type Carburant", type: "text" },
      { name: "date_prelevement", label: "Date Prélèvement", type: "date" },
      { name: "etat_echant", label: "État", type: "text" },
      { name: "lieu_prelevement", label: "Lieu Prélèvement", type: "text" },
      { name: "quantite", label: "Quantité", type: "number" },
      { name: "etiquetage", label: "Étiquetage", type: "text" },
      { name: "recipiant", label: "Récipient", type: "text" },
      { name: "decision_de_recevabilite", label: "Décision Recevabilité", type: "text" },
      { name: "date_reception", label: "Date Réception", type: "date" },
      { name: "conforme_echant", label: "Conforme", type: "boolean" },
      { name: "id_laboratoire", label: "ID Laboratoire", type: "number", required: true },
      { name: "id_organisme", label: "ID Organisme", type: "number", required: true },
    ],
  },
  {
    key: "laboriste",
    table: "laboriste",
    label: "Laboriste",
    icon: UserCog,
    fields: [
      { name: "id", label: "ID Laboriste", type: "number", isPrimaryKey: true },
      { name: "matricule", label: "Matricule", type: "text", required: true },
      { name: "nom_laboriste", label: "Nom Laboriste", type: "text", required: true },
      { name: "prenom", label: "Prénom", type: "text" },
      { name: "sexe", label: "Sexe", type: "text" },
      { name: "date_de_naissance", label: "Date Naissance", type: "date" },
      { name: "lieu_de_naissance", label: "Lieu Naissance", type: "text" },
      { name: "id_laboratoire", label: "ID Laboratoire", type: "number", required: true },
    ],
  },
  {
    key: "diplome",
    table: "diplome",
    label: "Diplôme",
    icon: GraduationCap,
    fields: [
      { name: "id", label: "ID Diplôme", type: "number", isPrimaryKey: true },
      { name: "nom_diplome", label: "Nom Diplôme", type: "text", required: true },
      { name: "specialite", label: "Spécialité", type: "text" },
    ],
  },
  {
    key: "obtenir",
    table: "obtenir",
    label: "Obtention Diplôme",
    icon: FileText,
    fields: [
      { name: "id", label: "ID Obtention", type: "number", isPrimaryKey: true },
      { name: "id_laboriste", label: "ID Laboriste", type: "number", required: true },
      { name: "id_diplome", label: "ID Diplôme", type: "number", required: true },
      { name: "lieu_diplome", label: "Lieu Diplôme", type: "text" },
      { name: "date_diplome", label: "Date Diplôme", type: "date" },
    ],
  },
  {
    key: "emploie",
    table: "emploie",
    label: "Emploi",
    icon: Briefcase,
    fields: [
      { name: "id", label: "ID Emploi", type: "number", isPrimaryKey: true },
      { name: "id_laboriste", label: "ID Laboriste", type: "number", required: true },
      { name: "id_laboratoire", label: "ID Laboratoire", type: "number", required: true },
      { name: "date_de_join", label: "Date d'Entrée", type: "date" },
      { name: "date_de_sortie", label: "Date de Sortie", type: "date" },
    ],
  },
  {
    key: "processus_analyse",
    table: "processus_analyse",
    label: "Processus d'Analyse",
    icon: TestTubes,
    fields: [
      { name: "id", label: "ID Analyse", type: "number", isPrimaryKey: true },
      { name: "nom_analyse", label: "Nom de l'Analyse", type: "text", required: true },
      { name: "type_analyse", label: "Type d'Analyse", type: "text" },
      { name: "date_analyse", label: "Date d'Analyse", type: "date" },
      { name: "id_echantillon", label: "ID Échantillon", type: "number", required: true },
    ],
  },
  {
    key: "equipement",
    table: "equipement",
    label: "Équipement",
    icon: Wrench,
    fields: [
      { name: "id", label: "ID Équipement", type: "number", isPrimaryKey: true },
      { name: "nom_equipement", label: "Nom Équipement", type: "text", required: true },
      { name: "categorie", label: "Catégorie", type: "text" },
      { name: "marque_equipement", label: "Marque", type: "text" },
      { name: "N_serie", label: "N° de Série", type: "text" },
      { name: "etat_equipement", label: "État (Actif)", type: "boolean" },
      { name: "date_de_depart", label: "Date de Départ", type: "date" },
      { name: "id_laboratoire", label: "ID Laboratoire", type: "number" },
    ],
  },
  {
    key: "effectuer",
    table: "effectuer",
    label: "Effectuer Analyse",
    icon: CheckSquare,
    fields: [
      { name: "id_analyse", label: "ID Analyse", type: "number", required: true },
      { name: "id_laboriste", label: "ID Laboriste", type: "number", required: true },
      { name: "id_equipement", label: "ID Équipement", type: "number", required: true },
      { name: "date_analyse", label: "Date d'Analyse", type: "date" },
      { name: "observation_analyse", label: "Observation", type: "text" },
    ],
  },
  {
    key: "etalonnage",
    table: "etalonnage",
    label: "Étalonnage",
    icon: Activity,
    fields: [
      { name: "id", label: "ID Étalonnage", type: "number", isPrimaryKey: true },
      { name: "nom_etalonnage", label: "Nom Étalonnage", type: "text", required: true },
      { name: "specification_etalonnage", label: "Spécification", type: "text" },
      { name: "id_equipement", label: "ID Équipement", type: "number", required: true },
    ],
  },
  {
    key: "effectuer_etalonnage",
    table: "effectuer_etalonnage",
    label: "Effectuer Étalonnage",
    icon: Activity,
    fields: [
      { name: "id_etalonnage", label: "ID Étalonnage", type: "number", required: true },
      { name: "id_equipement", label: "ID Équipement", type: "number", required: true },
      { name: "date_etalonnage", label: "Date Étalonnage", type: "date", required: true },
      { name: "obs", label: "Observation", type: "text" },
      { name: "reserve_etalonnage", label: "Réserve Étalonnage", type: "text" },
    ],
  },
  {
    key: "norme",
    table: "norme",
    label: "Norme",
    icon: Scale,
    fields: [
      { name: "id", label: "ID Norme", type: "number", isPrimaryKey: true },
      { name: "nom_norme", label: "Nom Norme", type: "text", required: true },
      { name: "date_norme", label: "Date Norme", type: "date" },
      { name: "national", label: "National", type: "boolean" },
    ],
  },
  {
    key: "resultat",
    table: "resultat",
    label: "Résultat",
    icon: ClipboardCheck,
    fields: [
      { name: "id", label: "ID Résultat", type: "number", isPrimaryKey: true },
      { name: "id_analyse", label: "ID Analyse", type: "number", required: true },
      { name: "id_norme", label: "ID Norme", type: "number" },
      { name: "conforme_analyse", label: "Conforme", type: "boolean" },
      { name: "date_resultat", label: "Date Résultat", type: "date" },
      { name: "validite_resultat", label: "Validité Résultat", type: "text" },
      { name: "bulletin_analyse", label: "Bulletin d'Analyse", type: "text" },
      { name: "remarque", label: "Remarque", type: "text" },
    ],
  },
  {
    key: "historique",
    table: "historique",
    label: "Historique",
    icon: History,
    fields: [
      { name: "id", label: "ID Hist", type: "number", isPrimaryKey: true },
      { name: "user_id", label: "ID User", type: "number" },
      { name: "action", label: "Action", type: "text", required: true },
      { name: "date_action", label: "Date Action", type: "datetime-local" },
      { name: "email", label: "Email", type: "text" },
      { name: "message", label: "Message", type: "text" },
      { name: "adresse_ip", label: "Adresse IP", type: "text" },
      { name: "is_alert", label: "Alerte", type: "boolean" }
    ],
  },
];
