import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/* Icons */
import { 
  LayoutDashboard, Users, PlusCircle, LogOut, Building, 
  Calendar, Menu, X, LayoutGrid, Settings, LifeBuoy 
} from "lucide-react"; 
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  // Helper to check if the current path matches the link
  const isActive = (path) => location.pathname.startsWith(path);

  // LOGIC FIX: Determine Dashboard Link based on Role
  // We use .toLowerCase() to ensure 'Admin' and 'admin' both work
  const getDashboardPath = () => {
    const role = user?.role?.toLowerCase();
    
    if (role === 'admin') return "/admin-dashboard";
    if (role === 'manager') return "/manager-dashboard";
    
    // Default fallback for agents
    return "/dashboard";
  };

  // Helper to get the display text for the dashboard link
  const getDashboardLabel = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') return 'Admin Dashboard';
    if (role === 'manager') return 'Manager Dashboard';
    return 'Dashboard';
  };

  return (
    <div className={styles.container}>
      
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <h2><LayoutGrid size={24} fill="#1e293b" stroke="none" /> CRM</h2>
        <button onClick={toggleMenu} className={styles.menuBtn}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.showSidebar : ""}`}>
        
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <LayoutGrid size={32} fill="#D7CCC8" stroke="none" className={styles.logoIcon} />
          <h2>CRM</h2>
        </div>

        <nav className={styles.nav}>
          
          {/* DYNAMIC DASHBOARD LINK */}
          {/* This prevents the Admin from being sent to the Agent dashboard */}
          <Link 
            to={getDashboardPath()} 
            onClick={closeMenu} 
            className={`${styles.link} ${isActive(getDashboardPath()) ? styles.active : ""}`}
          >
            <LayoutDashboard size={20} /> 
            {getDashboardLabel()}
          </Link>

          {/* Common Links */}
          <Link to="/tasks" onClick={closeMenu} className={`${styles.link} ${isActive("/tasks") ? styles.active : ""}`}>
            <Calendar size={20} /> Tasks
          </Link>
          
          <Link to="/properties" onClick={closeMenu} className={`${styles.link} ${isActive("/properties") ? styles.active : ""}`}>
            <Building size={20} /> Properties
          </Link>

          <Link to="/leads" onClick={closeMenu} className={`${styles.link} ${isActive("/leads") ? styles.active : ""}`}>
            <Users size={20} /> Leads
          </Link>

          <Link to="/add-lead" onClick={closeMenu} className={`${styles.link} ${isActive("/add-lead") ? styles.active : ""}`}>
             <PlusCircle size={20} /> Add Lead
          </Link>

          <div style={{borderTop: '1px solid #3E302B', margin: '10px 0'}}></div>

          <Link to="/settings" onClick={closeMenu} className={`${styles.link} ${isActive("/settings") ? styles.active : ""}`}>
             <Settings size={20} /> Settings
          </Link>

          <Link to="/support" onClick={closeMenu} className={`${styles.link} ${isActive("/support") ? styles.active : ""}`}>
            <LifeBuoy size={20} /> Support
          </Link>

        </nav>

        {/* User Info Section */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
                {/* Shows the first letter of the name, or U if missing */}
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
                {/* Shows the actual user name from Context */}
                <p className={styles.userName}>{user?.name || "User"}</p>
                {/* Shows the user role (e.g., Admin) */}
                <p className={styles.userRole}>{user?.role || "Agent"}</p> 
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

    </div>
  );
};

export default Layout;