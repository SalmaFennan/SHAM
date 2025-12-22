/**
 * Utilitaires pour la manipulation des dates
 */

/**
 * Formate une date au format français (JJ/MM/AAAA)
 * @param dateString - Date sous forme de string ou objet Date
 * @returns La date formatée
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'Date invalide';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Date invalide';
    
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Date invalide';
  }
};


/**
 * Ajoute des mois à une date
 * @param date - Date de départ
 * @param months - Nombre de mois à ajouter (peut être négatif)
 * @returns Nouvelle date
 */
export const addMonthsToDate = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  
  // Gestion du dépassement de fin de mois
  if (result.getDate() !== date.getDate()) {
    result.setDate(0); // Dernier jour du mois précédent
  }
  
  return result;
};

/**
 * Convertit une date en string ISO (YYYY-MM-DD)
 * @param date - Date à convertir
 * @returns La date au format ISO sans le temps
 */
export const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Détermine le statut d'une adhésion basée sur sa date d'expiration
 * @param expirationDate - Date d'expiration
 * @returns Objet contenant le statut, jours restants et message
 */
export const getSubscriptionStatus = (expirationDate: string | Date | null | undefined) => {
  if (!expirationDate) return { status: 'invalid', message: 'Date invalide', daysRemaining: 0 };

  try {
    const expDate = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
    if (isNaN(expDate.getTime())) return { status: 'invalid', message: 'Date invalide', daysRemaining: 0 };

    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', message: 'Expiré', daysRemaining: diffDays };
    } else if (diffDays <= 7) {
      return { status: 'expiring', message: `Expire dans ${diffDays} jour(s)`, daysRemaining: diffDays };
    } else {
      return { status: 'valid', message: 'Valide', daysRemaining: diffDays };
    }
  } catch (error) {
    console.error('Erreur de calcul de statut:', error);
    return { status: 'invalid', message: 'Date invalide', daysRemaining: 0 };
  }
};

/**
 * Vérifie si une date est valide
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Calcule la date d'expiration basée sur la date d'adhésion, le type d'adhésion et le pack
 * @param dateAdhesion - Date d'adhésion (string ISO)
 * @param typeAdhesion - Type d'adhésion ('mixte' | 'femme')
 * @param pack - Pack sélectionné
 * @returns Date d'expiration au format ISO
 */
export const calculateExpirationDate = (dateAdhesion: string, typeAdhesion: 'mixte' | 'femme', pack: string): string => {
  const baseDate = new Date(dateAdhesion);
  let monthsToAdd = 1; // Default to 1 month

  if (typeAdhesion === 'femme') {
    monthsToAdd = 1; // Fixed 1 month for 'femme'
  } else {
    switch (pack) {
      case '3mois':
      case '3moisDuo':
        monthsToAdd = 3;
        break;
      case '6mois':
      case '6moisDuo':
        monthsToAdd = 6;
        break;
      case '12mois':
      case '12moisDuo':
        monthsToAdd = 12;
        break;
    }
  }

  const expirationDate = addMonthsToDate(baseDate, monthsToAdd);
  return toISODateString(expirationDate);
};