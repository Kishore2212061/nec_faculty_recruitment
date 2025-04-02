import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  LogOut,
  X,
  Home,
  User,
  Menu
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const formSubmitted = localStorage.getItem('formsubmitted');
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('formsubmitted');
    localStorage.removeItem('userId');
    
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Instruction',
      icon: <Home size={20} />
    },
    {
      path: '/dashboard/application-form',
      name: 'Application Form',
      icon: <FileText size={20} />
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      <div 
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:sticky top-0 inset-y-0 left-0 z-50
          w-[280px] shrink-0 
          bg-gradient-to-b from-[#1a1c2e] via-[#1f2137] to-[#141627]
          text-gray-100 h-screen
          transform transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          shadow-[0_0_40px_rgba(0,0,0,0.3)] lg:shadow-2xl
          overflow-hidden
        `}
      >
        {/* Header */}
        <div className="relative p-4 border-b border-white/5">
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full transition-colors duration-200"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-[2px]">
                <div className="w-full h-full rounded-xl bg-[#1a1c2e] flex items-center justify-center transform group-hover:scale-105 transition-all duration-200">
                  <User size={24} className="text-white/90" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-[#1a1c2e]"></div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white/90">{userName}</h3>
              <p className="text-sm text-indigo-300/80">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group relative
                  ${isActivePath(item.path)
                    ? 'bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <span className={`
                  transform transition-transform duration-200
                  ${isActivePath(item.path)
                    ? 'text-indigo-400'
                    : 'group-hover:text-indigo-400'
                  }
                `}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
                {isActivePath(item.path) && (
                  <span className="absolute inset-y-[10%] left-0 w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-blue-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
              text-red-400 hover:bg-red-500/10 hover:text-red-300
              transition-all duration-200 group"
          >
            <LogOut 
              size={20} 
              className="transform transition-all duration-200 group-hover:translate-x-1" 
            />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}