import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios"; //Ensure this is your custom API instance
import { Users, TrendingUp, ClipboardList, Loader, IndianRupee } from "lucide-react";
import styles from "./Dashboard.module.css";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';

const Dashboard = () => {
  // 1. Get token and loading state from AuthContext
  const { user, token, loading: authLoading } = useContext(AuthContext);
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
      // GUARD: If Auth is still loading or token is missing, don't fetch yet
      if (authLoading || !token) {
        console.warn("Skipping fetch: Auth is loading or token is missing.");
        return;
      }

      try {
        setLoading(true);
        const res = await API.get("/leads/stats");
        
        if (isMounted && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        // If 401 occurs here, it means the token is invalid or expired
        console.error("Dashboard Stats Fetch Error:", err.response?.data || err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();

    return () => { isMounted = false; };
    // ✅ Dependency Array: Re-run when authLoading finishes or token changes
  }, [token, authLoading]); 

  // --- Data Formatting ---
  const financialData = [
    { name: 'Revenue', amount: stats.totalRevenue || 0 },
    { name: 'Pipeline', amount: stats.totalPipeline || 0 }
  ];

  const pieData = stats.statusCounts?.map(item => ({
    name: item._id || "Unknown",
    value: item.count || 0
  })) || [];

  const COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#ef4444', '#6366f1'];

  // --- Loader State ---
  if (authLoading || loading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader className="animate-spin" size={40} /> 
        <span>Syncing Dashboard Data...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.welcomeText}>👋 Welcome back, {user?.name || "User"}</h2>

      {/* --- Stat Cards Grid --- */}
      <div className={styles.grid}>
        {[
          { title: "Total Leads", value: stats.totalLeads, icon: <Users size={24} color="#2563eb" />, bg: "#eff6ff" },
          { title: "Total Revenue", value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: <IndianRupee size={24} color="#16a34a" />, bg: "#f0fdf4" },
          { title: "Conversion Rate", value: `${stats.conversionRate || 0}%`, icon: <TrendingUp size={24} color="#d97706" />, bg: "#fffbeb" },
          { title: "Active Tasks", value: stats.activeTasksCount, icon: <ClipboardList size={24} color="#9333ea" />, bg: "#f3e8ff", note: "Pending" }
        ].map((card, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.iconBox} style={{ backgroundColor: card.bg }}>{card.icon}</div>
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

        <div className={styles.chartCard}>
          <h3>📊 Leads Status</h3>
          {pieData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <div className={styles.noDataText}>No lead data tracked yet</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;