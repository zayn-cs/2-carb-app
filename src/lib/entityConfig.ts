import { FlaskConical, History, Building2, UserCog, GraduationCap, TestTubes, ClipboardCheck, Scale, Landmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "datetime-local";
  required?: boolean;
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
    key: "echantillon",
    table: "echantillon",
    label: "Échantillon",
    icon: FlaskConical,
    fields: [
      { name: "code", label: "Code", type: "text" },
      { name: "type_carburant", label: "Type Carburant", type: "text" },
      { name: "date_prelevement", label: "Date Prélèvement", type: "date" },
      { name: "etat", label: "État", type: "text" },
      { name: "lieu_prelevement", label: "Lieu Prélèvement", type: "text" },
      { name: "quantite", label: "Quantité", type: "number" },
      { name: "conforme", label: "Conforme", type: "boolean" },
      { name: "etiquetage", label: "Étiquetage", type: "text" },
      { name: "recipients", label: "Récipients", type: "boolean" },
      { name: "decision_de_recevabilite", label: "Décision de Recevabilité", type: "boolean" },
    ],
  },
  {
    key: "laboratoire",
    table: "laboratoire",
    label: "Laboratoire",
    icon: Building2,
    fields: [
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "lieu", label: "Lieu", type: "text" },
    ],
  },
  {
    key: "laboriste",
    table: "laboriste",
    label: "Laboriste",
    icon: UserCog,
    fields: [
      { name: "matricule", label: "Matricule", type: "text" },
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "prenom", label: "Prénom", type: "text" },
      { name: "sexe", label: "Sexe", type: "text" },
      { name: "date_de_naissance", label: "Date de Naissance", type: "date" },
    ],
  },
  {
    key: "processus_analyse",
    table: "processus_analyse",
    label: "Processus d'Analyse",
    icon: TestTubes,
    fields: [
      { name: "matricule", label: "Matricule", type: "text" },
      { name: "lieu", label: "Lieu", type: "text" },
      { name: "type_analyse", label: "Type d'Analyse", type: "text" },
      { name: "date_analyse", label: "Date d'Analyse", type: "date" },
    ],
  },
  {
    key: "resultat",
    table: "resultat",
    label: "Résultat",
    icon: ClipboardCheck,
    fields: [
      { name: "date", label: "Date", type: "date" },
      { name: "conforme", label: "Conforme", type: "boolean" },
      { name: "remarque", label: "Remarque", type: "text" },
      { name: "bulletint_d_analyse", label: "Bulletin d'Analyse", type: "text" },
    ],
  },
  {
    key: "norme",
    table: "norme",
    label: "Norme",
    icon: Scale,
    fields: [
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "date", label: "Date", type: "date" },
      { name: "national", label: "National", type: "boolean" },
    ],
  },
  {
    key: "organisme",
    table: "organisme",
    label: "Organisme",
    icon: Landmark,
    fields: [
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "lieu", label: "Lieu", type: "text" },
      { name: "contact", label: "Contact", type: "text" },
    ],
  },
  {
    key: "diplome",
    table: "diplome",
    label: "Diplôme",
    icon: GraduationCap,
    fields: [
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "specialite", label: "Spécialité", type: "text" },
    ],
  },
    {
      key: "historique",
      table: "historique",
      label: "Historique",
      icon: History,
      fields: [
        { name: "action", label: "Action", type: "text", required: true },
        { name: "user_id", label: "Utilisateur", type: "text" },
        { name: "date_action", label: "Date Action", type: "datetime-local" },
        { name: "adresse_ip", label: "Adresse IP", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "succes", label: "Succès", type: "boolean" },
        { name: "message", label: "Message", type: "text" },
        { name: "is_alert", label: "Alerte", type: "boolean" },
      ],
    },
];
