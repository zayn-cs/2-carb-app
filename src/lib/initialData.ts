export const initialData: Record<string, any[]> = {
  // Add your default users here
  utilisateur: [
    {
      id_user: 1,
      nom_user: "salay",
      password: "123456", // the default password
      ip_address: "154.121.28.158",
      created_at: new Date().toISOString()
    }
  ],
  // Add your default organisms here
  organisme: [
    {
      id_organisme: 1,
      nom_organisme: "Organisme Central",
      adresse_organisme: "123 Rue de la République",
      contact_organisme: "contact@organisme.dz",
      lieu_organisme: "Alger",
      created_at: new Date().toISOString()
    }
  ],
  // Add default labs here
  laboratoire: [
    {
      id_laboratoire: 1,
      nom_labo: "Laboratoire Principal",
      lieu_labo: "Alger",
      contact_labo: "labo@example.com",
      region: "1° RM",
      created_at: new Date().toISOString()
    }
  ],
  // You can keep adding other tables below as you need them:
  // laboriste: [ ... ],
  // equipement: [ ... ],
};
