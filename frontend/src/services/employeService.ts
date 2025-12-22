import axios from 'axios';
import { Employee, DashboardStats } from '../types/employe';

// Définir une URL absolue pour le développement local
const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/employes' : '/employes';

export const EmployeeService = {
  async getAll(): Promise<Employee[]> {
    try {
      const url = `${API_URL}`;
      console.log('Requesting URL:', url);
      const response = await axios.get<Employee[]>(url, { withCredentials: true });
      console.log('Full Response:', response);
      console.log('API Response Data:', response.data);
      return response.data.map(emp => ({
        ...emp,
        photo_url: emp.photo_url || 'https://via.placeholder.com/50',
        salaire: typeof emp.salaire === 'string' ? parseFloat(emp.salaire) : emp.salaire
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching employees:', error.response ? error.response.data : error.message);
        if (error.code === 'ERR_NETWORK') {
          console.warn('Network error detected, consider checking server status.');
        }
      } else {
        console.error('Error fetching employees:', (error as Error).message);
      }
      throw error;
    }
  },

  async getById(id: number): Promise<Employee> {
    try {
      const response = await axios.get<Employee>(`${API_URL}/${id}`, { withCredentials: true });
      return { ...response.data, photo_url: response.data.photo_url || 'https://via.placeholder.com/50' };
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },

  async create(employeeData: Partial<Employee> & { photo?: File }): Promise<number> {
    try {
      const formData = new FormData();
      formData.append('nom', employeeData.nom || '');
      formData.append('prenom', employeeData.prenom || '');
      formData.append('email', employeeData.email || '');
      formData.append('telephone', employeeData.telephone || '');
      formData.append('poste', employeeData.poste || '');
      formData.append(
        'salaire',
        (typeof employeeData.salaire === 'string' ? parseFloat(employeeData.salaire) : employeeData.salaire || 0).toFixed(2)
      );
      formData.append('date_embauche', employeeData.date_embauche || new Date().toISOString().split('T')[0]);
      formData.append('statut', employeeData.statut || 'Actif');
      if (employeeData.photo) formData.append('photo', employeeData.photo);

      console.log('FormData Keys:', Array.from(formData.entries()));
      const response = await axios.post<{ id: number }>(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error creating employee:', error.response?.data || error.message);
      } else {
        console.error('Error creating employee:', (error as Error).message);
      }
      throw error;
    }
  },

  async update(id: number, employeeData: Partial<Employee> & { photo?: File }): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('nom', employeeData.nom || '');
      formData.append('prenom', employeeData.prenom || '');
      formData.append('email', employeeData.email || '');
      formData.append('telephone', employeeData.telephone || '');
      formData.append('poste', employeeData.poste || '');
      formData.append('salaire', employeeData.salaire?.toString() || '0');
      formData.append('date_embauche', employeeData.date_embauche || '');
      formData.append('statut', employeeData.statut || 'Actif');
      if (employeeData.photo) formData.append('photo', employeeData.photo);

      await axios.put(`${API_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get<DashboardStats>(`${API_URL}/stats/dashboard`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  async search(query: string): Promise<Employee[]> {
    try {
      const response = await axios.get<Employee[]>(`${API_URL}/search?q=${query}`, { withCredentials: true });
      return response.data.map(emp => ({ ...emp, photo_url: emp.photo_url || 'https://via.placeholder.com/50' }));
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  },

  async processPayroll(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post<{ success: boolean; message: string }>(`${API_URL}/payroll`, {}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error processing payroll:', error);
      throw error;
    }
  }
};