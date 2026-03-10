import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
// Ensure this path is correct. It goes up one folder (..) then into context.
import { AuthContext } from "../context/AuthContext";
import { Loader } from "lucide-react"; 

const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 1. Loading State: Wait until user data is fully loaded
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader className="animate-spin" size={40} color="#4f46e5" />
      </div>
    );
  }

  // 2. Not Logged In: Redirect to Login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Logic to detect the role
  // We check if the role exists directly on 'user' or nested inside 'user.user'
  const actualRole = user.role || (user.user && user.user.role);

  // 4. Permission Check
  if (allowedRoles) {
    // Convert everything to lowercase to prevent capitalization errors
    const roleMatches = allowedRoles
      .map(r => r.toLowerCase())
      .includes(actualRole?.toLowerCase());

    // 5. DEBUG MODE: If role does not match, DO NOT REDIRECT.
    // Instead, show the error details on the screen.
    if (!roleMatches) {
      return (
        <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", backgroundColor: "#fff0f0", height: "100vh" }}>
          <h1 style={{ color: "#d32f2f" }}>Access Denied (Debug Mode)</h1>
          <p style={{ fontSize: "18px" }}>The application has blocked your access to this page because the roles do not match.</p>
          
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "20px" }}>
            <p><strong>Page Requires these Roles:</strong> {JSON.stringify(allowedRoles)}</p>
            <p><strong>Your Detected Role:</strong> <span style={{ color: "blue", fontWeight: "bold" }}>{actualRole || "UNDEFINED (This is the issue)"}</span></p>
            
            <hr style={{ margin: "20px 0" }} />
            
            <p><strong>Full User Data from LocalStorage:</strong></p>
            <pre style={{ background: "#eee", padding: "10px", borderRadius: "5px" }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div style={{ marginTop: "30px" }}>
            <p>If the role is correct but nested (e.g., inside another "user" object), we need to fix the login logic.</p>
            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              style={{ padding: "12px 24px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" }}
            >
              Clear Data & Logout
            </button>
          </div>
        </div>
      );
    }
  }

  // 6. Access Granted: Render the page
  return <Outlet />;
};

export default RoleRoute;