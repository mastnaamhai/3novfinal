import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MobilePDFStyles } from './ui/MobilePDFStyles';

interface NavigationProps {
  onLogout: () => void;
  isAuthenticated: boolean;
  companyInfo?: { logo?: string; name?: string };
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  isActive?: (pathname: string) => boolean;
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '🏠',
    path: '/dashboard',
    isActive: (pathname) => pathname === '/dashboard'
  },
  {
    id: 'lorry-receipts',
    label: 'Lorry Receipts',
    icon: '📄',
    path: '/lorry-receipts',
    isActive: (pathname) => pathname.startsWith('/lorry-receipts')
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: '🧾',
    path: '/invoices',
    isActive: (pathname) => pathname.startsWith('/invoices')
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: '💰',
    path: '/payments',
    isActive: (pathname) => pathname === '/payments'
  },
  {
    id: 'ledger',
    label: 'Ledger',
    icon: '📊',
    path: '/enhanced-ledger',
    isActive: (pathname) => pathname.startsWith('/ledger') || pathname.startsWith('/enhanced-ledger')
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: '👥',
    path: '/clients',
    isActive: (pathname) => pathname === '/clients'
  },
  {
    id: 'truck-hiring',
    label: 'Truck Hiring',
    icon: '🚛',
    path: '/truck-hiring',
    isActive: (pathname) => pathname.startsWith('/truck-hiring')
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    path: '/settings',
    isActive: (pathname) => pathname === '/settings'
  }
];

export const Navigation: React.FC<NavigationProps> = ({ 
  onLogout, 
  isAuthenticated = false,
  companyInfo
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavItemComponent: React.FC<{ item: NavItem; isMobile?: boolean }> = ({ item, isMobile = false }) => {
    const isActive = item.isActive ? item.isActive(location.pathname) : false;
    
    return (
      <Link
        to={item.path}
        className={`
          group flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
          ${isMobile ? 'justify-start' : 'justify-center flex-col min-h-[60px]'}
          ${isActive 
            ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md ring-1 ring-indigo-200' 
            : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-sm'
          }
          ${isMobile ? 'mb-1' : ''}
        `}
        title={item.label}
      >
        <span className={`text-lg ${isMobile ? 'mr-3' : 'mb-1'} relative transition-transform duration-200 group-hover:scale-110`}>
          {item.icon}
          {item.badge && item.badge > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg animate-pulse">
              {item.badge}
            </span>
          )}
        </span>
        <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap`}>
          {item.label}
        </span>
        {isActive && !isMobile && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"></div>
        )}
      </Link>
    );
  };

  // Safety check - don't render if isAuthenticated is undefined or false
  if (isAuthenticated === undefined || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <MobilePDFStyles />
      {/* Desktop Sidebar - Enhanced with better design */}
      <div className="hidden lg:flex lg:flex-col lg:w-16 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-lg">
          {/* Logo/Company Info */}
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {companyInfo?.logo ? (
              <img 
                src={companyInfo.logo} 
                alt={companyInfo.name || 'Company Logo'} 
                className="w-8 h-8 object-contain mb-2"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-2">
                🚛
              </div>
            )}
            <span className="text-xs font-medium text-gray-600 text-center leading-tight">
              {companyInfo?.name || 'TranspoTruck'}
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => (
              <NavItemComponent key={item.id} item={item} />
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-2">
            <button
              onClick={onLogout}
              className="group flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 hover:shadow-sm transition-all duration-200"
              title="Logout"
            >
              <span className="text-lg mb-1 relative transition-transform duration-200 group-hover:scale-110">🚪</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {companyInfo?.logo ? (
              <img 
                src={companyInfo.logo} 
                alt={companyInfo.name || 'Company Logo'} 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                🚛
              </div>
            )}
            <span className="text-lg font-semibold text-gray-900">
              {companyInfo?.name || 'TranspoTruck'}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            title="Dashboard"
          >
            <span className="text-xl">🏠</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {navigationItems.slice(0, 4).map((item) => (
            <NavItemComponent key={item.id} item={item} isMobile={true} />
          ))}
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
            title="Logout"
          >
            <span className="text-lg mb-1">🚪</span>
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};