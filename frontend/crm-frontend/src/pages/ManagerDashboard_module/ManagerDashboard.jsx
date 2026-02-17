import { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  Users,
  TrendingUp,
  ClipboardList,
  Loader,
  ArrowRight,
  IndianRupee,
  BarChart3, // ✅ Replaced 📊 emoji
  Award, // ✅ Replaced 🏆 emoji
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";
import styles from "./ManagerDashboard.module.css";

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myAgents: 0,
    teamSales: 0,
    pendingTasks: 0,
    growth: "0%",
    totalPipeline: 0,
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [agentList, setAgentList] = useState([]);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const [statsRes, agentsRes] = await Promise.all([
        API.get("/leads/stats"),
        API.get("/manager/my-agents"),
      ]);

      setStats({
        myAgents: agentsRes.data.length,
        teamSales: statsRes.data.totalRevenue || 0,
        pendingTasks: statsRes.data.activeTasksCount || 0,
        growth: (statsRes.data.conversionRate || 0) + "%",
        totalPipeline: statsRes.data.totalPipeline || 0,
      });

      const sortedAgents = [...agentsRes.data].sort(
        (a, b) => (b.revenue || 0) - (a.revenue || 0),
      );
      setAgentList(sortedAgents);

      const chartData = sortedAgents.map((agent) => ({
        name: agent.name.split(" ")[0],
        revenue: agent.revenue || 0,
        leads: agent.totalLeads || 0,
      }));
      setPerformanceData(chartData);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Failed to load team analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  // ✅ Smart Y-Axis formatting (1L, 1Cr, 10k)
  const formatYAxis = (tickItem) => {
    if (tickItem >= 10000000) return `₹${(tickItem / 10000000).toFixed(2)}Cr`;
    if (tickItem >= 100000) return `₹${(tickItem / 100000).toFixed(1)}L`;
    if (tickItem >= 1000) return `₹${(tickItem / 1000).toFixed(1)}k`;
    return `₹${tickItem}`;
  };

  const statCards = [
    {
      title: "Assigned Team",
      value: stats.myAgents,
      icon: <Users size={22} />,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      title: "Team Revenue",
      value: `₹${stats.teamSales.toLocaleString("en-IN")}`,
      icon: <IndianRupee size={22} />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      title: "Pipeline Value",
      value: `₹${stats.totalPipeline.toLocaleString("en-IN")}`,
      icon: <ClipboardList size={22} />,
      color: "#ea580c",
      bg: "#fff7ed",
    },
    {
      title: "Team Conv. Rate",
      value: stats.growth,
      icon: <TrendingUp size={22} />,
      color: "#9333ea",
      bg: "#f3e8ff",
    },
  ];

  if (loading)
    return (
      <div
        className={styles.loaderContainer}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          color: "#64748b",
          gap: "10px",
        }}
      >
        <Loader className="animate-spin" size={40} />
        <span style={{ fontWeight: 500 }}>Analyzing Team Data...</span>
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.welcomeText}>Team Overview</h2>
        <p className={styles.subtitle}>
          Real-time performance of your assigned agents
        </p>
      </div>

      <div className={styles.grid}>
        {statCards.map((card, index) => (
          <div key={index} className={styles.card}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
            <div className={styles.cardInfo}>
              <p className={styles.cardTitle}>{card.title}</p>
              <h3 className={styles.cardValue}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <div
            className={styles.chartHeader}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            {/* ✅ Replaced Emoji with BarChart3 Icon */}
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
                color: "#1e293b",
              }}
            >
              <BarChart3 size={18} color="#4f46e5" /> Revenue by Agent
            </h3>
            <span
              className={styles.badge}
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Live Sync
            </span>
          </div>

          <div style={{ width: "100%", height: 350 }}>
            {/* ✅ Added width="100%" height="100%" to fix console error */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxis} // ✅ Fixed Indian Y-Axis Format
                  tick={{ fill: "#64748b", fontSize: 13 }}
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }} // ✅ Professional tooltip UI
                />
                {/* ✅ Added minPointSize={5} to prevent invisible bars */}
                <Bar
                  dataKey="revenue"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  minPointSize={5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.sideList}>
          <div className={styles.listHeader} style={{ marginBottom: "16px" }}>
            {/* ✅ Replaced Emoji with Award Icon */}
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
                color: "#1e293b",
              }}
            >
              <Award size={18} color="#3b82f6" /> Top Performers
            </h3>
          </div>
          <div className={styles.agentList}>
            {agentList.slice(0, 5).map((agent, i) => (
              <div
                key={agent._id}
                className={styles.agentItem}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div
                  className={styles.agentRank}
                  style={{
                    fontWeight: 700,
                    color: "#94a3b8",
                    width: "30px",
                    fontSize: "14px",
                  }}
                >
                  #{i + 1}
                </div>
                <div className={styles.agentDetails} style={{ flex: 1 }}>
                  <p
                    className={styles.agentName}
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#334155",
                    }}
                  >
                    {agent.name}
                  </p>
                  <p
                    className={styles.agentRev}
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    ₹{(agent.revenue || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <ArrowRight size={14} color="#cbd5e1" />
              </div>
            ))}
            {agentList.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                No agents assigned yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
