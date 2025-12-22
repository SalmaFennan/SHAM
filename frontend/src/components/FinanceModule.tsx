import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { FinanceService } from '../services/financeService';
import {
  Transaction,
  MonthlyRevenue,
  RevenueByMembershipType,
  TransactionData
} from '../types/finance';

type FinanceTab = 'overview' | 'transactions' | 'subscriptions' | 'reports';

interface FinanceStats {
  monthlyRevenue: number;
  monthlyExpenses: number;
  membershipPayments: number;
  netProfit: number;
  revenueEvolution: MonthlyRevenue[];
}

const tabs: { id: FinanceTab; label: string }[] = [
  { id: 'overview', label: 'Vue d\'ensemble' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'subscriptions', label: 'Adhésions' },
  { id: 'reports', label: 'Rapports' }
];

export const FinanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [stats, setStats] = useState<FinanceStats>({
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    membershipPayments: 0,
    netProfit: 0,
    revenueEvolution: []
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState<RevenueByMembershipType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // État pour le formulaire de nouvelle transaction
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<TransactionData>({
    type: '',
    montant: 0,
    description: '',
    membre_id: undefined,
    employe_id: undefined
  });
  const [isRevenue, setIsRevenue] = useState<boolean>(true); // Détermine si c'est un revenu ou une dépense

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          revenueRes, 
          expensesRes, 
          membershipsRes,
          transactionsRes,
          subscriptionsRes
        ] = await Promise.all([
          FinanceService.getMonthlyRevenue(),
          FinanceService.getMonthlyExpenses(),
          FinanceService.getMembershipPayments(),
          FinanceService.getAllTransactions(),
          FinanceService.getRevenueByMembershipType()
        ]);

        setStats({
          monthlyRevenue: revenueRes.total_revenue || 0,
          monthlyExpenses: expensesRes || 0,
          membershipPayments: membershipsRes || 0,
          netProfit: (revenueRes.total_revenue || 0) - (expensesRes || 0),
          revenueEvolution: []
        });

        setTransactions(transactionsRes);
        setSubscriptionTypes(subscriptionsRes);
      } catch (err) {
        setError('Erreur lors du chargement des données financières');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gestion du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'montant' ? (value === '' ? 0 : parseFloat(value) || 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data before submit:', formData);
    try {
      const transactionData: TransactionData = {
        ...formData,
        type: isRevenue ? 'revenu' : 'dépense',
        date_transaction: new Date().toISOString()
      };
      console.log('Transaction data sent:', transactionData);
      await FinanceService.createTransaction(transactionData);
      setShowForm(false);
      // Rafraîchir les données
      const [revenueRes, expensesRes, membershipsRes, transactionsRes] = await Promise.all([
        FinanceService.getMonthlyRevenue(),
        FinanceService.getMonthlyExpenses(),
        FinanceService.getMembershipPayments(),
        FinanceService.getAllTransactions()
      ]);
      setStats(prev => ({
        ...prev,
        monthlyRevenue: revenueRes.total_revenue || 0,
        monthlyExpenses: expensesRes || 0,
        membershipPayments: membershipsRes || 0,
        netProfit: (revenueRes.total_revenue || 0) - (expensesRes || 0)
      }));
      setTransactions(transactionsRes);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Erreur lors de la création de la transaction');
    }
  };

  const formattedStats = [
    { 
      label: 'Revenus du Mois', 
      value: `${stats.monthlyRevenue.toLocaleString('fr-FR')}€`, 
      change: '+12%',
      icon: TrendingUp, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Dépenses du Mois', 
      value: `${stats.monthlyExpenses.toLocaleString('fr-FR')}€`, 
      change: '-3%', 
      icon: TrendingDown, 
      color: 'bg-red-500' 
    },
    { 
      label: 'Bénéfice Net', 
      value: `${stats.netProfit.toLocaleString('fr-FR')}€`, 
      change: '+8%', 
      icon: DollarSign, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Adhésions Payées', 
      value: stats.membershipPayments.toString(), 
      change: '+5%', 
      icon: CreditCard, 
      color: 'bg-purple-500' 
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion Financière</h1>
          <p className="text-gray-600">Suivi des revenus, dépenses et bénéfices</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsRevenue(true); setShowForm(true); }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nouveau Revenu
          </button>
          <button
            onClick={() => { setIsRevenue(false); setShowForm(true); }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nouvelle Dépense
          </button>
        </div>
      </div>

      {/* Formulaire de nouvelle transaction */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{isRevenue ? 'Nouveau Revenu' : 'Nouvelle Dépense'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Montant (€)</label>
                <input
                  type="number"
                  name="montant"
                  value={formData.montant === 0 ? '' : formData.montant}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistiques financières */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {formattedStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon size={24} className="text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Graphique des revenus */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Évolution des Revenus</h3>
                <div className="h-64 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <TrendingUp size={48} className="mx-auto mb-2" />
                    <p className="text-lg">Graphique des revenus</p>
                    <p className="text-sm opacity-75">Données des 12 derniers mois</p>
                  </div>
                </div>
              </div>

              {/* Répartition des revenus */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Répartition par Type d'Adhésion</h3>
                  <div className="space-y-3">
                    {subscriptionTypes.map((sub, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{sub.type_adhesion}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">{sub.count} membres</p>
                          <p className="text-sm text-green-600">{sub.total}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Prévisions</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Revenus prévisionnels (mois prochain)</p>
                      <p className="text-xl font-bold text-green-600">
                        {Math.round(stats.monthlyRevenue * 1.12).toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Dépenses prévisionnelles</p>
                      <p className="text-xl font-bold text-red-600">
                        {Math.round(stats.monthlyExpenses * 1.05).toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">Bénéfice prévisionnel</p>
                      <p className="text-xl font-bold text-blue-600">
                        {Math.round((stats.monthlyRevenue * 1.12 - stats.monthlyExpenses * 1.05)).toLocaleString('fr-FR')}€
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Transactions Récentes</h3>
                <div className="flex gap-2">
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <Filter size={16} />
                    Filtrer
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Download size={16} />
                    Exporter
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Membre
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            ['adhésion', 'produit', 'cours', 'renouvellement'].includes(transaction.type)
                              ? 'bg-green-100 text-green-800' 
                              : ['revenu', 'dépense'].includes(transaction.type)
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={
                            ['adhésion', 'produit', 'cours', 'renouvellement', 'revenu'].includes(transaction.type)
                              ? 'text-green-600'
                              : 'text-red-600'
                          }>
                            {transaction.montant}€
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.membre_nom} {transaction.membre_prenom}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6">Gestion des Adhésions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionTypes.map((sub, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{sub.type_adhesion}</h4>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">{sub.count} membres actifs</p>
                        <p className="text-sm text-green-600 font-medium">Revenus: {sub.total}€</p>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};