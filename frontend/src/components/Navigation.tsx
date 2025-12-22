import React from 'react';
import { 
  Home, 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  ClipboardList
} from 'lucide-react';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeModule, setActiveModule }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
    { id: 'members', label: 'Membres', icon: Users },
    { id: 'employees', label: 'Employés', icon: UserCheck },
    { id: 'attendance', label: 'Présences', icon: ClipboardList },
    { id: 'classes', label: 'Cours', icon: Calendar },
    { id: 'finance', label: 'Finances', icon: DollarSign },
    { id: 'shop', label: 'Boutique', icon: ShoppingCart },
  ];

  return (
    <nav className="bg-blue-600 text-white w-72 min-h-screen p-4">
      {/* Logo + titre */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          {/* Titre de l'application */}
          <span className="text-2xl font-bold text-white whitespace-nowrap">
            LMS SHAM
          </span>
        </div>
        
        <p className="text-blue-100 text-sm leading-snug">
          Gestion de membres, présences, cours, finances et boutique.
        </p>
      </div>

      {/* Menu */}
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeModule === item.id 
                    ? 'bg-blue-700 text-white shadow-md' 
                    : 'hover:bg-blue-500 text-blue-50'
                }`}
              >
                <Icon size={20} />
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};