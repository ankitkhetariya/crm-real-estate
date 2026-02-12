import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Trophy,
  ArrowUpRight,
  Loader,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  // Eye, // Removed Eye Icon
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
      toast.error(`Agent is already under ${owner?.name || "another manager"}`);
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
        <button onClick={fetchMasterData} className={styles.refreshBtn}>
          <RefreshCw size={18} /> Refresh Console
        </button>
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
          <h3>Team Profitability (By Manager)</h3>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
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
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(val) => `₹${val.toLocaleString()}`}
                />
                <Bar
                  dataKey="teamProfit"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>
            <Trophy size={18} color="#f59e0b" /> Top Performers
          </h3>
          <div className={styles.leaderboard}>
            {data.topAgents.map((agent, index) => (
              <div key={agent._id} className={styles.leaderItem}>
                <span className={styles.rank}>#{index + 1}</span>
                <div className={styles.agentMeta}>
                  <p className={styles.name}>{agent.name}</p>
                  <p className={styles.rev}>
                    ₹{(agent.revenue || 0).toLocaleString()}
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
          <h3>
            <ShieldCheck size={20} color="#4f46e5" /> Team Assignment Matrix
          </h3>
          <div className={styles.infoBadge}>
            <AlertCircle size={14} /> One manager per agent policy active
          </div>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Manager Name</th>
                <th>Current Team</th>
                <th>Assign Agents</th> {/* Changed Header Title */}
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
                      {(selectedAgents[mgr._id] || []).length} Agents
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
                          // Wrapper div simplified as only one action now (toggle)
                          <div
                            key={agentId}
                            className={`${styles.tag} ${
                              isActive ? styles.activeTag : ""
                            } ${assignedElsewhere ? styles.disabledTag : ""}`}
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
                      <Save size={16} /> Update Team
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
