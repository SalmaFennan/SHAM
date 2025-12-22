// src/types/finance.ts
export interface Transaction {
  id: number;
  type: 'adhésion' | 'produit' | 'cours' | string;
  montant: number;
  description: string;
  date_transaction: string | Date;
  membre_id?: number;
  employe_id?: number;
  membre_nom?: string;
  membre_prenom?: string;
  employe_nom?: string;
  employe_prenom?: string;
}

export interface MonthlyRevenue {
  adhesion_revenue: number;
  product_revenue: number;
  course_revenue: number;
  total_revenue: number;
  transaction_count: number;
}

export interface RevenueByMembershipType {
  type_adhesion: string;
  count: number;
  total: number;
}

export interface RevenueEvolution {
  month: number;
  year: number;
  total: number;
}

export interface TransactionData {
  type: string;
  montant: number;
  description: string;
  membre_id?: number; // Optionnel
  employe_id?: number; // Optionnel
  date_transaction?: string; // Ajout de la propriété date_transaction
}