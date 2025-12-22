const db = require('../config/database');

class Member {
  static async getAll() {
    try {
      const query = `
        SELECT 
          id, 
          nom, 
          prenom, 
          COALESCE(email, '') as email,
          COALESCE(telephone, '') as telephone,
          DATE_FORMAT(date_adhesion, '%Y-%m-%d') as date_adhesion,
          DATE_FORMAT(date_expiration, '%Y-%m-%d') as date_expiration,
          COALESCE(type_adhesion, 'mixte') as type_adhesion,
          COALESCE(pack, '1mois') as pack,
          COALESCE(prix_paye, 0) as prix_paye,
          COALESCE(assurance_payee, 0) as assurance_payee,
          COALESCE(statut, 'actif') as statut,
          COALESCE(photo_url, '') as photo_url
        FROM membre
        ORDER BY date_adhesion DESC
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      throw error;
    }
  }


  /**
   * Récupère un membre par son ID
   * @param {number} id - ID du membre
   * @returns {Promise<Object|null>} Le membre trouvé ou null
   */
  static async getById(id) {
  try {
    const query = `
      SELECT id, nom, prenom, email, telephone,
             DATE_FORMAT(date_adhesion, '%Y-%m-%d') as date_adhesion,
             DATE_FORMAT(date_expiration, '%Y-%m-%d') as date_expiration,
             COALESCE(type_adhesion, 'mixte') as type_adhesion,
             COALESCE(pack, '1mois') as pack,
             prix_paye, assurance_payee,
             COALESCE(statut, 'actif') as statut,
             photo_url
      FROM membre
      WHERE id = ?
    `;
    const [rows] = await db.query(query, [id]);
    let member = rows[0] || null;

    if (member) {
      if (!member.date_expiration || isNaN(new Date(member.date_expiration).getTime())) {
        member.date_expiration = new Date().toISOString().split('T')[0];
        console.warn(`Invalid date_expiration for member ${id}, set to ${member.date_expiration}`);
      }
    }

    return member;
  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    throw error;
  }
}

/**
 * Crée un nouveau membre
 * @param {Object} memberData - Données du membre
 * @returns {Promise<number>} ID du nouveau membre
 */
 static async create(memberData) {
  try {
    const query = `
      INSERT INTO membre
      (nom, prenom, email, telephone, date_adhesion, date_expiration, 
       type_adhesion, pack, prix_paye, assurance_payee, statut, photo_url,
       created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const values = [
      memberData.nom,
      memberData.prenom,
      memberData.email,
      memberData.telephone,
      memberData.date_adhesion,
      memberData.date_expiration || this.calculateExpirationDate(
        memberData.date_adhesion,
        memberData.type_adhesion,
        memberData.pack
      ),
      memberData.type_adhesion || 'mixte',
      memberData.pack || '1mois',
      memberData.prix_paye || 0,
      memberData.assurance_payee || false,
      memberData.statut || 'actif',
      memberData.photo_url || null
    ];

    const [result] = await db.query(query, values);
    const memberId = result.insertId || result.lastID;

    // Create transaction for initial membership
    const amount = await this.calculateRenewalAmount(memberData.type_adhesion, memberData.pack);
    await require('../models/Transaction').create({
      type: 'adhésion',
      montant: amount,
      membre_id: memberId,
      employe_id: null, // Or set to an employe_id if a staff member processed it
      description: `Adhésion ${memberData.pack} pour ${memberData.nom} ${memberData.prenom}`
    });

    return memberId;
  } catch (error) {
    console.error('Erreur lors de la création du membre:', error);
    throw error;
  }
}

  /**
   * Met à jour un membre existant
   * @param {number} id - ID du membre à mettre à jour
   * @param {Object} updates - Données à mettre à jour
   * @returns {Promise<number>} Nombre de lignes affectées
   */
  static async update(id, updates) {
    try {
      const updateFields = [];
      const values = [];

      // Construire dynamiquement la requête UPDATE
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }

      values.push(id); // ID pour la clause WHERE

      const query = `
        UPDATE membre
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const result = await db.query(query, values);
      return result.affectedRows || result.changes;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du membre:', error);
      throw error;
    }
  }

  /**
   * Supprime un membre
   * @param {number} id - ID du membre à supprimer
   * @returns {Promise<number>} Nombre de lignes affectées
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM membre WHERE id = ?';
      const result = await db.query(query, [id]);
      return result.affectedRows || result.changes;
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      throw error;
    }
  }

  /**
   * Récupère les membres dont l'adhésion a expiré
   * @returns {Promise<Array>} Liste des membres expirés
   */
  static async getExpiredMembers() {
    try {
      const query = `
        SELECT id, nom, prenom, email, telephone, 
               DATE_FORMAT(date_adhesion, '%Y-%m-%d') as date_adhesion,
               DATE_FORMAT(date_expiration, '%Y-%m-%d') as date_expiration,
               type_adhesion, pack, prix_paye, assurance_payee, statut, photo_url
        FROM membre
        WHERE date_expiration < CURDATE()
        ORDER BY date_expiration ASC
      `;
      const result = await db.query(query);
      return result.rows || result;
    } catch (error) {
      console.error('Erreur lors de la récupération des membres expirés:', error);
      throw error;
    }
  }

  /**
   * Calcule la date d'expiration en fonction du type et du pack
   * @param {string} startDate - Date de début (YYYY-MM-DD)
   * @param {string} type - Type d'adhésion
   * @param {string} pack - Pack choisi
   * @returns {string} Date d'expiration (YYYY-MM-DD)
   */
  static calculateExpirationDate(startDate, type, pack) {
    const expirationDate = new Date(startDate);
    let months = 1;
    
    if (type === 'femme') {
      months = 1;
    } else {
      switch(pack) {
        case '3mois':
        case '3moisDuo': months = 3; break;
        case '6mois':
        case '6moisDuo': months = 6; break;
        case '12mois':
        case '12moisDuo': months = 12; break;
      }
    }
    
    expirationDate.setMonth(expirationDate.getMonth() + months);
    return expirationDate.toISOString().split('T')[0];
  }

  /**
   * Calcule le montant de renouvellement
   * @param {string} type - Type d'adhésion
   * @param {string} pack - Pack choisi
   * @returns {number} Montant à payer
   */
  static async calculateRenewalAmount(type, pack) {
    try {
      if (type === 'femme') {
        return 150; // Prix fixe pour les femmes
      }

      const prices = {
        '1mois': 200,
        '3mois': 550,
        '6mois': 1000,
        '12mois': 1800,
        '3moisDuo': 900,
        '6moisDuo': 1800,
        '12moisDuo': 3400
      };

      return prices[pack] || 200;
    } catch (error) {
      console.error('Erreur lors du calcul du montant:', error);
      throw error;
    }
  }

  /**
   * Renouvelle l'adhésion d'un membre
   * @param {number} id - ID du membre
   * @param {Object} renewalData - Données de renouvellement
   * @returns {Promise<number>} ID de la transaction
   */
  static async renewMembership(id, renewalData) {
  try {
    const { newEndDate, amount, paymentMethod } = renewalData;
    const updateQuery = `
      UPDATE membre
      SET date_expiration = ?, statut = 'actif', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.query(updateQuery, [newEndDate, id]);

    // Create transaction for renewal
    const transactionResult = await require('../models/Transaction').create({
      type: 'renouvellement',
      montant: amount,
      membre_id: id,
      employe_id: null, // Or set to an employe_id
      description: `Renouvellement adhésion pour membre ID ${id}`
    });

    return transactionResult.insertId || transactionResult.lastID;
  } catch (error) {
    console.error('Erreur lors du renouvellement:', error);
    throw error;
  }
}

