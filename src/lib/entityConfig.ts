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
  FileText,
  Search
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "datetime-local";
  required?: boolean;
  isPrimaryKey?: boolean;
  foreignKey?: {
    entity: string;
    displayField: string;
  };
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
    table: "utilisateur",
    label: "Utilisateur",
    icon: Users,
    fields: [
      { name: "id_user", label: "ID Utilisateur", type: "number", isPrimaryKey: true },
      { name: "nom_user", label: "Nom Utilisateur", type: "text", required: true },
      { name: "password", label: "Mot de passe", type: "text", required: true },
      { name: "ip_address", label: "Adresse IP", type: "text" },
    ],
  },
  {
    key: "organisme",
    table: "organisme",
    label: "Organisme",
    icon: Landmark,
    fields: [
      { name: "id_organisme", label: "ID Organisme", type: "number", isPrimaryKey: true },
      { name: "nom_organisme", label: "Nom Organisme", type: "text", required: true },
      { name: "adresse_organisme", label: "Adresse", type: "text" },
      { name: "contact_organisme", label: "Contact", type: "text" },
      { name: "lieu_organisme", label: "Lieu", type: "text" },
    ],
  },
  {
    key: "laboratoire",
    table: "laboratoire",
    label: "Laboratoire",
    icon: Building2,
    fields: [
      { name: "id_laboratoire", label: "ID Laboratoire", type: "number", isPrimaryKey: true },
      { name: "nom_labo", label: "Nom Laboratoire", type: "text", required: true },
      { name: "lieu_labo", label: "Lieu", type: "text" },
      { name: "contact_labo", label: "Contact", type: "text" },
      { name: "region", label: "Région", type: "text" },
      { 
        name: "id_organisme", 
        label: "Organisme", 
        type: "number", 
        required: true,
        foreignKey: { entity: "organisme", displayField: "nom_organisme" }
      },
    ],
  },
  {
    key: "echantillon",
    table: "echantillon",
    label: "Échantillon",
    icon: FlaskConical,
    fields: [
      { name: "id_echantillon", label: "ID Échantillon", type: "number", isPrimaryKey: true },
      { name: "code", label: "Code", type: "text", required: true },
      { name: "type_carburant", label: "Type Carburant", type: "text" },
      { name: "date_prelevement", label: "Date Prélèvement", type: "date" },
      { name: "etat_echant", label: "État", type: "text" },
      { name: "lieu_prelevement", label: "Lieu Prélèvement", type: "number" },
      { name: "quantite", label: "Quantité", type: "number" },
      { name: "etiquetage", label: "Étiquetage", type: "text" },
      { name: "recipent", label: "Récipient", type: "boolean" },
      { name: "decision_de_recevabilite", label: "Décision Recevabilité", type: "text" },
      { name: "date_reception", label: "Date Réception", type: "date" },
      { name: "conforme_echant", label: "Conforme", type: "boolean" },
      { 
        name: "id_laboratoire", 
        label: "Laboratoire", 
        type: "number", 
        required: true,
        foreignKey: { entity: "laboratoire", displayField: "nom_labo" }
      },
    ],
  },
  {
    key: "laboriste",
    table: "laboriste",
    label: "Laboriste",
    icon: UserCog,
    fields: [
      { name: "id_laboriste", label: "ID Laboriste", type: "number", isPrimaryKey: true },
      { name: "matricule", label: "Matricule", type: "number", required: true },
      { name: "nom_laboriste", label: "Nom", type: "text", required: true },
      { name: "prenom", label: "Prénom", type: "text" },
      { name: "sexe", label: "Sexe", type: "text" },
      { name: "date_naissance", label: "Date Naissance", type: "date" },
      { name: "lieu_naissance", label: "Lieu Naissance", type: "text" },
      { 
        name: "id_laboratoire", 
        label: "Laboratoire", 
        type: "number", 
        required: true,
        foreignKey: { entity: "laboratoire", displayField: "nom_labo" }
      },
    ],
  },
  {
    key: "diplome",
    table: "diplome",
    label: "Diplôme",
    icon: GraduationCap,
    fields: [
      { name: "id_diplome", label: "ID Diplôme", type: "number", isPrimaryKey: true },
      { name: "nom_diplome", label: "Nom Diplôme", type: "text", required: true },
      { name: "specialite", label: "Spécialité", type: "text" },
    ],
  },
  {
    key: "obtenir",
    table: "obtenir",
    label: "Obtenir Diplôme",
    icon: FileText,
    fields: [
      { name: "id_laboriste", label: "Laboriste", type: "number", isPrimaryKey: true, foreignKey: { entity: "laboriste", displayField: "nom_laboriste" } },
      { name: "id_diplome", label: "Diplôme", type: "number", isPrimaryKey: true, foreignKey: { entity: "diplome", displayField: "nom_diplome" } },
      { name: "lieu_diplome", label: "Lieu Diplôme", type: "text" },
      { name: "date_diplome", label: "Date Diplôme", type: "date" },
    ],
  },
  {
    key: "processus_analyse",
    table: "processus_analyse",
    label: "Processus d'Analyse",
    icon: TestTubes,
    fields: [
      { name: "id_analyse", label: "ID Analyse", type: "number", isPrimaryKey: true },
      { name: "nom_analyse", label: "Nom Analyse", type: "text", required: true },
      { name: "type_analyse", label: "Type Analyse", type: "text" },
    ],
  },
  {
    key: "resultat",
    table: "resultat",
    label: "Résultat",
    icon: ClipboardCheck,
    fields: [
      { name: "id_resultat", label: "ID Résultat", type: "number", isPrimaryKey: true },
      { name: "conforme_analyse", label: "Conforme", type: "boolean" },
      { name: "remarque", label: "Remarque", type: "text" },
      { name: "bulletin_analyse", label: "Bulletin", type: "text" },
      { name: "validite_resultat", label: "Validité", type: "text" },
      { name: "date_resultat", label: "Date Résultat", type: "date" },
      { 
        name: "id_analyse", 
        label: "Analyse", 
        type: "number", 
        required: true,
        foreignKey: { entity: "processus_analyse", displayField: "nom_analyse" }
      },
    ],
  },
  {
    key: "equipement",
    table: "equipement",
    label: "Équipement",
    icon: Wrench,
    fields: [
      { name: "id_equipement", label: "ID Équipement", type: "number", isPrimaryKey: true },
      { name: "nom_equipement", label: "Nom Équipement", type: "text", required: true },
      { name: "categorie", label: "Catégorie", type: "text" },
      { name: "marque_equipement", label: "Marque (Short)", type: "text" },
      { name: "marque", label: "Marque (Full)", type: "text" },
      { name: "etat_equipement", label: "État", type: "boolean" },
      { name: "date_depart", label: "Date Départ", type: "date" },
    ],
  },
  {
    key: "etalonnage",
    table: "etalonnage",
    label: "Étalonnage",
    icon: Activity,
    fields: [
      { name: "id_etalonnage", label: "ID Étalonnage", type: "number", isPrimaryKey: true },
      { name: "nom_etalonnage", label: "Nom Étalonnage", type: "text", required: true },
      { name: "specification_etalonnage", label: "Spécification", type: "text" },
    ],
  },
  {
    key: "effectuer",
    table: "effectuer_analyse",
    label: "Effectuer Analyse",
    icon: CheckSquare,
    fields: [
      { name: "id_echantillon", label: "Échantillon", type: "number", isPrimaryKey: true, foreignKey: { entity: "echantillon", displayField: "code" } },
      { name: "id_analyse", label: "Analyse", type: "number", isPrimaryKey: true, foreignKey: { entity: "processus_analyse", displayField: "nom_analyse" } },
      { name: "id_laboriste", label: "Laboriste", type: "number", isPrimaryKey: true, foreignKey: { entity: "laboriste", displayField: "nom_laboriste" } },
      { name: "observation_analyse", label: "Observation", type: "text" },
      { name: "date_analyse", label: "Date d'Analyse", type: "date" },
    ],
  },
  {
    key: "effectuer_etalonnage",
    table: "effectuer_etalonnage",
    label: "Effectuer Étalonnage",
    icon: Activity,
    fields: [
      { name: "id_equipement", label: "Équipement", type: "number", isPrimaryKey: true, foreignKey: { entity: "equipement", displayField: "nom_equipement" } },
      { name: "id_etalonnage", label: "Étalonnage", type: "number", isPrimaryKey: true, foreignKey: { entity: "etalonnage", displayField: "nom_etalonnage" } },
      { name: "date_etalonnage", label: "Date Étalonnage", type: "date" },
      { name: "observation", label: "Observation", type: "text" },
      { name: "reserve_etalonnage", label: "Réserve", type: "text" },
    ],
  },
  {
    key: "norme",
    table: "norme",
    label: "Norme",
    icon: Scale,
    fields: [
      { name: "id_norme", label: "ID Norme", type: "number", isPrimaryKey: true },
      { name: "nom_norme", label: "Nom Norme", type: "text", required: true },
      { name: "date_norme", label: "Date Norme", type: "date" },
      { name: "national", label: "National", type: "boolean" },
    ],
  },
  {
    key: "comparer_norme",
    table: "comparer_norme",
    label: "Comparer Norme",
    icon: Search,
    fields: [
      { name: "id_analyse", label: "Analyse", type: "number", isPrimaryKey: true, foreignKey: { entity: "processus_analyse", displayField: "nom_analyse" } },
      { name: "id_norme", label: "Norme", type: "number", isPrimaryKey: true, foreignKey: { entity: "norme", displayField: "nom_norme" } },
    ],
  },
  {
    key: "historique",
    table: "historique",
    label: "Historique",
    icon: History,
    fields: [
      { name: "id_historique", label: "ID Hist", type: "number", isPrimaryKey: true },
      { name: "action", label: "Action", type: "text", required: true },
      { name: "date_action", label: "Date Action", type: "date" },
      { name: "adresse_ip", label: "Adresse IP", type: "text" },
      { name: "nom_connexion", label: "Nom Connexion", type: "text" },
    ],
  },
];

export const entityGroups = [
  {
    label: "Administration",
    key: "administration",
    items: ["user", "organisme", "laboratoire"],
  },
  {
    label: "Laboratoire",
    key: "laboratoire",
    items: ["echantillon", "processus_analyse", "resultat", "norme", "comparer_norme"],
  },
  {
    label: "Ressources",
    key: "ressources",
    items: ["laboriste", "diplome", "equipement", "etalonnage"],
  },
  {
    label: "Système",
    key: "système",
    items: ["historique", "obtenir", "effectuer", "effectuer_etalonnage"],
  },
];
