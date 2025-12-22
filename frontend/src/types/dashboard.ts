export interface Member {
  id: number;
  nom: string; // Nom de famille
  prenom: string; // Prénom
  email: string;
  telephone: string;
  date_adhesion: string;
  date_expiration: string; // Correspond à subscriptionEnd
  type_adhesion: string; // Correspond à subscription
  pack: string;
  prix_paye: string;
  assurance_payee: number;
  statut: string;
  photo_url: string;
}

export interface Stats {
  'Membres Actifs': number;
  'Employés': number;
  'Revenus du Mois': string;
}

export interface SubscriptionStatus {
  status: 'active' | 'expiring' | 'expired';
  daysRemaining: number;
}