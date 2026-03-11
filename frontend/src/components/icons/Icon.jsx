import React from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'

// Mapeo de nombres de iconos a componentes de Lucide
const iconMap = {
  // Dashboard y navegación
  'layout-dashboard': Icons.LayoutDashboard,
  'dashboard': Icons.LayoutDashboard,
  'home': Icons.Home,
  
  // Servidores y sistema
  'server': Icons.Server,
  'servers': Icons.Server,
  'cpu': Icons.Cpu,
  'hard-drive': Icons.HardDrive,
  'database': Icons.Database,
  
  // Estado y alertas
  'alert-triangle': Icons.AlertTriangle,
  'alert-circle': Icons.AlertCircle,
  'bell': Icons.Bell,
  'bell-ring': Icons.BellRing,
  'activity': Icons.Activity,
  'pulse': Icons.Activity,
  
  // Métricas y gráficas
  'bar-chart': Icons.BarChart3,
  'line-chart': Icons.LineChart,
  'pie-chart': Icons.PieChart,
  'trending-up': Icons.TrendingUp,
  'trending-down': Icons.TrendingDown,
  
  // Auditoría y archivos
  'file-search': Icons.FileSearch,
  'file-text': Icons.FileText,
  'clipboard-list': Icons.ClipboardList,
  'search': Icons.Search,
  
  // Seguridad
  'shield': Icons.Shield,
  'shield-check': Icons.ShieldCheck,
  'shield-x': Icons.ShieldX,
  'lock': Icons.Lock,
  'key': Icons.Key,
  
  // Configuración
  'settings': Icons.Settings,
  'cog': Icons.Cog,
  'cog-6': Icons.Cog,
  'wrench': Icons.Wrench,
  'sliders': Icons.Sliders,
  
  // Tiempo y rendimiento
  'timer': Icons.Timer,
  'clock': Icons.Clock,
  'zap': Icons.Zap,
  'battery': Icons.Battery,
  'battery-charging': Icons.BatteryCharging,
  
  // Usuario y acceso
  'user': Icons.User,
  'users': Icons.Users,
  'user-check': Icons.UserCheck,
  'user-x': Icons.UserX,
  'log-out': Icons.LogOut,
  'log-in': Icons.LogIn,
  
  // Navegación
  'menu': Icons.Menu,
  'x': Icons.X,
  'chevron-left': Icons.ChevronLeft,
  'chevron-right': Icons.ChevronRight,
  'chevron-up': Icons.ChevronUp,
  'chevron-down': Icons.ChevronDown,
  
  // Utilidades
  'refresh-cw': Icons.RefreshCw,
  'download': Icons.Download,
  'upload': Icons.Upload,
  'filter': Icons.Filter,
  'calendar': Icons.Calendar,
  
  // Red
  'globe': Icons.Globe,
  'wifi': Icons.Wifi,
  'ethernet': Icons.Ethernet,
  'cloud': Icons.Cloud,
  
  // Herramientas
  'terminal': Icons.Terminal,
  'code': Icons.Code,
  'git-branch': Icons.GitBranch,
  'package': Icons.Package,
  
  // Estado
  'check-circle': Icons.CheckCircle,
  'x-circle': Icons.XCircle,
  'info': Icons.Info,
  'help-circle': Icons.HelpCircle,
}

const Icon = ({ 
  name, 
  size = 20, 
  className = '', 
  color = 'currentColor',
  animated = false,
  animationProps = {},
  ...props 
}) => {
  const IconComponent = iconMap[name] || Icons.HelpCircle // Icono por defecto
  
  const iconElement = (
    <IconComponent 
      size={size} 
      className={className}
      color={color}
      {...props}
    />
  )

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...animationProps}
      >
        {iconElement}
      </motion.div>
    )
  }

  return iconElement
}

export default Icon
