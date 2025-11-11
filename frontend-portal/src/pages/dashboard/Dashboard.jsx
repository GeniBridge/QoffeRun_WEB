import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chainsAPI, branchesAPI, ordersAPI, paymentsAPI } from '../../services/api';
import { 
  Store, Users, ShoppingCart, Euro, TrendingUp, TrendingDown,
  Clock, MapPin, Star, AlertCircle
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200", 
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200"
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp size={16} className="text-green-600 mr-1" />
              ) : (
                <TrendingDown size={16} className="text-red-600 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities = [] }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recente</h3>
    <div className="space-y-4">
      {activities.length > 0 ? activities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-900">{activity.description}</p>
            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
          </div>
        </div>
      )) : (
        <div className="text-center py-8 text-gray-500">
          <Clock size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Nessuna attività recente</p>
        </div>
      )}
    </div>
  </div>
);

const BranchPerformance = ({ branches = [] }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Filiali</h3>
    <div className="space-y-4">
      {branches.length > 0 ? branches.map((branch) => (
        <div key={branch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <MapPin size={20} className="text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{branch.name}</p>
              <p className="text-sm text-gray-500">{branch.city}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Star size={16} className="text-yellow-500" />
              <span className="font-medium">{branch.rating || '4.5'}</span>
            </div>
            <p className="text-sm text-gray-500">{branch.orders_today || 0} ordini oggi</p>
          </div>
        </div>
      )) : (
        <div className="text-center py-8 text-gray-500">
          <Store size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Nessuna filiale trovata</p>
          <button className="mt-2 text-orange-600 hover:text-orange-700 font-medium">
            Aggiungi la tua prima filiale
          </button>
        </div>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    chains: 0,
    branches: 0,
    totalOrders: 0,
    totalRevenue: 0,
    ordersToday: 0,
    revenueToday: 0
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities] = useState([
    {
      description: "Nuovo ordine ricevuto da Coffee Heaven - Centro",
      time: "2 minuti fa"
    },
    {
      description: "Mario Rossi ha iniziato il turno alla filiale Navigli",
      time: "1 ora fa"  
    },
    {
      description: "Nuova recensione 5 stelle per Coffee Heaven - Centro",
      time: "3 ore fa"
    }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carica catene
      const chainsResponse = await chainsAPI.list();
      const chains = chainsResponse.data.data || [];
      
      // Carica filiali
      const branchesResponse = await branchesAPI.list();
      const branchesData = branchesResponse.data.data || [];
      
      // Mock stats per ora (implementare con API reali)
      setStats({
        chains: chains.length,
        branches: branchesData.length,
        totalOrders: 1247,
        totalRevenue: 45230.50,
        ordersToday: 23,
        revenueToday: 678.90
      });
      
      setBranches(branchesData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Benvenuto, {user?.name}! ☕
            </h1>
            <p className="text-gray-600 mt-1">
              Ecco un riepilogo delle tue attività di oggi, {format(new Date(), 'EEEE d MMMM yyyy', { locale: it })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Ultimo aggiornamento</div>
            <div className="text-lg font-semibold text-gray-900">
              {format(new Date(), 'HH:mm')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Catene Totali"
          value={stats.chains}
          icon={Store}
          color="blue"
        />
        <StatCard
          title="Filiali Totali"
          value={stats.branches}
          icon={MapPin}
          color="green"
        />
        <StatCard
          title="Ordini Oggi"
          value={stats.ordersToday}
          icon={ShoppingCart}
          trend="up"
          trendValue="+12%"
          color="orange"
        />
        <StatCard
          title="Fatturato Oggi"
          value={`€${stats.revenueToday.toFixed(2)}`}
          icon={Euro}
          trend="up"
          trendValue="+8%"
          color="purple"
        />
      </div>

      {/* Revenue Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Panoramica Fatturato</h3>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
            <option value="7">Ultimi 7 giorni</option>
            <option value="30">Ultimo mese</option>
            <option value="90">Ultimi 3 mesi</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">€{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Fatturato Totale</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            <div className="text-sm text-gray-600">Ordini Totali</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">€{(stats.totalRevenue / stats.totalOrders || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-600">Scontrino Medio</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BranchPerformance branches={branches} />
        <RecentActivity activities={activities} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
            <Store size={20} className="mr-2" />
            Nuova Filiale
          </button>
          <button className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Users size={20} className="mr-2" />
            Aggiungi Staff
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <ShoppingCart size={20} className="mr-2" />
            Vedi Ordini
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <AlertCircle size={20} className="mr-2" />
            Report
          </button>
        </div>
      </div>
    </div>
  );
}