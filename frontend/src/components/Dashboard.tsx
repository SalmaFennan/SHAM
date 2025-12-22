import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { DashboardService } from '../services/dashboardService';
import { Member, Stats } from '../types/dashboard';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const Dashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [membersData, statsData] = await Promise.all([
        DashboardService.getMembers(),
        DashboardService.getStats()
      ]);
      setMembers(membersData);
      setStats(statsData);
    } catch (err) {
      setError('Erreur lors du chargement des données. Réessayez.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // toutes les 5 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = async () => {
    await fetchData();
  };

  const handleAlertClick = (member: Member) => {
    alert(`Détails pour ${member.prenom} ${member.nom}: Adhésion ${member.type_adhesion} expire le ${member.date_expiration}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 text-blue-500 border-4 border-blue-300 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error} <button onClick={handleRefresh} className="ml-2 text-blue-500 underline">Réessayer</button>
      </div>
    );
  }

  const expiredMembers = members.filter(member => {
    const status = DashboardService.getSubscriptionStatus(member.date_expiration);
    return status.status === 'expired';
  });

  const expiringMembers = members.filter(member => {
    const status = DashboardService.getSubscriptionStatus(member.date_expiration);
    return status.status === 'expiring';
  });

  const chartData = {
    labels: ['Sem1', 'Sem2', 'Sem3', 'Sem4'],
    datasets: [
      {
        label: 'Revenus (€)',
        data: [1500, 2000, 1800, 2500],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
          <p className="text-gray-600">Vue d'ensemble de votre salle de sport</p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Rafraîchir
        </button>
      </div>

      {(expiredMembers.length > 0 || expiringMembers.length > 0) && (
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-red-500" />
              <h3 className="font-bold text-red-800">Alertes Adhésions</h3>
            </div>
            <div className="space-y-2">
              {expiredMembers.map(member => (
                <div
                  key={member.id}
                  className="text-sm text-red-700 cursor-pointer hover:underline"
                  onClick={() => handleAlertClick(member)}
                >
                  <span className="font-medium">{member.prenom} {member.nom}</span> - Adhésion expirée
                </div>
              ))}
              {expiringMembers.map(member => {
                const status = DashboardService.getSubscriptionStatus(member.date_expiration);
                return (
                  <div
                    key={member.id}
                    className="text-sm text-yellow-700 cursor-pointer hover:underline"
                    onClick={() => handleAlertClick(member)}
                  >
                    <span className="font-medium">{member.prenom} {member.nom}</span> - Expire dans {status.daysRemaining} jour{status.daysRemaining > 1 ? 's' : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats && Object.entries(stats).map(([label, value], index) => {
          const iconMap = {
            'Membres Actifs': Users,
            'Employés': UserCheck,
            'Revenus du Mois': DollarSign
          };
          const colorMap = {
            'Membres Actifs': 'bg-blue-500',
            'Employés': 'bg-green-500',
            'Revenus du Mois': 'bg-yellow-500'
          };
          const Icon = iconMap[label as keyof typeof iconMap];
          const color = colorMap[label as keyof typeof colorMap];

          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{label}</p>
                  <p className="text-3xl font-bold text-gray-800">{value}</p>
                </div>
                <div className={`${color} p-3 rounded-full`}>
                  {Icon && <Icon size={24} className="text-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Revenus Mensuels</h3>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};