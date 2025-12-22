import axios from 'axios';
import api from './api';

interface Member {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_adhesion: string;
  date_expiration: string;
  type_adhesion: 'mixte' | 'femme';
  pack: '1mois' | '3mois' | '6mois' | '12mois' | '3moisDuo' | '6moisDuo' | '12moisDuo';
  prix_paye: number;
  assurance_payee: boolean;
  statut: 'actif' | 'expiré' | 'suspendu';
  photo_url?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

interface MemberFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  type_adhesion: 'mixte' | 'femme';
  pack: string;
  prix_paye: number;
  assurance_payee: boolean;
  date_adhesion: string;
  photoFile?: File | null;
}
import { calculateExpirationDate } from '../utils/dateUtils'; // Add this import
/**
 * Récupère la liste de tous les membres
 */
export const getMembers = async (): Promise<Member[]> => {
  try {
    const response = await api.get<ApiResponse<Member[]>>('/membres');
    
    if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
      console.error('Structure de réponse API invalide:', response.data);
      throw new Error('Format de données invalide');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.error || 'Erreur serveur'
        : 'Erreur de connexion'
    );
  }
};

/**
 * Récupère les membres dont l'adhésion est expirée
 */
export const getExpiredMembers = async (): Promise<Member[]> => {
  try {
    const response = await api.get<ApiResponse<Member[]>>('/membres/expired/list');
    return response.data.data;
  } catch (error) {
    console.error('Échec de récupération des membres expirés:', error);
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.error || 'Erreur serveur'
        : 'Erreur de connexion'
    );
  }
};

/**
 * Renouvelle l'adhésion d'un membre
 */
export const renewMember = async (id: number): Promise<Member> => {
  try {
    const response = await api.post<ApiResponse<Member>>(
      `/membres/${id}/process-renewal`,
      { paymentMethod: 'cash' }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Échec du renouvellement du membre ${id}:`, error);
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.error || 'Erreur lors du renouvellement'
        : 'Erreur de connexion'
    );
  }
};

/**
 * Crée un nouveau membre avec photo optionnelle
 */
export const createMember = async (memberData: MemberFormData): Promise<Member> => {
  try {
    // Validation des champs obligatoires
    if (!memberData.nom.trim() || !memberData.prenom.trim()) {
      throw new Error('Le nom et prénom sont obligatoires');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberData.email)) {
      throw new Error('Format d\'email invalide');
    }

    if (memberData.telephone && !/^[0-9]{10}$/.test(memberData.telephone)) {
      throw new Error('Le téléphone doit contenir 10 chiffres');
    }

   const validTypeAdhesion = memberData.type_adhesion.toLowerCase() as 'mixte' | 'femme';
    if (!['mixte', 'femme'].includes(validTypeAdhesion)) {
      throw new Error('Type d\'adhésion invalide. Utilisez "mixte" ou "femme".');
    }

    // Calculate date_expiration
    const dateExpiration = calculateExpirationDate(
      memberData.date_adhesion,
      validTypeAdhesion,
      memberData.pack
    );

    const formData = new FormData();
    
    // Ajout des données du membre with explicit typing
    formData.append('nom', memberData.nom.trim());
    formData.append('prenom', memberData.prenom.trim());
    formData.append('email', memberData.email.trim());
    formData.append('telephone', memberData.telephone.trim() || '');
    formData.append('type_adhesion', validTypeAdhesion); // Use normalized value
    formData.append('pack', memberData.pack);
    formData.append('prix_paye', memberData.prix_paye.toString());
    formData.append('assurance_payee', memberData.assurance_payee.toString());
    formData.append('date_adhesion', memberData.date_adhesion);
    formData.append('date_expiration', dateExpiration);
    formData.append('statut', 'actif');

    // Debug: Log FormData entries
    for (let [key, value] of formData.entries()) {
      console.log(`FormData - ${key}: ${value}`);
    }

    // Ajout de la photo si elle existe
    if (memberData.photoFile) {
      formData.append('photo', memberData.photoFile);
    }

    const response = await api.post<ApiResponse<Member>>('/membres', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la création');
    }

    return response.data.data;
  } catch (error) {
    console.error('Échec de création du membre:', error);
    
    let errorMessage = 'Erreur lors de la création du membre';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error || 
                    error.response?.data?.message || 
                    errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};
/**
 * Met à jour un membre existant
 */
export const updateMember = async (
  id: number,
  updates: Partial<MemberFormData>
): Promise<Member> => {
  try {
    const formData = new FormData();
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'photoFile') {
        formData.append(key, String(value));
      }
    });
    
    if (updates.photoFile) {
      formData.append('photo', updates.photoFile);
    }

    const response = await api.put<ApiResponse<Member>>(`/membres/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data.data;
  } catch (error) {
    console.error(`Échec de mise à jour du membre ${id}:`, error);
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.error || 'Erreur lors de la mise à jour'
        : 'Erreur de connexion'
    );
  }
};

/**
 * Télécharge une photo pour un membre
 */
export const uploadMemberPhoto = async (
  id: number, 
  photoFile: File
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    const response = await api.post<ApiResponse<{ photo_url: string }>>(
      `/membres/${id}/photo`, 
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    
    return response.data.data.photo_url;
  } catch (error) {
    console.error(`Échec d'upload de photo pour le membre ${id}:`, error);
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.error || 'Erreur lors de l\'upload'
        : 'Erreur de connexion'
    );
  }
};

/**
 * Supprime un membre
 */
export const deleteMember = async (id: number): Promise<void> => {
  try {
    await api.delete(`/membres/${id}`);
  } catch (error) {
    console.error(`Échec de suppression du membre ${id}:`, error);
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.error || 'Erreur lors de la suppression'
        : 'Erreur de connexion'
    );
  }
};

/**
 * Récupère les informations de renouvellement pour un membre
 */
export const getRenewalInfo = async (id: number): Promise<{
  date_fin_actuelle: string;
  date_fin_nouvelle: string;
  montant: number;
  type_adhesion: string;
}> => {
  try {
    const response = await api.get(`/membres/${id}/renewal-info`);
    return response.data.data;
  } catch (error) {
    console.error(`Échec de récupération des infos de renouvellement pour le membre ${id}:`, error);
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.error || 'Erreur serveur'
        : 'Erreur de connexion'
    );
  }
};

/**
 * Recherche des membres selon des critères
 */
export const searchMembers = async (criteria: {
  nom?: string;
  email?: string;
  statut?: string;
}): Promise<Member[]> => {
  try {
    const response = await api.get<ApiResponse<Member[]>>('/membres/recherche', { 
      params: criteria 
    });
    return response.data.data;  
  } catch (error) {
    console.error('Échec de la recherche des membres:', error);
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.error || 'Erreur serveur'
        : 'Erreur de connexion'
    );
  }
};