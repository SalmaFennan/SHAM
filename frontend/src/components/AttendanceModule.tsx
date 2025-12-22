import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const attendanceData = [
    {
      id: 1,
      name: 'Marie Dubois',
      photo: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
      entryTime: '08:30',
      exitTime: '10:15',
      duration: '1h 45m',
      status: 'Présent'
    },
    {
      id: 2,
      name: 'Pierre Martin',
      photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      entryTime: '09:00',
      exitTime: '11:30',
      duration: '2h 30m',
      status: 'Présent'
    },
    {
      id: 3,
      name: 'Julie Leroux',
      photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      entryTime: '-',
      exitTime: '-',
      duration: '-',
      status: 'Absent'
    },
    {
      id: 4,
      name: 'Thomas Durand',
      photo: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
      entryTime: '14:00',
      exitTime: '-',
      duration: 'En cours',
      status: 'En cours'
    },
  ];

  const stats = [
    { label: 'Présents Aujourd\'hui', value: '28', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Absents', value: '5', icon: XCircle, color: 'bg-red-500' },
    { label: 'En Cours', value: '12', icon: Clock, color: 'bg-blue-500' },
    { label: 'Durée Moyenne', value: '2h 15m', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Présences</h1>
          <p className="text-gray-600">Suivi des adhérents</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Statistiques de présence */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphique de présence hebdomadaire */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Présence Hebdomadaire</h2>
        <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <div className="text-white text-center">
            <TrendingUp size={48} className="mx-auto mb-2" />
            <p className="text-lg">Graphique de présence</p>
            <p className="text-sm opacity-75">Moyenne: 35 adhérent/jour</p>
          </div>
        </div>
      </div>

      {/* Liste des présences */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Présences du {selectedDate}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heure d'Entrée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heure de Sortie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={attendance.photo}
                        alt={attendance.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{attendance.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      {attendance.entryTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      {attendance.exitTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attendance.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      attendance.status === 'Présent' ? 'bg-green-100 text-green-800' :
                      attendance.status === 'Absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {attendance.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Alertes</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle size={20} className="text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Absence répétée</p>
              <p className="text-xs text-yellow-600">Julie Leroux n'est pas venue depuis 3 jours</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <XCircle size={20} className="text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">Adhésion expirée</p>
              <p className="text-xs text-red-600">L'adhésion de Pierre Martin expire demain</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};