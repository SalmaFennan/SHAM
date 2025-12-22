import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart
} from 'lucide-react';

export const ShopModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  const products = [
    {
      id: 1,
      name: 'Tapis de Yoga',
      category: 'Yoga',
      price: 29.99,
      cost: 15.00,
      stock: 25,
      minStock: 10,
      sales: 45,
      image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 2,
      name: 'Haltères 5kg',
      category: 'Musculation',
      price: 49.99,
      cost: 25.00,
      stock: 15,
      minStock: 5,
      sales: 32,
      image: 'https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 3,
      name: 'Élastique de Résistance',
      category: 'Fitness',
      price: 19.99,
      cost: 8.00,
      stock: 3,
      minStock: 10,
      sales: 67,
      image: 'https://images.pexels.com/photos/4327024/pexels-photo-4327024.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 4,
      name: 'Bouteille d\'Eau',
      category: 'Accessoires',
      price: 12.99,
      cost: 5.00,
      stock: 50,
      minStock: 20,
      sales: 89,
      image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
  ];

  const recentSales = [
    { id: 1, product: 'Tapis de Yoga', customer: 'Marie Dubois', quantity: 1, amount: 29.99, date: '2024-03-15' },
    { id: 2, product: 'Haltères 5kg', customer: 'Pierre Martin', quantity: 2, amount: 99.98, date: '2024-03-14' },
    { id: 3, product: 'Bouteille d\'Eau', customer: 'Julie Leroux', quantity: 1, amount: 12.99, date: '2024-03-13' },
    { id: 4, product: 'Élastique de Résistance', customer: 'Thomas Durand', quantity: 1, amount: 19.99, date: '2024-03-12' },
  ];

  const stats = [
    { label: 'Produits en Stock', value: '93', icon: Package, color: 'bg-blue-500' },
    { label: 'Ventes du Mois', value: '2,450€', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Bénéfice Brut', value: '1,127€', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Ruptures de Stock', value: '3', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Boutique</h1>
          <p className="text-gray-600">Gestion des produits et des ventes</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={20} />
          Nouveau Produit
        </button>
      </div>

      {/* Statistiques */}
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

      {/* Alertes stock faible */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-red-500" />
            <h3 className="font-bold text-red-800">Alerte Stock Faible</h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map(product => (
              <div key={product.id} className="text-sm text-red-700">
                <span className="font-medium">{product.name}</span> - Stock: {product.stock} (Min: {product.minStock})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'products', label: 'Produits' },
              { id: 'sales', label: 'Ventes' },
              { id: 'analytics', label: 'Analyses' }
            ].map(tab => (
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
          {activeTab === 'products' && (
            <div>
              {/* Recherche et filtres */}
              <div className="flex gap-4 items-center mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Filter size={20} />
                  Filtrer
                </button>
              </div>

              {/* Grille de produits */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Prix</span>
                          <span className="font-medium">{product.price}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Stock</span>
                          <span className={`font-medium ${
                            product.stock <= product.minStock ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {product.stock}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Vendus</span>
                          <span className="font-medium">{product.sales}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Marge</span>
                          <span className="font-medium text-green-600">
                            {((product.price - product.cost) / product.price * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                          Modifier Stock
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6">Ventes Récentes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sale.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {sale.amount}€
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6">Analyses des Ventes</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top produits */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-800 mb-4">Produits les Plus Vendus</h4>
                  <div className="space-y-3">
                    {products
                      .sort((a, b) => b.sales - a.sales)
                      .slice(0, 5)
                      .map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <div>
                              <p className="font-medium text-gray-800">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800">{product.sales} vendus</p>
                            <p className="text-sm text-green-600">{(product.price * product.sales).toFixed(2)}€</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Catégories */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-800 mb-4">Ventes par Catégorie</h4>
                  <div className="h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <ShoppingCart size={48} className="mx-auto mb-2" />
                      <p className="text-lg">Graphique des catégories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};