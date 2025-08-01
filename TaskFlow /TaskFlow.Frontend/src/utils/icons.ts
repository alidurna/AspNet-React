/**
 * Optimized Icons - Tree Shaking
 * 
 * React Icons'ı tree shaking için optimize eder.
 * Sadece kullanılan iconları import eder, bundle size'ı küçültür.
 */

// ===== FA ICONS (SOLID) =====
export {
  FaPlus,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaFlag,
  FaUser,
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaColumns,
  FaList,
  FaTh,
  FaPlay,
  FaPause,
  FaRedo,
  FaForward,
  FaAlignLeft,
  FaSave,
  FaHome,
  FaTasks,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaMoon,
  FaSun,
  FaBars,
  FaChevronDown,
  FaChevronRight,
  FaChevronLeft,
  FaChevronUp,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaSpinner,
  FaExclamation,
  FaInfo,

  FaEye,
  FaEyeSlash,
  FaLock,
  FaUnlock,
  FaKey,
  FaGlobe,
  FaLink,
  FaCopy,
  FaDownload,
  FaUpload,
  FaFile,
  FaFolder,
  FaImage
} from 'react-icons/fa';

// ===== MD ICONS =====
export {
  MdDashboard,
  MdNotifications,
  MdSettings,
  MdAccountCircle,
  MdHelp,
  MdMenu,
  MdClose,
  MdAdd,
  MdRemove,
  MdEdit,
  MdDelete,
  MdSave,
  MdCancel,
  MdRefresh,
  MdSearch,
  MdFilterList,
  MdSort,
  MdViewList,
  MdViewModule,
  MdViewColumn
} from 'react-icons/md';

// ===== HI ICONS =====
export {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFilter
} from 'react-icons/hi';

// ===== ICON GROUPS =====
export const AuthIcons = {
  Login: FaUser,
  Logout: FaSignOutAlt,
  Register: FaUser,
  Password: FaLock,
  Email: FaUser,
  Phone: FaUser,
  Shield: FaUser,
  Key: FaKey
};

export const TaskIcons = {
  Add: FaPlus,
  Edit: FaEdit,
  Delete: FaTrash,
  Complete: FaCheck,
  Cancel: FaTimes,
  Flag: FaFlag,
  Clock: FaClock,
  Calendar: FaCalendarAlt,
  User: FaUser,
  Star: FaStar
};

export const NavigationIcons = {
  Home: FaHome,
  Tasks: FaTasks,
  Dashboard: FaChartBar,
  Settings: FaCog,
  Profile: FaUser,
  Categories: FaList,
  Statistics: FaChartBar
};

export const UIIcons = {
  Search: FaSearch,
  Filter: FaFilter,
  Menu: FaBars,
  Close: FaTimes,
  ChevronDown: FaChevronDown,
  ChevronUp: FaChevronUp,
  ChevronLeft: FaChevronLeft,
  ChevronRight: FaChevronRight,
  Spinner: FaSpinner,
  Moon: FaMoon,
  Sun: FaSun,
  Bell: FaBell
};

export const StatusIcons = {
  Success: FaCheckCircle,
  Error: FaExclamationTriangle,
  Warning: FaExclamation,
  Info: FaInfo
};

// ===== ICON UTILITIES =====
export const getIconByName = (name: string) => {
  const iconMap: Record<string, any> = {
    // Auth
    'login': AuthIcons.Login,
    'logout': AuthIcons.Logout,
    'register': AuthIcons.Register,
    'password': AuthIcons.Password,
    'email': AuthIcons.Email,
    
    // Tasks
    'add': TaskIcons.Add,
    'edit': TaskIcons.Edit,
    'delete': TaskIcons.Delete,
    'complete': TaskIcons.Complete,
    'cancel': TaskIcons.Cancel,
    
    // Navigation
    'home': NavigationIcons.Home,
    'tasks': NavigationIcons.Tasks,
    'dashboard': NavigationIcons.Dashboard,
    'settings': NavigationIcons.Settings,
    'profile': NavigationIcons.Profile,
    
    // UI
    'search': UIIcons.Search,
    'filter': UIIcons.Filter,
    'menu': UIIcons.Menu,
    'close': UIIcons.Close,
    
    // Status
    'success': StatusIcons.Success,
    'error': StatusIcons.Error,
    'warning': StatusIcons.Warning,
    'info': StatusIcons.Info
  };
  
  return iconMap[name.toLowerCase()] || FaQuestion;
};

// Default fallback icon
export { FaQuestion } from 'react-icons/fa'; 