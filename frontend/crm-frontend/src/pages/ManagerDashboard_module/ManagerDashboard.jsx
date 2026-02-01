import { useEffect, useState } from "react";
import API from "../../api/axios"; 
import { Users, TrendingUp, CheckCircle, ClipboardList, Loader, Trophy, ArrowRight, IndianRupee } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Legend, CartesianGrid 
} from 'recharts';
import toast from "react-hot-toast";
import styles from "./ManagerDashboard.module.css"; 

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myAgents: 0,
    teamSales: 0, // This will now represent Total Revenue
    pendingTasks: 0,
    growth: "0%",
    totalPipeline: 0
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [agentList, setAgentList] = useState([]);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const [statsRes, agentsRes] = await Promise.all([
        API.get('/leads/stats'), 
        API.get('/manager/my-agents') 
      ]);

      // ✅ Map stats using the new backend keys: totalRevenue, totalPipeline, conversionRate
      setStats({
        myAgents: agentsRes.data.length,
        teamSales: statsRes.data.totalRevenue || 0, // Showing Money now
        pendingTasks: statsRes.data.activeTasksCount || 0,
        growth: (statsRes.data.conversionRate || 0) + "%",
        totalPipeline: statsRes.data.totalPipeline || 0
      });

      // ✅ Sort agents by their live revenue for the Top Performers list
      const sortedAgents = [...agentsRes.data].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
      setAgentList(sortedAgents);

      // ✅ Map sorted agent data for the chart
      const chartData = sortedAgents.map(agent => ({
        name: agent.name.split(" ")[0],
        revenue: agent.revenue || 0,
        leads: agent.totalLeads || 0
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

  const statCards = [
    { 
      title: "Assigned Team", 
      value: stats.myAgents, 
      icon: <Users size={22} />, 
      color: "#2563eb", 
      bg: "#eff6ff" 
    },
    { 
      title: "Team Revenue", 
      value: `₹${stats.teamSales.toLocaleString('en-IN')}`, 
      icon: <IndianRupee size={22} />, 
      color: "#16a34a", 
      bg: "#f0fdf4" 
    },
    { 
      title: "Pipeline Value", 
      value: `₹${stats.totalPipeline.toLocaleString('en-IN')}`, 
      icon: <ClipboardList size={22} />, 
      color: "#ea580c", 
      bg: "#fff7ed" 
    },
    { 
      title: "Team Conv. Rate", 
      value: stats.growth, 
      icon: <TrendingUp size={22} />, 
      color: "#9333ea", 
      bg: "#f3e8ff" 
    },
  ];

  if (loading) return <div className={styles.loader}><Loader className="animate-spin" /> Analyzing Team Data...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.welcomeText}>Team Overview</h2>
        <p className={styles.subtitle}>Real-time performance of your assigned agents</p>
      </div>

      <div className={styles.grid}>
        {statCards.map((card, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.iconBox} style={{ backgroundColor: card.bg, color: card.color }}>
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
          <div className={styles.chartHeader}>
            <h3>📊 Revenue by Agent</h3>
            <span className={styles.badge}>Live Sync</span>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  cursor={{fill: '#f8fafc'}} 
                />
                <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.sideList}>
          <div className={styles.listHeader}>
            <h3><Trophy size={18} color="#f59e0b" /> Top Performers</h3>
          </div>
          <div className={styles.agentList}>
            {agentList.slice(0, 5).map((agent, i) => (
              <div key={agent._id} className={styles.agentItem}>
                <div className={styles.agentRank}>{i + 1}</div>
                <div className={styles.agentDetails}>
                  <p className={styles.agentName}>{agent.name}</p>
                  <p className={styles.agentRev}>₹{(agent.revenue || 0).toLocaleString('en-IN')}</p>
                </div>
                <ArrowRight size={14} color="#cbd5e1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;