  /**
   * Recherche des membres selon des critères
   * @param {Object} criteria - Critères de recherche
   * @returns {Promise<Array>} Liste des membres correspondants
   */
  static async search(criteria) {
    try {
      let query = `
        SELECT id, nom, prenom, email, telephone, 
               DATE_FORMAT(date_adhesion, '%Y-%m-%d') as date_adhesion,
               DATE_FORMAT(date_expiration, '%Y-%m-%d') as date_expiration,
               type_adhesion, pack, prix_paye, assurance_payee, statut, photo_url
        FROM membre WHERE 1=1
      `;
      const values = [];

      if (criteria.nom) {
        query += ' AND (nom LIKE ? OR prenom LIKE ?)';
        values.push(`%${criteria.nom}%`, `%${criteria.nom}%`);
      }

      if (criteria.email) {
        query += ' AND email LIKE ?';
        values.push(`%${criteria.email}%`);
      }

      if (criteria.statut) {
        query += ' AND statut = ?';
        values.push(criteria.statut);
      }

      if (criteria.type_adhesion) {
        query += ' AND type_adhesion = ?';
        values.push(criteria.type_adhesion);
      }

      query += ' ORDER BY date_adhesion DESC';

      const result = await db.query(query, values);
      return result.rows || result;
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }
}

module.exports = Member;