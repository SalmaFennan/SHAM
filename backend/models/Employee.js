const pool = require('../config/database');
const Transaction = require('./Transaction'); // Import Transaction model

class Employee {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM employe');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM employe WHERE id = ?', [id]);
        return rows[0];
    }

  static async create(employeeData) {
    const { nom, prenom, email, telephone, poste, salaire, date_embauche, statut, photo_url } = employeeData;
    const [result] = await pool.query(
      'INSERT INTO employe (nom, prenom, email, telephone, poste, salaire, date_embauche, statut, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, poste, salaire, date_embauche, statut, photo_url]
    );
    return result.insertId;
  }

  static async update(id, employeeData) {
    const { nom, prenom, email, telephone, poste, salaire, date_embauche, statut, photo_url } = employeeData;
    await pool.query(
      'UPDATE employe SET nom = ?, prenom = ?, email = ?, telephone = ?, poste = ?, salaire = ?, date_embauche = ?, statut = ?, photo_url = ? WHERE id = ?',
      [nom, prenom, email, telephone, poste, salaire, date_embauche, statut, photo_url, id]
    );
  }

    static async delete(id) {
        await pool.query('DELETE FROM employe WHERE id = ?', [id]);
    }

    static async getDashboardStats() {
        const [total] = await pool.query('SELECT COUNT(*) as count FROM employe');
        const [trainers] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM employe 
            WHERE poste LIKE '%Formateur%' OR poste LIKE '%Entraîneur%'
        `);
        const [payroll] = await pool.query(`
            SELECT SUM(salaire) as total 
            FROM employe 
            WHERE statut = 'Actif'
        `);
        const [present] = await pool.query(`
            SELECT COUNT(DISTINCT employe_id) as count 
            FROM presence 
            WHERE date = CURDATE()
        `);

        return {
            totalEmployees: total[0].count,
            trainers: trainers[0].count,
            payroll: payroll[0].total || 0, // Ensure 0 if null
            presentToday: present[0].count || 0
        };
    }

    static async search(query) {
        const [rows] = await pool.query(`
            SELECT * FROM employe 
            WHERE nom LIKE ? OR prenom LIKE ? OR poste LIKE ?
        `, [`%${query}%`, `%${query}%`, `%${query}%`]);
        return rows;
    }

    static async processPayroll() {
        try {
            const [employees] = await pool.query('SELECT id, nom, prenom, salaire FROM employe WHERE statut = ?', ['Actif']);
            for (const emp of employees) {
                await Transaction.create({
                    type: 'expense',
                    montant: emp.salaire,
                    employe_id: emp.id,
                    membre_id: null,
                    description: `Salaire de ${emp.nom} ${emp.prenom} pour le mois de ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`
                });
            }
            return { success: true, message: 'Payroll processed successfully' };
        } catch (error) {
            console.error('Error processing payroll:', error);
            throw error;
        }
    }
}

module.exports = Employee;