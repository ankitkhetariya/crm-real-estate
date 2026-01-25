import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/* Using LayoutGrid for a more professional 'CRM' feel */
import { LayoutDashboard, Users, PlusCircle, LogOut, Building, Calendar, Menu, X, LayoutGrid, Settings, LifeBuoy } from "lucide-react"; 
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

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className={styles.container}>
      
      {/* 📱 Mobile Header */}
      <div className={styles.mobileHeader}>
        {/* Simple and Clean Branding: CRM */}
        <h2><LayoutGrid size={24} fill="#D7CCC8" stroke="none" /> CRM</h2>
        <button onClick={toggleMenu} className={styles.menuBtn}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ⬅️ SIDEBAR */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.showSidebar : ""}`}>
        
        {/* 🏢 Logo Header: CRM */}
        <div className={styles.sidebarHeader}>
          <LayoutGrid size={32} fill="#D7CCC8" stroke="none" className={styles.logoIcon} />
          <h2>CRM</h2>
        </div>

        <nav className={styles.nav}>
          <Link to="/dashboard" onClick={closeMenu} className={`${styles.link} ${isActive("/dashboard") ? styles.active : ""}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>

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

          <Link to="/support" onClick={closeMenu} className={`${styles.link} ${isActive("/support") ? styles.active : ""}`}>
            <LifeBuoy size={20} /> Contact for Support
          </Link>

          <Link to="/settings" onClick={closeMenu} className={`${styles.link} ${isActive("/settings") ? styles.active : ""}`}>
             <Settings size={20} /> Settings
          </Link>

        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            {/* User Profile Avatar with Theme Border */}
            <div style={{width:"35px", height:"35px", background:"#4E3B34", borderRadius:"50%", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", border:"1px solid #D7CCC8"}}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <p className={styles.userName}>{user?.name || "User"}</p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {isMobileMenuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

    </div>
  );
};

export default Layout;