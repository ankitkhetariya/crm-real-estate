import { useEffect, useState } from "react";
import API from "../api/axios";
import { Filter, X } from "lucide-react";

const AdminViewFilter = ({ currentViewId, onViewChange }) => {
  const [hierarchy, setHierarchy] = useState({ managers: [], agents: [] });
  const [loading, setLoading] = useState(true);

  // 1. Get Current User Info
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = (currentUser.role || "agent").toLowerCase();
  const currentUserId = currentUser._id || currentUser.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get("/admin/master-dashboard");

        // 2. Filter Data based on Role
        if (userRole === "manager") {
          // ✅ MANAGER VIEW: Filter agents to only show MY team
          const myTeam = (data.agentsList || []).filter((agent) => {
            const mgrId = agent.managedBy?._id || agent.managedBy;
            return String(mgrId) === String(currentUserId);
          });
          // Managers don't need to see other managers, just their agents
          setHierarchy({ managers: [], agents: myTeam });
        } else {
          // ✅ ADMIN VIEW: Show everything
          setHierarchy({
            managers: data.managersList || [],
            agents: data.agentsList || [],
          });
        }
      } catch (err) {
        console.error("Filter load error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userRole, currentUserId]);

  const styles = {
    container: {
      background: "linear-gradient(to right, #ffffff, #f8fafc)",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "24px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    },
    label: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      fontWeight: "700",
      color: "#64748b",
      textTransform: "uppercase",
    },
    select: {
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      minWidth: "240px",
      outline: "none",
      cursor: "pointer",
      backgroundColor: currentViewId ? "#eff6ff" : "white",
      borderColor: currentViewId ? "#3b82f6" : "#cbd5e1",
    },
    clearBtn: {
      marginLeft: "auto",
      background: "#fee2e2",
      color: "#ef4444",
      border: "none",
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
  };

  if (loading) return null;

  // If Manager has no team members, hiding the filter might be cleaner,
  // but showing it with 0 options is also fine for clarity.

  return (
    <div style={styles.container}>
      <div style={styles.label}>
        <Filter size={16} />{" "}
        {userRole === "manager" ? "My Team View:" : "Admin Context:"}
      </div>

      <select
        value={currentViewId}
        onChange={(e) => onViewChange(e.target.value)}
        style={styles.select}
      >
        {/* Dynamic Default Option */}
        <option value="">
          {userRole === "manager"
            ? "👁️ Show My Work & Team"
            : "👁️ Global View (Show All)"}
        </option>

        {/* Only Admins see the list of Managers */}
        {userRole === "admin" && hierarchy.managers.length > 0 && (
          <optgroup label="Managers">
            {hierarchy.managers.map((m) => (
              <option key={m._id} value={m._id}>
                Manager: {m.name}
              </option>
            ))}
          </optgroup>
        )}

        {/* Both see Agents (But Managers only see their own team) */}
        {hierarchy.agents.length > 0 && (
          <optgroup label="Agents">
            {hierarchy.agents.map((a) => (
              <option key={a._id} value={a._id}>
                Agent: {a.name}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {currentViewId && (
        <button onClick={() => onViewChange("")} style={styles.clearBtn}>
          <X size={14} /> Clear Filter
        </button>
      )}
    </div>
  );
};

export default AdminViewFilter;
