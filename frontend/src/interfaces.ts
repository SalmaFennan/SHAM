// Types pour les adhésions
export type MembershipType = 'mixte' | 'femme';
export type PackType = 
  | '1mois' | '3mois' | '6mois' | '12mois' 
  | '3moisDuo' | '6moisDuo' | '12moisDuo';
export type MemberStatus = 'actif' | 'expiré' | 'suspendu';

// Interface principale pour les membres
export interface Member {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_adhesion: string;
  date_expiration: string;
  type_adhesion: MembershipType;
  pack: PackType;
  prix_paye: number;
  assurance_payee: boolean;
  statut: MemberStatus;
  photo_url?: string;
}

// Pour les formulaires de création/édition
export interface MemberFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  type_adhesion: MembershipType;
  pack: PackType;
  prix_paye: number;
  assurance_payee: boolean;
  date_adhesion: string;
  photoFile?: File;
}

// Pour les réponses API
export interface ApiMember {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_adhesion: string;
  date_expiration: string;
  type_adhesion: 'mixte' | 'femme'; // Types bruts de l'API
  pack: PackType;
  prix_paye: number;
  assurance_payee?: boolean; // Optionnel dans l'API
  statut: MemberStatus;
  photo_url?: string;
}

// Pour les filtres
export interface MemberFilters {
  searchTerm?: string;
  status?: MemberStatus;
  membershipType?: MembershipType;
  expirationSoon?: boolean;
}