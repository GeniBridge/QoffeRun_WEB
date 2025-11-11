import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home, Store, Users, Settings, BarChart3, CreditCard,
  Package, MessageSquare, Calendar, FileText, LogOut, Menu
} from 'lucide-react';

const sidebarItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard', exact: true },
  { path: '/dashboard/catene', icon: Store, label: 'Le Mie Catene' },
  { path: '/dashboard/filiali', icon: Store, label: 'Filiali' },
  { path: '/dashboard/personale', icon: Users, label: 'Personale' },
  { path: '/dashboard/ordini', icon: FileText, label: 'Ordini' },
  { path: '/dashboard/pagamenti', icon: CreditCard, label: 'Pagamenti' },
  { path: '/dashboard/prodotti', icon: Package, label: 'Prodotti & Menu' },
  { path: '/dashboard/recensioni', icon: MessageSquare, label: 'Recensioni' },
  { path: '/dashboard/report', icon: BarChart3, label: 'Report & Analytics' },
  { path: '/dashboard/orari', icon: Calendar, label: 'Orari & Calendario' },
  { path: '/dashboard/impostazioni', icon: Settings, label: 'Impostazioni' },
];

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">QoffeRun</h1>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b">
            <div className="text-xl font-bold text-orange-600">QoffeRun</div>
          </div>

          {/* User info */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Esci
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}