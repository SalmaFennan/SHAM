import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  User,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ClassesModule: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  const classes = [
    {
      id: 1,
      name: 'Yoga Matinal',
      instructor: 'Sophie Martin',
      time: '08:00 - 09:00',
      day: 'Lundi',
      participants: 12,
      maxParticipants: 15,
      room: 'Salle 1',
      type: 'Yoga'
    },
    {
      id: 2,
      name: 'Musculation',
      instructor: 'Marc Dubois',
      time: '10:00 - 11:30',
      day: 'Lundi',
      participants: 8,
      maxParticipants: 12,
      room: 'Salle de Musculation',
      type: 'Musculation'
    },
    {
      id: 3,
      name: 'Cardio Training',
      instructor: 'Julie Leroux',
      time: '14:00 - 15:00',
      day: 'Mardi',
      participants: 15,
      maxParticipants: 20,
      room: 'Salle 2',
      type: 'Cardio'
    },
    {
      id: 4,
      name: 'Pilates',
      instructor: 'Emma Wilson',
      time: '17:00 - 18:00',
      day: 'Mercredi',
      participants: 10,
      maxParticipants: 15,
      room: 'Salle 1',
      type: 'Pilates'
    },
  ];

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const getClassForDayAndTime = (day: string, hour: string) => {
    return classes.find(c => c.day === day && c.time.startsWith(hour));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Yoga': return 'bg-green-500';
      case 'Musculation': return 'bg-blue-500';
      case 'Cardio': return 'bg-red-500';
      case 'Pilates': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Planification des Cours</h1>
          <p className="text-gray-600">Gérez les horaires et les cours de votre salle</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau Cours
        </button>
      </div>

      {/* Statistiques des cours */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cours Actifs</p>
              <p className="text-3xl font-bold text-gray-800">24</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Participants Total</p>
              <p className="text-3xl font-bold text-gray-800">245</p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Taux de Remplissage</p>
              <p className="text-3xl font-bold text-gray-800">78%</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-full">
              <User size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cours Aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-800">8</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Planning hebdomadaire */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Planning Hebdomadaire</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-600">Semaine du 4 - 10 Mars 2024</span>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <th className="w-20 p-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                {days.map(day => (
                  <th key={day} className="w-32 p-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map(hour => (
                <tr key={hour} className="border-t">
                  <td className="p-3 text-sm text-gray-600 font-medium">{hour}</td>
                  {days.map(day => {
                    const classForSlot = getClassForDayAndTime(day, hour);
                    return (
                      <td key={`${day}-${hour}`} className="p-1">
                        {classForSlot ? (
                          <div className={`${getTypeColor(classForSlot.type)} text-white p-2 rounded-lg text-xs`}>
                            <div className="font-medium">{classForSlot.name}</div>
                            <div className="opacity-75">{classForSlot.instructor}</div>
                            <div className="opacity-75">{classForSlot.participants}/{classForSlot.maxParticipants}</div>
                          </div>
                        ) : (
                          <div className="h-16 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Tous les Cours</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${getTypeColor(course.type)} mr-3`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        <div className="text-sm text-gray-500">{course.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{course.day}</div>
                    <div className="text-gray-500">{course.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      {course.participants}/{course.maxParticipants}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.room}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-green-600 hover:text-green-900">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulaire d'ajout de cours */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nouveau Cours</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du cours
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Yoga Débutant"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de cours
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Yoga</option>
                  <option>Musculation</option>
                  <option>Cardio</option>
                  <option>Pilates</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formateur
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Sophie Martin</option>
                  <option>Marc Dubois</option>
                  <option>Julie Leroux</option>
                  <option>Emma Wilson</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jour
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {days.map(day => (
                      <option key={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité maximale
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};