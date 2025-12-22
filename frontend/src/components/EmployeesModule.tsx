import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Award,
  Loader2,
  Briefcase,
  CheckCircle,
  XCircle,
  User,
  Clock
} from 'lucide-react';
import { EmployeeService } from '../services/employeService';
import { Employee, DashboardStats } from '../types/employe';

export const EmployeesModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    trainers: 0,
    payroll: 0,
    presentToday: 0
  });
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [editEmployee, setEditEmployee] = useState<Partial<Employee> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employeesData = await EmployeeService.getAll();
        if (Array.isArray(employeesData)) {
          const normalizedEmployees = employeesData.map(employee => ({
            ...employee,
            photo_url: employee.photo_url || 'https://via.placeholder.com/50',
            salaire: typeof employee.salaire === 'string' ? parseFloat(employee.salaire) : employee.salaire
          }));
          setEmployees(normalizedEmployees);
        } else {
          setEmployees([]);
        }
        const statsData = await EmployeeService.getDashboardStats();
        setStats(statsData);
      } catch (err) {
        setError('Erreur lors du chargement des données des employés. Vérifiez votre connexion ou le serveur.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEmployees = Array.isArray(employees) ? employees.filter(employee =>
    `${employee.nom} ${employee.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.poste.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handlePayroll = async () => {
    try {
      setLoading(true);
      if (employees.length === 0) {
        alert('Aucun employé actif pour traiter la paie.');
        return;
      }
      const result = await EmployeeService.processPayroll();
      alert(result.message);
      const statsData = await EmployeeService.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      setError('Erreur lors du traitement de la paie. Vérifiez votre connexion.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await EmployeeService.delete(id);
        setEmployees(employees.filter(emp => emp.id !== id));
        alert('Employé supprimé avec succès');
        const statsData = await EmployeeService.getDashboardStats();
        setStats(statsData);
      } catch (err) {
        setError('Erreur lors de la suppression de l\'employé. Vérifiez votre connexion.');
        console.error(err);
      }
    }
  };

  const handleEdit = (id: number) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      setEditEmployee({ ...employee });
      setPhotoPreview(employee.photo_url || 'https://via.placeholder.com/50');
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = async () => {
    try {
      setFormError(null);
      if (!editEmployee?.nom || !editEmployee?.prenom || !editEmployee?.poste || !editEmployee?.salaire || !editEmployee?.date_embauche) {
        setFormError('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Poste, Salaire, Date d\'embauche).');
        return;
      }
      if (editEmployee.id) {
        const formData = new FormData();
        formData.append('nom', editEmployee.nom);
        formData.append('prenom', editEmployee.prenom);
        formData.append('email', editEmployee.email || '');
        formData.append('telephone', editEmployee.telephone || '');
        formData.append('poste', editEmployee.poste);
        formData.append('salaire', (Number(editEmployee.salaire) || 0).toFixed(2));
        formData.append('date_embauche', editEmployee.date_embauche);
        formData.append('statut', editEmployee.statut || 'Actif');
        if (photoPreview && photoPreview.startsWith('data:')) {
          const blob = await fetch(photoPreview).then(res => res.blob());
          formData.append('photo', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
        }
        await EmployeeService.update(editEmployee.id, { ...editEmployee, photo_url: photoPreview || 'https://via.placeholder.com/50' });
        setEmployees(employees.map(emp => emp.id === editEmployee.id ? { ...emp, ...editEmployee, photo_url: photoPreview || 'https://via.placeholder.com/50' } : emp));
        setIsEditModalOpen(false);
        alert('Employé mis à jour avec succès');
        const statsData = await EmployeeService.getDashboardStats();
        setStats(statsData);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'employé. Vérifiez votre connexion.');
      console.error(err);
    }
  };

  const handleView = (id: number) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      alert(`Détails : ${employee.nom} ${employee.prenom}, Poste : ${employee.poste}, Salaire : ${employee.salaire.toLocaleString('fr-FR')}€`);
    }
  };

  const handleAddEmployee = async () => {
    try {
      setFormError(null);
      if (!newEmployee.nom || !newEmployee.prenom || !newEmployee.poste || !newEmployee.salaire || !newEmployee.date_embauche) {
        setFormError('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Poste, Salaire, Date d\'embauche).');
        return;
      }
      const formData = new FormData();
      formData.append('nom', newEmployee.nom);
      formData.append('prenom', newEmployee.prenom);
      formData.append('email', newEmployee.email || '');
      formData.append('telephone', newEmployee.telephone || '');
      formData.append('poste', newEmployee.poste);
      formData.append('salaire', (parseFloat(newEmployee.salaire as string) || 0).toFixed(2));
      formData.append('date_embauche', newEmployee.date_embauche || new Date().toISOString().split('T')[0]);
      formData.append('statut', newEmployee.statut || 'Actif');
      if (photoPreview && photoPreview.startsWith('data:')) {
        const blob = await fetch(photoPreview).then(res => res.blob());
        formData.append('photo', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      }
      const newId = await EmployeeService.create({ ...newEmployee, photo_url: photoPreview || 'https://via.placeholder.com/50' });
      setEmployees([...employees, { ...newEmployee, id: newId, photo_url: photoPreview || 'https://via.placeholder.com/50' } as Employee]);
      setNewEmployee({});
      setPhotoPreview(null);
      setIsAddModalOpen(false);
      alert('Employé ajouté avec succès');
      const statsData = await EmployeeService.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'employé. Vérifiez votre connexion.');
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && name === 'salaire') {
      setNewEmployee(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
      if (editEmployee) setEditEmployee(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setNewEmployee(prev => ({ ...prev, [name]: value }));
      if (editEmployee) setEditEmployee(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error} <button onClick={() => window.location.reload()} className="ml-2 text-blue-500 underline">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <User className="text-blue-600" size={28} />
              Gestion des Employés
            </h1>
            <p className="text-gray-600 mt-1">Gérez votre équipe et les formateurs</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 shadow-md"
              onClick={handlePayroll}
              disabled={loading}
            >
              <DollarSign size={20} />
              <span>Traiter la Paie</span>
            </button>
            <button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-md"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} />
              <span>Nouvel Employé</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Employés</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalEmployees}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Formateurs</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.trainers}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Masse Salariale</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.payroll.toLocaleString('fr-FR')}€</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Présents Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.presentToday}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <CheckCircle className="text-amber-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Rechercher un employé par nom, prénom ou poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poste
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salaire
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              src={employee.photo_url || 'https://via.placeholder.com/50'}
                              alt={`${employee.nom} ${employee.prenom}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{`${employee.nom} ${employee.prenom}`}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Clock size={14} className="text-gray-400" />
                              <span>Embauché le {new Date(employee.date_embauche).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Phone size={16} className="text-gray-500" />
                          {employee.telephone || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Mail size={16} className="text-gray-500" />
                          {employee.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Briefcase size={16} className="text-blue-500" />
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                            {employee.poste}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        {employee.salaire && typeof employee.salaire === 'number' ? `${employee.salaire.toLocaleString('fr-FR')}€` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${
                          employee.statut === 'Actif' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {employee.statut === 'Actif' ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <XCircle size={14} className="text-red-500" />
                          )}
                          {employee.statut || 'Actif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleView(employee.id)}
                            className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded-full hover:bg-blue-50"
                            title="Voir détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(employee.id)}
                            className="text-amber-500 hover:text-amber-700 transition-colors p-1 rounded-full hover:bg-amber-50"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Aucun employé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Employee Modal */}
        {isAddModalOpen && (
          <dialog open className="modal modal-open">
            <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg z-50">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <User size={24} className="text-blue-500" />
                  Ajouter un Nouvel Employé
                </h3>
                <button 
                  onClick={() => { setFormError(null); setNewEmployee({}); setPhotoPreview(null); setIsAddModalOpen(false); }}
                  className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="alert alert-error mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Upload */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={photoPreview || 'https://via.placeholder.com/50'}
                        alt="Prévisualisation"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                      <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-300 cursor-pointer hover:bg-gray-100">
                        <Edit size={16} className="text-gray-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="file-input file-input-bordered w-full text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Formats supportés: JPG, PNG (max. 2MB)</p>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <User size={18} className="text-blue-500" />
                    Informations Personnelles
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="nom"
                      placeholder="Nom de famille"
                      value={newEmployee.nom || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full mt-1 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="prenom"
                      placeholder="Prénom"
                      value={newEmployee.prenom || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full mt-1 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="email@exemple.com"
                        value={newEmployee.email || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-10 mt-1 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="telephone"
                        placeholder="+33 6 12 34 56 78"
                        value={newEmployee.telephone || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-10 mt-1 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Briefcase size={18} className="text-blue-500" />
                    Informations Professionnelles
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Poste <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="poste"
                      placeholder="Ex: Formateur, Manager..."
                      value={newEmployee.poste || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full mt-1 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Salaire <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="salaire"
                        placeholder="1500.00"
                        value={newEmployee.salaire || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-10 mt-1 focus:ring-2 focus:ring-blue-500"
                        required
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'embauche <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="date_embauche"
                        value={newEmployee.date_embauche || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-10 mt-1 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <select
                      name="statut"
                      value={newEmployee.statut || 'Actif'}
                      onChange={handleInputChange}
                      className="select select-bordered w-full mt-1 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-action mt-6 flex justify-end gap-4">
                <button 
                  className="btn btn-ghost text-gray-600 hover:bg-gray-100 border border-gray-300"
                  onClick={() => { setFormError(null); setNewEmployee({}); setPhotoPreview(null); setIsAddModalOpen(false); }}
                >
                  Annuler
                </button>
                <button 
                  className="btn btn-primary bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
                  onClick={handleAddEmployee}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Ajouter Employé'}
                </button>
              </div>
            </div>
          </dialog>
        )}

        {/* Edit Employee Modal */}
        {isEditModalOpen && editEmployee && (
          <dialog open className="modal modal-open">
            <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg z-50">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <User size={24} className="text-blue-500" />
                  Modifier un Employé
                </h3>
                <button 
                  onClick={() => { setFormError(null); setEditEmployee(null); setPhotoPreview(null); setIsEditModalOpen(false); }}
                  className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="alert alert-error mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Upload */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={photoPreview || 'https://via.placeholder.com/50'}
                        alt="Prévisualisation"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                      <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-300 cursor-pointer hover:bg-gray-100">
                        <Edit size={16} className="text-gray-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="file-input file-input-bordered w-full text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Formats supportés: JPG, PNG (max. 2MB)</p>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <User size={18} className="text-blue-500" />
                    Informations Personnelles
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="nom"
                      placeholder="Nom de famille"
                      value={editEmployee.nom || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full mt-1 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="prenom"
                      placeholder="Prénom"
                      value={editEmployee.prenom || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full mt-1 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="email@exemple.com"
                        value={editEmployee.email || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-10 mt-1 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="telephone"
                        placeholder="+33 6 12 34 56 78"
                        value={editEmployee.telephone || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-10 mt-1 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Briefcase size={18} className="text-blue-500" />
                    Informations Professionnelles
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Poste <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="poste"
                      placeholder="Ex: Formateur, Manager..."
                      value={editEmployee.poste || ''}
                      onChange={handleInputChange}
                      className="input input-bordered w-full mt-1 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Salaire <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        name="salaire"
                        placeholder="1500.00"
                        value={editEmployee.salaire || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-10 mt-1 focus:ring-2 focus:ring-blue-500"
                        required
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'embauche <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="date_embauche"
                        value={editEmployee.date_embauche ? new Date(editEmployee.date_embauche).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-10 mt-1 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <select
                      name="statut"
                      value={editEmployee.statut || 'Actif'}
                      onChange={handleInputChange}
                      className="select select-bordered w-full mt-1 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-action mt-6 flex justify-end gap-4">
                <button 
                  className="btn btn-ghost text-gray-600 hover:bg-gray-100 border border-gray-300"
                  onClick={() => { setFormError(null); setEditEmployee(null); setPhotoPreview(null); setIsEditModalOpen(false); }}
                >
                  Annuler
                </button>
                <button 
                  className="btn btn-primary bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md"
                  onClick={handleUpdate}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
};