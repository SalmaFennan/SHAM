const pool = require('../config/database');

class Transaction {
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT t.*, 
                   m.nom as membre_nom, m.prenom as membre_prenom,
                   e.nom as employe_nom, e.prenom as employe_prenom
            FROM transaction t
            LEFT JOIN membre m ON t.membre_id = m.id
            LEFT JOIN employe e ON t.employe_id = e.id
            ORDER BY t.date_transaction DESC
        `);
        return rows;
    }

    static async getMonthlyRevenue() {
        const [rows] = await pool.query(`
            SELECT 
                SUM(CASE WHEN type = 'adhésion' THEN montant ELSE 0 END) as adhesion_revenue,
                SUM(CASE WHEN type = 'produit' THEN montant ELSE 0 END) as product_revenue,
                SUM(CASE WHEN type = 'cours' THEN montant ELSE 0 END) as course_revenue,
                SUM(montant) as total_revenue,
                COUNT(*) as transaction_count
            FROM transaction
            WHERE MONTH(date_transaction) = MONTH(CURDATE())
            AND YEAR(date_transaction) = YEAR(CURDATE())
        `);
        return rows[0];
    }

static async getMonthlyExpenses() {
  const [rows] = await pool.query(`
    SELECT SUM(salaire) as total 
    FROM employe 
    WHERE statut = 'Actif'
  `);
  return { total: rows[0]?.total || 0 }; // Retourne 0 si aucune ligne
}

    static async create(transactionData) {
        const { type, montant, membre_id, employe_id, description } = transactionData;
        const [result] = await pool.query(
            'INSERT INTO transaction (type, montant, membre_id, employe_id, description, date_transaction) VALUES (?, ?, ?, ?, ?, ?)',
            [type, montant, membre_id, employe_id, description, new Date()]
        );
        return result.insertId;
    }

    static async getMembershipPayments() {
        const [rows] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM transaction 
            WHERE type = 'adhésion'
            AND MONTH(date_transaction) = MONTH(CURDATE())
        `);
        return rows[0].count;
    }

    static async getRevenueEvolution() {
        const [rows] = await pool.query(`
            SELECT 
                MONTH(date_transaction) as month,
                YEAR(date_transaction) as year,
                SUM(montant) as total
            FROM transaction
            GROUP BY YEAR(date_transaction), MONTH(date_transaction)
            ORDER BY year, month
            LIMIT 12
        `);
        return rows;
    }

    static async getRevenueByMembershipType() {
        const [rows] = await pool.query(`
            SELECT 
                m.type_adhesion,
                COUNT(*) as count,
                SUM(t.montant) as total
            FROM transaction t
            JOIN membre m ON t.membre_id = m.id
            WHERE t.type = 'adhésion'
            GROUP BY m.type_adhesion
        `);
        return rows;
    }

    static async archiveTransactions(memberId) {
        try {
            const [transactions] = await pool.query(
                'SELECT * FROM transaction WHERE membre_id = ?',
                [memberId]
            );
            if (transactions.length > 0) {
                const values = transactions.map(t => [
                    t.type, t.montant, t.membre_id, t.employe_id, t.description, t.date_transaction
                ]);
                await pool.query(
                    `INSERT INTO transaction_archive 
                     (type, montant, membre_id, employe_id, description, date_transaction) 
                     VALUES ?`,
                    [values]
                );
            }
            return transactions.length;
        } catch (error) {
            console.error('Erreur lors de l\'archivage des transactions:', error);
            throw error;
        }
    }

    static async deleteByMemberId(memberId) {
        try {
            await this.archiveTransactions(memberId); // Archive first
            const query = 'DELETE FROM transaction WHERE membre_id = ?';
            const [result] = await pool.query(query, [memberId]);
            return result.affectedRows || 0;
        } catch (error) {
            console.error('Erreur lors de la suppression des transactions:', error);
            throw error;
        }
    }
}

module.exports = Transaction;