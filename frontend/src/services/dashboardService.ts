import axios from 'axios';
import { Member, Stats, SubscriptionStatus } from '../types/dashboard';

const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

export const DashboardService = {
  async getMembers(): Promise<Member[]> {
    try {
      const response = await axios.get<{ success: boolean; data: Member[] }>(`${API_URL}/membres`, { withCredentials: true });
      console.log('Response data for members:', response.data); // Débogage
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data.map(member => ({
          ...member, // Inclut toutes les propriétés de la réponse
          // Pas besoin de mappage supplémentaire si l'interface correspond
        }));
      }
      throw new Error(`Données reçues non valides pour les membres. Réponse: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error('Error fetching members:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  async getStats(): Promise<Stats> {
    try {
      const response = await axios.get(`${API_URL}/finances/transactions/overview`, { withCredentials: true });
      console.log('Response data for stats:', response.data); // Débogage
      return {
        'Membres Actifs': response.data.activeMembers || 0,
        'Employés': response.data.employees || 0,
        'Revenus du Mois': response.data.monthlyRevenue || '0€'
      };
    } catch (error: any) {
      console.error('Error fetching stats:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  getSubscriptionStatus(endDate: string): SubscriptionStatus {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffTime < 0) {
      return { status: 'expired', daysRemaining: 0 };
    } else if (diffTime <= 7) {
      return { status: 'expiring', daysRemaining: diffTime };
    }
    return { status: 'active', daysRemaining: diffTime };
  }
};