import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Award, // Professional alternative to Trophy
  ArrowUpRight,
  Loader,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  User,
  ChevronDown,
  X,
  Trash2,
  UserPlus,
  Briefcase, // Added for corporate role representations
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    stats: {
      totalRevenue: 0,
      totalProfit: 0,
      totalPipeline: 0,
      totalAgents: 0,
      totalManagers: 0,
    },
    managerPerformance: [],
    topAgents: [],
    managersList: [],
    agentsList: [],
  });

  const [selectedAgents, setSelectedAgents] = useState({});
  const [loading, setLoading] = useState(true);

  // States for Dropdown & Modal
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/master-dashboard");
      setData(res.data);

      const initialMapping = {};
      res.data.managersList.forEach((mgr) => {
        initialMapping[mgr._id] = res.data.agentsList
          .filter((agent) => {
            const agentMgrId = agent.managedBy?._id || agent.managedBy;
            return String(agentMgrId) === String(mgr._id);
          })
          .map((agent) => String(agent._id));
      });
      setSelectedAgents(initialMapping);
    } catch (err) {
      toast.error("Failed to sync Admin Console");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const agentOwnershipMap = useMemo(() => {
    const map = {};
    Object.entries(selectedAgents).forEach(([mgrId, agents]) => {
      agents.forEach((agentId) => {
        map[agentId] = mgrId;
      });
    });
    return map;
  }, [selectedAgents]);

  const toggleSelection = (mgrId, agentId) => {
    const safeAgentId = String(agentId);
    const currentOwnerId = agentOwnershipMap[safeAgentId];

    if (currentOwnerId && currentOwnerId !== mgrId) {
      const owner = data.managersList.find((m) => m._id === currentOwnerId);
      toast.error(
        `Agent is already assigned to ${owner?.name || "another manager"}`,
      );
      return;
    }

    setSelectedAgents((prev) => {
      const currentList = prev[mgrId] || [];
      const isRemoving = currentList.includes(safeAgentId);
      return {
        ...prev,
        [mgrId]: isRemoving
          ? currentList.filter((id) => id !== safeAgentId)
          : [...currentList, safeAgentId],
      };
    });
  };

  const handleSaveTeam = async (managerId) => {
    try {
      await API.put("/admin/assign-team", {
        managerId,
        agentIds: selectedAgents[managerId],
      });
      toast.success("Hierarchy updated successfully");
      fetchMasterData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // EMPLOYEE MANAGEMENT LOGIC
  const allEmployees = [...data.managersList, ...data.agentsList];

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchMasterData();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  // Enterprise Custom Toast for Employee Removal
  const handleFireEmployee = (userId, userName) => {
    toast(
      (t) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: "600",
              color: "#1e293b",
              fontSize: "15px",
            }}
          >
            Revoke Access for {userName}?
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#64748b",
              lineHeight: "1.4",
            }}
          >
            This will permanently remove the employee from the corporate system.
            This action cannot be undone.
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginTop: "12px",
            }}
          >
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await API.delete(`/admin/users/${userId}`);
                  toast.success(`${userName}'s access has been revoked.`);
                  fetchMasterData();
                } catch (err) {
                  toast.error("Failed to remove employee");
                }
              }}
              style={{
                background: "#ef4444",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Confirm Removal
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: "#f8fafc",
                color: "#475569",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  };

  if (loading)
    return (
      <div className={styles.loaderBox}>
        <Loader className="animate-spin" size={40} />
        <p>Syncing Enterprise Data...</p>
      </div>
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>Admin Master Control</h2>
          <p className={styles.pageSubtitle}>
            Company-wide hierarchy and performance oversight
          </p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={fetchMasterData} className={styles.refreshBtn}>
            <RefreshCw size={18} /> Refresh Console
          </button>

          {/* DROPDOWN MENU FOR ADMIN ACTIONS */}
          <div className={styles.dropdownContainer}>
            <button
              className={styles.manageProfileBtn}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className={styles.profileIconWrapper}>
                <User size={18} color="white" strokeWidth={2.5} />
              </div>
              <span className={styles.profileText}>Team Actions</span>
              <div className={styles.separator}></div>
              <ChevronDown
                size={18}
                className={styles.chevronIcon}
                strokeWidth={2.5}
              />
            </button>

            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <button
                  onClick={() => {
                    setShowManageModal(true);
                    setShowDropdown(false);
                  }}
                >
                  <ShieldCheck size={16} color="#475569" /> Manage Roles &
                  Access
                </button>
                <button
                  onClick={() => {
                    navigate("/register");
                    setShowDropdown(false);
                  }}
                >
                  <UserPlus size={16} color="#475569" /> Register New Employee
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- FINANCIAL OVERVIEW --- */}
      <section className={styles.grid}>
        <div className={`${styles.card} ${styles.premiumCard}`}>
          <div className={styles.cardContent}>
            <div>
              <p className={styles.cardTitle}>Gross Revenue</p>
              <h3 className={styles.cardValue}>
                ₹{(data.stats.totalRevenue / 100000).toFixed(2)}L
              </h3>
            </div>
            <div
              className={styles.iconBox}
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>Total Pipeline</p>
          <h3 className={styles.cardValue} style={{ color: "#ea580c" }}>
            ₹{(data.stats.totalPipeline / 100000).toFixed(2)}L
          </h3>
          <span className={styles.cardNote}>In-progress Deals</span>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>Total Profit</p>
          <h3 className={styles.cardValue} style={{ color: "#16a34a" }}>
            ₹{(data.stats.totalProfit / 100000).toFixed(2)}L
          </h3>
          <span className={styles.cardNote}>20% Est. Margin</span>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>Operations</p>
          <h3 className={styles.cardValue}>
            {data.stats.totalManagers}M / {data.stats.totalAgents}A
          </h3>
          <span className={styles.cardNote}>Active Workforce</span>
        </div>
      </section>

      {/* --- ANALYTICS --- */}
      <section className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1e293b",
            }}
          >
            <BarChart size={18} color="#475569" /> Team Profitability (By
            Manager)
          </h3>
          <div style={{ width: "100%", height: 320, marginTop: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.managerPerformance}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="managerName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(val) => [
                    `₹${val.toLocaleString("en-IN")}`,
                    "Profit",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Bar
                  dataKey="teamProfit"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  minPointSize={5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1e293b",
              marginBottom: "16px",
            }}
          >
            <Award size={18} color="#3b82f6" /> Top Performers
          </h3>
          <div className={styles.leaderboard}>
            {data.topAgents.map((agent, index) => (
              <div key={agent._id} className={styles.leaderItem}>
                <span className={styles.rank}>#{index + 1}</span>
                <div className={styles.agentMeta}>
                  <p className={styles.name}>{agent.name}</p>
                  <p className={styles.rev}>
                    ₹{(agent.revenue || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <ArrowUpRight size={16} color="#10b981" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HIERARCHY TABLE --- */}
      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} color="#4f46e5" /> Team Assignment Matrix
          </h3>
          <div className={styles.infoBadge}>
            <AlertCircle size={14} /> Single manager policy enforced
          </div>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Manager Name</th>
                <th>Current Team</th>
                <th>Assign Agents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.managersList.map((mgr) => (
                <tr key={mgr._id}>
                  <td className={styles.mgrNameCell}>
                    <strong>{mgr.name}</strong>
                    <span className={styles.emailSub}>{mgr.email}</span>
                  </td>
                  <td>
                    <span className={styles.badge}>
                      {(selectedAgents[mgr._id] || []).length} Assigned
                    </span>
                  </td>
                  <td>
                    <div className={styles.agentSelector}>
                      {data.agentsList.map((agent) => {
                        const agentId = String(agent._id);
                        const isActive = (
                          selectedAgents[mgr._id] || []
                        ).includes(agentId);
                        const assignedElsewhere =
                          agentOwnershipMap[agentId] &&
                          agentOwnershipMap[agentId] !== mgr._id;

                        return (
                          <div
                            key={agentId}
                            className={`${styles.tag} ${isActive ? styles.activeTag : ""} ${assignedElsewhere ? styles.disabledTag : ""}`}
                            onClick={() =>
                              !assignedElsewhere &&
                              toggleSelection(mgr._id, agentId)
                            }
                          >
                            <span className={styles.tagName}>
                              {agent.name}
                              {isActive && !assignedElsewhere && (
                                <CheckCircle2
                                  size={12}
                                  className={styles.checkIcon}
                                />
                              )}
                              {assignedElsewhere && (
                                <span className={styles.busyLabel}>Busy</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleSaveTeam(mgr._id)}
                      className={styles.saveBtn}
                    >
                      <Save size={16} /> Save Setup
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL FOR MANAGING ROLES & ACCESS */}
      {showManageModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowManageModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Briefcase size={18} color="#475569" /> Identity & Access
                Management
              </h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowManageModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <table className={styles.modalTable}>
                <thead>
                  <tr>
                    <th>Employee Details</th>
                    <th>System Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div className={styles.empInfo}>
                          <strong>{emp.name}</strong>
                          <span>{emp.email}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={styles.roleSelect}
                          value={emp.role}
                          onChange={(e) =>
                            handleRoleChange(emp._id, e.target.value)
                          }
                        >
                          <option value="agent">Agent</option>
                          <option value="manager">Manager</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className={styles.fireBtn}
                          onClick={() => handleFireEmployee(emp._id, emp.name)}
                          title="Revoke Access"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allEmployees.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#64748b",
                        }}
                      >
                        No directory records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
