import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios";
import { Users, TrendingUp, ClipboardList, Loader, IndianRupee } from "lucide-react";
import styles from "./Dashboard.module.css";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts'; // 👈 Add CartesianGrid here
// Dashboard.jsx
const res = await API.get("/leads/stats"); // This must match app.use('/api/leads', ...) + router.get('/stats', ...)

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    totalRevenue: 0,
    totalPipeline: 0,
    conversionRate: 0,
    statusCounts: [],
    activeTasksCount: 0 
  });

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await API.get("/leads/stats");
        if (isMounted) {
          // If response is empty or null, we keep the default 0 values
          setStats(res.data || {
            totalLeads: 0,
            convertedLeads: 0,
            totalRevenue: 0,
            totalPipeline: 0,
            conversionRate: 0,
            statusCounts: [],
            activeTasksCount: 0 
          });
        }
      } catch (err) {
        console.error("Dashboard Stats Sync Error:", err);
      } finally {
        // This ensures Loading turns off even if the API fails or is empty
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  // Data Formatting for Charts
  const financialData = [
    { name: 'Revenue', amount: stats.totalRevenue || 0 },
    { name: 'Pipeline', amount: stats.totalPipeline || 0 }
  ];

  const pieData = stats.statusCounts?.map(item => ({
    name: item._id || "Unknown",
    value: item.count || 0
  })) || [];

  const COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#ef4444', '#6366f1'];

  const statCards = [
    { 
        title: "Total Leads", 
        value: stats.totalLeads || 0, 
        icon: <Users size={24} color="#2563eb" />, 
        bg: "#eff6ff" 
    },
    { 
        title: "Total Revenue", 
        value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, 
        icon: <IndianRupee size={24} color="#16a34a" />, 
        bg: "#f0fdf4" 
    },
    { 
        title: "Conversion Rate", 
        value: `${stats.conversionRate || 0}%`, 
        icon: <TrendingUp size={24} color="#d97706" />, 
        bg: "#fffbeb" 
    },
    { 
        title: "Active Tasks", 
        value: stats.activeTasksCount || 0, 
        icon: <ClipboardList size={24} color="#9333ea" />, 
        bg: "#f3e8ff",
        note: "Pending Tasks"
    },
  ];

  if (loading) {
      return (
        <div className={styles.loaderContainer}>
          <Loader className="animate-spin" /> 
          <span>Syncing Dashboard...</span>
        </div>
      );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.welcomeText}>👋 Welcome back, {user?.name || "User"}</h2>

      {/* --- Stat Cards Grid --- */}
      <div className={styles.grid}>
        {statCards.map((card, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.iconBox} style={{ backgroundColor: card.bg }}>
              {card.icon}
            </div>
            <div className={styles.cardInfo}>
              <p className={styles.cardTitle}>{card.title}</p>
              <h3 className={styles.cardValue}>{card.value}</h3>
              {card.note && <span className={styles.cardNote}>{card.note}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* --- Charts Section --- */}
      <div className={styles.chartsSection}>
        {/* Revenue Bar Chart */}
        <div className={styles.chartCard}>
            <h3>💰 Revenue vs Pipeline</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={financialData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                        <Bar dataKey="amount" fill="#4f46e5" radius={[5, 5, 0, 0]} barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Status Pie Chart */}
        <div className={styles.chartCard}>
            <h3>📊 Leads Status</h3>
            {pieData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={pieData} 
                                cx="50%" cy="50%"
                                innerRadius={60} 
                                outerRadius={80}
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className={styles.noDataText}>No lead data tracked yet</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;