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
  ChevronRight, // ✅ Added Toggle Icons
} from "lucide-react";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // State for Mobile Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ State for Desktop Collapse (Minibar)
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // ✅ Toggle Desktop Sidebar
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    const role = user?.role?.toLowerCase();
    if (role === "admin") return "/admin-dashboard";
    if (role === "manager") return "/manager-dashboard";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    const role = user?.role?.toLowerCase();
    if (role === "admin") return "Admin Dashboard";
    if (role === "manager") return "Manager Dashboard";
    return "Dashboard";
  };

  // Helper for Nav Items
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

      {/* Hide Label on Collapse */}
      <span
        className={`${styles.linkLabel} ${isCollapsed ? styles.hideLabel : ""}`}
      >
        {label}
      </span>

      {/* Hover Tooltip (Only visible when collapsed) */}
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
        {/* Header & Toggle */}
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

          {/* ✅ Collapse Button (Desktop Only) */}
          <button className={styles.collapseBtn} onClick={toggleCollapse}>
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Navigation */}
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

        {/* User Info */}
        <div className={styles.userSection}>
          <div
            className={`${styles.userInfo} ${isCollapsed ? styles.justifyCenter : ""}`}
          >
            <div className={styles.userAvatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div
              className={`${styles.userDetails} ${isCollapsed ? styles.hideLabel : ""}`}
            >
              <p className={styles.userName}>{user?.name || "User"}</p>
              <p className={styles.userRole}>{user?.role || "Agent"}</p>
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

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu}></div>
      )}
    </div>
  );
};

export default Layout;
