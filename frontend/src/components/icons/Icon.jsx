import { memo } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'

const iconMap = {
  'layout-dashboard': Icons.LayoutDashboard,
  'dashboard': Icons.LayoutDashboard,
  'home': Icons.Home,
  'server': Icons.Server,
  'servers': Icons.Server,
  'cpu': Icons.Cpu,
  'hard-drive': Icons.HardDrive,
  'database': Icons.Database,
  'alert-triangle': Icons.AlertTriangle,
  'alert-circle': Icons.AlertCircle,
  'bell': Icons.Bell,
  'bell-ring': Icons.BellRing,
  'activity': Icons.Activity,
  'pulse': Icons.Activity,
  'bar-chart': Icons.BarChart3,
  'line-chart': Icons.LineChart,
  'pie-chart': Icons.PieChart,
  'trending-up': Icons.TrendingUp,
  'trending-down': Icons.TrendingDown,
  'file-search': Icons.FileSearch,
  'file-text': Icons.FileText,
  'clipboard-list': Icons.ClipboardList,
  'search': Icons.Search,
  'shield': Icons.Shield,
  'shield-check': Icons.ShieldCheck,
  'shield-x': Icons.ShieldX,
  'shield-alert': Icons.ShieldAlert,
  'lock': Icons.Lock,
  'unlock': Icons.Unlock,
  'key': Icons.Key,
  'fingerprint': Icons.Fingerprint,
  'scan': Icons.ScanLine,
  'settings': Icons.Settings,
  'cog': Icons.Cog,
  'wrench': Icons.Wrench,
  'sliders': Icons.SlidersHorizontal,
  'timer': Icons.Timer,
  'clock': Icons.Clock,
  'zap': Icons.Zap,
  'battery': Icons.Battery,
  'battery-charging': Icons.BatteryCharging,
  'user': Icons.User,
  'users': Icons.Users,
  'user-check': Icons.UserCheck,
  'user-x': Icons.UserX,
  'log-out': Icons.LogOut,
  'log-in': Icons.LogIn,
  'menu': Icons.Menu,
  'x': Icons.X,
  'chevron-left': Icons.ChevronLeft,
  'chevron-right': Icons.ChevronRight,
  'chevron-up': Icons.ChevronUp,
  'chevron-down': Icons.ChevronDown,
  'refresh-cw': Icons.RefreshCw,
  'download': Icons.Download,
  'upload': Icons.Upload,
  'filter': Icons.Filter,
  'calendar': Icons.Calendar,
  'globe': Icons.Globe,
  'wifi': Icons.Wifi,
  'ethernet': Icons.Network,
  'cloud': Icons.Cloud,
  'terminal': Icons.Terminal,
  'code': Icons.Code,
  'git-branch': Icons.GitBranch,
  'package': Icons.Package,
  'check-circle': Icons.CheckCircle,
  'x-circle': Icons.XCircle,
  'info': Icons.Info,
  'help-circle': Icons.HelpCircle,
  'minus': Icons.Minus,
  'plus': Icons.Plus,
  'eye': Icons.Eye,
  'eye-off': Icons.EyeOff,
  'copy': Icons.Copy,
  'external-link': Icons.ExternalLink,
  'arrow-right': Icons.ArrowRight,
  'arrow-left': Icons.ArrowLeft,
  'arrow-up-right': Icons.ArrowUpRight,
  'hash': Icons.Hash,
  'at-sign': Icons.AtSign,
  'network': Icons.Network,
  'bug': Icons.Bug,
  'skull': Icons.Skull,
  'radiation': Icons.Radiation,
  'siren': Icons.Siren,
  'monitor': Icons.Monitor,
  'toggle-left': Icons.ToggleLeft,
  'toggle-right': Icons.ToggleRight,
  'palette': Icons.Palette,
  'bell-off': Icons.BellOff,
  'mail': Icons.Mail,
  'save': Icons.Save,
  'check': Icons.Check,
  'circle-dot': Icons.CircleDot,
  'layers': Icons.Layers,
  'box': Icons.Box,
  'signal': Icons.Signal,
  'map-pin': Icons.MapPin,
  'crosshair': Icons.Crosshair,
  'building': Icons.Building2,
  'rocket': Icons.Rocket,
  'play': Icons.Play,
  'link': Icons.Link,
  'trash-2': Icons.Trash2,
  'edit': Icons.Pencil,
  'maximize-2': Icons.Maximize2,
}

const Icon = memo(({
  name,
  size = 20,
  className = '',
  color = 'currentColor',
  animated = false,
  animationProps = {},
  ...props
}) => {
  const IconComponent = iconMap[name] || Icons.HelpCircle

  const iconElement = (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={1.8}
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
})

Icon.displayName = 'Icon'

export default Icon
