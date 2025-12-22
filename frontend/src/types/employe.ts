export interface Employee {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  poste: string;
  salaire: number | string; // Updated to handle string from backend
  date_embauche: string;
  statut: 'Actif' | 'Inactif' | null;
  photo_url?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  trainers: number;
  payroll: number;
  presentToday: number;
}