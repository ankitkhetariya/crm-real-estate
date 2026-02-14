import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

/* Icons */
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  LogOut,
  Building,
  Calendar,
  Menu,
  X,
  LayoutGrid,
  Settings,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const isActive = (path) => location.pathname === path;

  // =========================================================
  // 🚀 SUPER LOGIC: Asli Naam aur Role nikalne ka tareeka
  // =========================================================

  // 1. Pehle naam nikalte hain (Context se ya LocalStorage se)
  let displayName = "User"; // Default
  const storedName = localStorage.getItem("userName");

  if (user && user.name) {
    displayName = user.name; // Agar AuthContext mein data hai toh wahan se lo
  } else if (
    storedName &&
    storedName !== "undefined" &&
    storedName !== "null"
  ) {
    displayName = storedName; // Agar LocalStorage mein valid naam hai toh wahan se lo
  }

  // 2. Ab Role nikalte hain
  let displayRole = "Agent"; // Default
  const storedRole = localStorage.getItem("role");

  if (user && user.role) {
    displayRole = user.role;
  } else if (
    storedRole &&
    storedRole !== "undefined" &&
    storedRole !== "null"
  ) {
    displayRole = storedRole;
  }

  // 3. Avatar ke liye pehla letter nikal lo (e.g., "Ankit" ka "A")
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // =========================================================

  const getDashboardPath = () => {
    const role = displayRole.toLowerCase();
    if (role === "admin") return "/admin-dashboard";
    if (role === "manager") return "/manager-dashboard";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    const role = displayRole.toLowerCase();
    if (role === "admin") return "Admin Dashboard";
    if (role === "manager") return "Manager Dashboard";
    return "Dashboard";
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={closeMobileMenu}
      className={`
        ${styles.link}
        ${isActive(to) ? styles.active : ""}
        ${isCollapsed ? styles.collapsedLink : ""}
      `}
    >
      <div className={styles.iconWrapper}>
        <Icon size={20} />
      </div>
      <span
        className={`${styles.linkLabel} ${isCollapsed ? styles.hideLabel : ""}`}
      >
        {label}
      </span>
      {isCollapsed && <span className={styles.tooltip}>{label}</span>}
    </Link>
  );

  return (
    <div className={styles.container}>
      {/* --- Mobile Header --- */}
      <div className={styles.mobileHeader}>
        <Link to={getDashboardPath()} className={styles.mobileLogoLink}>
          <h2>
            <LayoutGrid size={24} fill="#1e293b" stroke="none" /> CRM
          </h2>
        </Link>
        <button onClick={toggleMobileMenu} className={styles.menuBtn}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside
        className={`
        ${styles.sidebar}
        ${isMobileMenuOpen ? styles.showMobileSidebar : ""}
        ${isCollapsed ? styles.sidebarCollapsed : ""}
      `}
      >
        <div className={styles.sidebarHeader}>
          <Link
            to={getDashboardPath()}
            className={styles.logoLink}
            onClick={closeMobileMenu}
          >
            <div className={styles.logoContent}>
              <LayoutGrid
                size={28}
                fill="#D7CCC8"
                stroke="none"
                className={styles.logoIcon}
              />
              <h2 className={isCollapsed ? styles.hideLabel : ""}>CRM</h2>
            </div>
          </Link>

          <button className={styles.collapseBtn} onClick={toggleCollapse}>
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        <nav className={styles.nav}>
          <NavItem
            to={getDashboardPath()}
            icon={LayoutDashboard}
            label={getDashboardLabel()}
          />
          <NavItem to="/tasks" icon={Calendar} label="Tasks" />
          <NavItem to="/properties" icon={Building} label="Properties" />
          <NavItem to="/leads" icon={Users} label="Leads" />
          <NavItem to="/add-lead" icon={PlusCircle} label="Add Lead" />

          <div className={styles.divider}></div>

          <NavItem to="/settings" icon={Settings} label="Settings" />
          <NavItem to="/support" icon={LifeBuoy} label="Support" />
        </nav>

        {/* --- USER INFO SECTION --- */}
        <div className={styles.userSection}>
          <div
            className={`${styles.userInfo} ${isCollapsed ? styles.justifyCenter : ""}`}
          >
            <div className={styles.userAvatar}>{avatarLetter}</div>

            <div
              className={`${styles.userDetails} ${isCollapsed ? styles.hideLabel : ""}`}
            >
              <p className={styles.userName}>{displayName}</p>
              <p className={styles.userRole}>{displayRole}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`${styles.logoutBtn} ${isCollapsed ? styles.logoutCollapsed : ""}`}
            title="Logout"
          >
            <LogOut size={18} />
            <span className={isCollapsed ? styles.hideLabel : ""}>Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className={styles.mainContent}>{children}</main>

      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu}></div>
      )}
    </div>
  );
};

export default Layout;
