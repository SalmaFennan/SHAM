import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Eye, Trash2,
  Phone, Mail, CreditCard, AlertTriangle, Clock, Save, Check, X
} from 'lucide-react';
import { 
  getSubscriptionStatus, 
  formatDate, 
  addMonthsToDate,
  toISODateString,
  calculateExpirationDate
} from '../utils/dateUtils';
import { 
  getMembers, 
  renewMember,
  createMember,
  deleteMember
} from '../services/membresService';
import axios from 'axios';
import api from '../services/api';

interface Member {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_adhesion: string;
  date_expiration: string;
  type_adhesion: 'mixte' | 'femme';
  pack: '1mois' | '3mois' | '6mois' | '12mois' | '3moisDuo' | '6moisDuo' | '12moisDuo';
  prix_paye: number;
  assurance_payee: boolean;
  statut: 'actif' | 'expiré' | 'suspendu';
  photo_url?: string;
}

const safeFormatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'Date invalide';
  try {
    return formatDate(date);
  } catch (error) {
    console.error('Erreur de formatage:', error);
    return 'Date invalide';
  }
};

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const MembersModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [newMember, setNewMember] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    type_adhesion: 'mixte' as 'mixte' | 'femme',
    pack: '1mois',
    prix_paye: 200,
    assurance_payee: false,
    date_adhesion: toISODateString(new Date()),
    photoFile: null as File | null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const membersData = await getMembers();
        setMembers(membersData);
      } catch (err) {
        setError('Erreur lors du chargement des membres');
        console.error('Détails de l\'erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredMembers = members.filter(member => {
    const nomComplet = `${member.nom} ${member.prenom}`.toLowerCase();
    const email = member.email?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    return nomComplet.includes(searchTermLower) || 
           email.includes(searchTermLower);
  });

  const expiredMembers = members.filter(member => {
    const status = getSubscriptionStatus(member.date_expiration);
    return status.status === 'expired';
  });

  const expiringMembers = members.filter(member => {
    const status = getSubscriptionStatus(member.date_expiration);
    return status.status === 'expiring';
  });

  const handleRenewalPayment = async (member: Member) => {
    try {
      await renewMember(member.id);
      const updatedMembers = await getMembers();
      setMembers(updatedMembers);
      setShowRenewalModal(false);
      setSelectedMember(null);
    } catch (err) {
      console.error('Erreur lors du renouvellement:', err);
      setError('Erreur lors du renouvellement de l\'adhésion');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewMember({...newMember, photoFile: file});
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const dateExpiration = calculateExpirationDate(
        newMember.date_adhesion,
        newMember.type_adhesion,
        newMember.pack
      );

      const memberData = {
        nom: newMember.nom.trim(),
        prenom: newMember.prenom.trim(),
        email: newMember.email.trim(),
        telephone: newMember.telephone.trim(),
        type_adhesion: newMember.type_adhesion,
        pack: newMember.pack,
        prix_paye: newMember.prix_paye,
        assurance_payee: newMember.assurance_payee,
        date_adhesion: newMember.date_adhesion,
        date_expiration: dateExpiration,
        photoFile: newMember.photoFile
      };

      await createMember(memberData);

      const updatedMembers = await getMembers();
      setMembers(updatedMembers);

      setNewMember({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        type_adhesion: 'mixte',
        pack: '1mois',
        prix_paye: 200,
        assurance_payee: false,
        date_adhesion: toISODateString(new Date()),
        photoFile: null
      });
      setPreviewImage(null);
      setShowAddForm(false);
      alert('Membre créé avec succès');

    } catch (error) {
      console.error('Erreur création membre:', error);
      let errorMessage = 'Erreur lors de la création du membre';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await deleteMember(id);
      setMembers(members.filter(member => member.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression du membre');
    }
  };

  const handlePackChange = (pack: Member['pack']) => {
    const prix = {
      '1mois': 200,
      '3mois': 550,
      '6mois': 1000,
      '12mois': 1800,
      '3moisDuo': 900,
      '6moisDuo': 1800,
      '12moisDuo': 3400
    };
    
    setNewMember({
      ...newMember,
      pack,
      prix_paye: prix[pack]
    });
  };

  const calculateRenewalPrice = (member: Member) => {
    if (member.type_adhesion === 'femme') {
      return 150;
    }
    
    switch(member.pack) {
      case '1mois': return 200;
      case '3mois': return 550;
      case '6mois': return 1000;
      case '12mois': return 1800;
      case '3moisDuo': return 900;
      case '6moisDuo': return 1800;
      case '12moisDuo': return 3400;
      default: return 200;
    }
  };

  const getPackLabel = (pack: Member['pack']) => {
    switch(pack) {
      case '1mois': return '1 mois (200 DH)';
      case '3mois': return '3 mois (550 DH)';
      case '6mois': return '6 mois (1000 DH)';
      case '12mois': return '12 mois (1800 DH)';
      case '3moisDuo': return '3 mois Duo (900 DH)';
      case '6moisDuo': return '6 mois Duo (1800 DH)';
      case '12moisDuo': return '12 mois Duo (3400 DH)';
      default: return pack;
    }
  };

  const handleViewMember = (id: number) => {
    console.log('Voir membre ID:', id);
  };

  const handleEditMember = (member: Member) => {
    setNewMember({
      nom: member.nom,
      prenom: member.prenom,
      email: member.email,
      telephone: member.telephone,
      type_adhesion: member.type_adhesion,
      pack: member.pack,
      prix_paye: member.prix_paye,
      assurance_payee: member.assurance_payee,
      date_adhesion: member.date_adhesion,
      photoFile: null
    });
    setPreviewImage(member.photo_url ? `${API_URL}${member.photo_url}` : null);
    setShowAddForm(true);
  };

  if (loading) return <div className="p-6 text-center">Chargement en cours...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Membres</h1>
          <p className="text-gray-600">Gérez les adhésions et les informations des membres</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau Membre
        </button>
      </div>

      {(expiredMembers.length > 0 || expiringMembers.length > 0) && (
        <div className="space-y-4 mb-6">
          {expiredMembers.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className="text-red-500" />
                <h3 className="font-bold text-red-800">
                  Adhésions Expirées ({expiredMembers.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {expiredMembers.map(member => {
                  const status = getSubscriptionStatus(member.date_expiration);
                  return (
                    <div key={member.id} className="bg-white p-3 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photo_url 
                            ? `${API_URL}${member.photo_url}`
                            : '/images/default-avatar.jpg'
                          }
                          alt={`${member.nom} ${member.prenom}`}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-avatar.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{member.nom} {member.prenom}</p>
                          <p className="text-sm text-red-600">
                            Expiré depuis {Math.abs(status.daysRemaining)} jour{Math.abs(status.daysRemaining) > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fin: {formatDate(member.date_expiration)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowRenewalModal(true);
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Renouveler
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {expiringMembers.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={20} className="text-yellow-500" />
                <h3 className="font-bold text-yellow-800">
                  Adhésions Expirant Bientôt ({expiringMembers.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {expiringMembers.map(member => {
                  const status = getSubscriptionStatus(member.date_expiration);
                  return (
                    <div key={member.id} className="bg-white p-3 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photo_url 
                            ? `${API_URL}${member.photo_url}`
                            : '/images/default-avatar.jpg'
                          }
                          alt={`${member.nom} ${member.prenom}`}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-avatar.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{member.nom} {member.prenom}</p>
                          <p className="text-sm text-yellow-600">
                            Expire dans {status.daysRemaining} jour{status.daysRemaining > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fin: {formatDate(member.date_expiration)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowRenewalModal(true);
                          }}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                        >
                          Renouveler
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type Adhésion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pack
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assurance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={member.photo_url 
                          ? `${API_URL}${member.photo_url}`
                          : '/images/default-avatar.jpg'
                        }
                        alt={`${member.nom} ${member.prenom}`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/default-avatar.jpg';
                        }}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.nom} {member.prenom}
                        </div>
                        <div className="text-sm text-gray-500">
                          Membre depuis {formatDate(member.date_adhesion)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Phone size={16} />
                      {member.telephone}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail size={16} />
                      {member.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.type_adhesion === 'femme' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.type_adhesion === 'femme' ? '100% Femme' : 'Mixte'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.pack.includes('Duo') ? 'bg-indigo-100 text-indigo-800' :
                      member.pack === '12mois' ? 'bg-purple-100 text-purple-800' :
                      member.pack === '6mois' ? 'bg-blue-100 text-blue-800' :
                      member.pack === '3mois' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getPackLabel(member.pack)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.assurance_payee ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" /> Payée
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" /> Non payée
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const safeDate = safeFormatDate(member.date_expiration);
                      const status = getSubscriptionStatus(member.date_expiration);
                      return (
                        <div>
                          <p className="text-sm text-gray-900">{safeDate}</p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            status.status === 'expired' ? 'bg-red-100 text-red-800' :
                            status.status === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                            status.status === 'invalid' ? 'bg-gray-100 text-gray-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {status.status === 'invalid' ? 'Date invalide' : status.message}
                            {status.status === 'expiring' && (
                              <span> ({status.daysRemaining} jours)</span>
                            )}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      !member.statut ? 'bg-gray-100 text-gray-800' :
                      member.statut === 'expiré' ? 'bg-red-100 text-red-800' :
                      member.statut === 'suspendu' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {!member.statut ? 'Inconnu' : 
                       member.statut === 'expiré' ? 'Expiré' : 
                       member.statut === 'suspendu' ? 'Suspendu' : 'Actif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleViewMember(member.id)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => handleEditMember(member)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRenewalModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                        title="Renouveler l'adhésion"
                        disabled={!member.date_expiration}
                      >
                        <CreditCard size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-900"
                      >
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

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nouveau Membre</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo du membre
                </label>
                <div className="flex items-center gap-4">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      className="w-16 h-16 rounded-full object-cover border"
                      alt="Aperçu"
                    />
                  ) : (
                    <img
                      src="/images/default-avatar.jpg"
                      className="w-16 h-16 rounded-full object-cover border"
                      alt="Image par défaut"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom*
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom"
                    value={newMember.nom}
                    onChange={(e) => setNewMember({...newMember, nom: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom*
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Prénom"
                    value={newMember.prenom}
                    onChange={(e) => setNewMember({...newMember, prenom: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemple.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="06 12 34 56 78"
                  value={newMember.telephone}
                  onChange={(e) => setNewMember({...newMember, telephone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'adhésion*
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMember.type_adhesion}
                  onChange={(e) => {
                    const newType = e.target.value as 'mixte' | 'femme';
                    const defaultPack = '1mois';
                    const prix = newType === 'femme' ? 150 : 200;
                    
                    setNewMember({
                      ...newMember,
                      type_adhesion: newType,
                      pack: defaultPack,
                      prix_paye: prix
                    });
                  }}
                  required
                >
                  <option value="mixte">Mixte</option>
                  <option value="femme">100% Femme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pack*
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMember.pack}
                  onChange={(e) => handlePackChange(e.target.value as Member['pack'])}
                  required
                >
                  {newMember.type_adhesion === 'femme' ? (
                    <option value="1mois">1 mois (150 DH)</option>
                  ) : (
                    <>
                      <option value="1mois">1 mois (200 DH)</option>
                      <option value="3mois">3 mois (550 DH)</option>
                      <option value="6mois">6 mois (1000 DH)</option>
                      <option value="12mois">12 mois (1800 DH)</option>
                      <option value="3moisDuo">3 mois Duo (900 DH)</option>
                      <option value="6moisDuo">6 mois Duo (1800 DH)</option>
                      <option value="12moisDuo">12 mois Duo (3400 DH)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix payé (DH)*
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMember.prix_paye}
                  onChange={(e) => setNewMember({...newMember, prix_paye: Number(e.target.value)})}
                  min="0"
                  step="50"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="assurance_payee"
                  checked={newMember.assurance_payee}
                  onChange={(e) => setNewMember({...newMember, assurance_payee: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="assurance_payee" className="ml-2 block text-sm text-gray-700">
                  Assurance payée (100 DH)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'adhésion*
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMember.date_adhesion.split('T')[0]}
                  onChange={(e) => setNewMember({...newMember, date_adhesion: e.target.value})}
                  required
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
                  onClick={handleCreateMember}
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    'Enregistrement...'
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRenewalModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Renouvellement d'Adhésion</h2>
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedMember.photo_url 
                    ? `${API_URL}${selectedMember.photo_url}`
                    : '/images/default-avatar.jpg'
                  }
                  alt={`${selectedMember.nom} ${selectedMember.prenom}`}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-avatar.jpg';
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedMember.nom} {selectedMember.prenom}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedMember.type_adhesion === 'femme' ? '100% Femme' : 'Mixte'} - 
                    {getPackLabel(selectedMember.pack)}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Adhésion actuelle:</span>
                  <span className="font-medium">
                    {formatDate(selectedMember.date_adhesion)} - {formatDate(selectedMember.date_expiration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nouvelle période:</span>
                  <span className="font-medium text-green-600">
                    {formatDate(new Date())} - {(() => {
                      const endDate = new Date();
                      if (selectedMember.type_adhesion === 'femme') {
                        endDate.setMonth(endDate.getMonth() + 1);
                      } else {
                        switch(selectedMember.pack) {
                          case '1mois': endDate.setMonth(endDate.getMonth() + 1); break;
                          case '3mois': 
                          case '3moisDuo': endDate.setMonth(endDate.getMonth() + 3); break;
                          case '6mois': 
                          case '6moisDuo': endDate.setMonth(endDate.getMonth() + 6); break;
                          case '12mois': 
                          case '12moisDuo': endDate.setMonth(endDate.getMonth() + 12); break;
                          default: endDate.setMonth(endDate.getMonth() + 1);
                        }
                      }
                      return formatDate(endDate);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant:</span>
                  <span className="font-bold text-blue-600">
                    {calculateRenewalPrice(selectedMember)} DH
                  </span>
                </div>
                {!selectedMember.assurance_payee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assurance:</span>
                    <span className="font-bold text-blue-600">
                      +100 DH (non payée)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowRenewalModal(false);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleRenewalPayment(selectedMember)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirmer le Paiement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};