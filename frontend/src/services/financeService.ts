import api from './api';
import {
  Transaction,
  MonthlyRevenue,
  RevenueByMembershipType,
  RevenueEvolution,
  TransactionData
} from '../types/finance';

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export const FinanceService = {
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get<ApiResponse<Transaction[]>>('/finances/transactions');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async getMonthlyRevenue(): Promise<MonthlyRevenue> {
    try {
      const response = await api.get<ApiResponse<MonthlyRevenue>>('/finances/transactions/monthly-revenue');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      throw error;
    }
  },

  async getMonthlyExpenses(): Promise<number> {
    try {
      const response = await api.get<ApiResponse<{ total: number }>>('/finances/transactions/monthly-expenses');
      return response.data.data?.total || 0; // Retourne 0 si data est null/undefined
    } catch (error) {
      console.error('Error fetching monthly expenses:', error);
      throw error;
    }
  },

  async createTransaction(transactionData: TransactionData): Promise<number> {
    try {
      const response = await api.post<ApiResponse<{ insertId: number }>>('/finances/transactions', transactionData);
      return response.data.data.insertId;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  async getMembershipPayments(): Promise<number> {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>('/finances/transactions/memberships');
      return response.data.data.count;
    } catch (error) {
      console.error('Error fetching membership payments:', error);
      throw error;
    }
  },

  async getRevenueEvolution(): Promise<RevenueEvolution[]> {
    try {
      const response = await api.get<ApiResponse<RevenueEvolution[]>>('/finances/transactions/evolution');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching revenue evolution:', error);
      throw error;
    }
  },

  async getRevenueByMembershipType(): Promise<RevenueByMembershipType[]> {
    try {
      const response = await api.get<ApiResponse<RevenueByMembershipType[]>>('/finances/transactions/revenue-by-membership-type');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching revenue by membership:', error);
      throw error;
    }
  },

  async getTransactionById(id: number): Promise<Transaction> {
    try {
      const response = await api.get<ApiResponse<Transaction>>(`/finances/transactions/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  },

  async updateTransaction(id: number, transactionData: Partial<TransactionData>): Promise<void> {
    try {
      await api.put<ApiResponse<void>>(`/finances/transactions/${id}`, transactionData);
    } catch (error) {
      console.error(`Error updating transaction ${id}:`, error);
      throw error;
    }
  },

  async deleteTransaction(id: number): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/finances/transactions/${id}`);
    } catch (error) {
      console.error(`Error deleting transaction ${id}:`, error);
      throw error;
    }
  }
};