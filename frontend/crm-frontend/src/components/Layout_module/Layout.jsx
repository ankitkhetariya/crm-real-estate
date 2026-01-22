import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
// ✅ 'LifeBuoy' ko bhi import kiya hai ab
import { LayoutDashboard, Users, PlusCircle, LogOut, Building, Calendar, Menu, X, Hexagon, Settings, LifeBuoy } from "lucide-react"; 
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
        {/* Mobile Logo */}
        <h2><Hexagon size={24} fill="#3b82f6" stroke="none" /> CRM Pro</h2>
        <button onClick={toggleMenu} className={styles.menuBtn}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ⬅️ SIDEBAR */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.showSidebar : ""}`}>
        
        {/* 💎 LOGO HEADER */}
        <div className={styles.sidebarHeader}>
          <Hexagon size={32} fill="#3b82f6" stroke="none" className={styles.logoIcon} />
          <h2>CRM Pro</h2>
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

          {/* ✅ SUPPORT LINK (Sahi Position mein) */}
          <Link to="/support" onClick={closeMenu} className={`${styles.link} ${isActive("/support") ? styles.active : ""}`}>
            <LifeBuoy size={20} /> Contact for Support
          </Link>

          <Link to="/settings" onClick={closeMenu} className={`${styles.link} ${isActive("/settings") ? styles.active : ""}`}>
             <Settings size={20} /> Settings
          </Link>

        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            {/* User Icon */}
            <div style={{width:"35px", height:"35px", background:"#3b82f6", borderRadius:"50%", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold"}}>
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