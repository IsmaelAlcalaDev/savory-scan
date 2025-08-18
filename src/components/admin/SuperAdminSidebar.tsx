
import { 
  BarChart3,
  Users,
  Store,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Settings,
  Upload,
  Brain,
  Shield,
  Flag,
  FileText,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SuperAdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'users', label: 'Gestión Usuarios', icon: Users },
  { id: 'restaurants', label: 'Gestión Restaurantes', icon: Store },
  { id: 'verification', label: 'Panel Verificación', icon: CheckCircle },
  { id: 'analytics', label: 'Métricas & Analytics', icon: TrendingUp },
  { id: 'financial', label: 'Panel Financiero', icon: DollarSign },
  { id: 'config', label: 'Configuración Global', icon: Settings },
  { id: 'upload', label: 'Carga Masiva CSV', icon: Upload },
  { id: 'ai-extraction', label: 'IA Extracción Menús', icon: Brain },
  { id: 'security', label: 'Seguridad & Fraude', icon: Shield },
  { id: 'moderation', label: 'Sistema Moderación', icon: Flag },
  { id: 'audit', label: 'Logs & Auditoría', icon: FileText },
];

export function SuperAdminSidebar({ activeSection, setActiveSection, collapsed }: SuperAdminSidebarProps) {
  return (
    <aside className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-11 px-3",
                    collapsed ? "px-3" : "px-4",
                    isActive && "bg-primary text-primary-foreground shadow-sm"
                  )}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                  {!collapsed && (
                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </Button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className={cn(
            "flex items-center justify-center",
            collapsed ? "px-2" : "px-4"
          )}>
            {!collapsed && (
              <div className="flex-1">
                <p className="text-xs text-gray-500">Super Admin Panel</p>
                <p className="text-xs font-medium text-gray-900">v2.1.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
