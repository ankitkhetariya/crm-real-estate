import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios";
import {
  Users,
  TrendingUp,
  ClipboardList,
  Loader,
  IndianRupee,
  Percent,
  Save,
  Pencil,
  Wallet,
  BarChart3,
  PieChart as PieChartIcon, // ✅ Aliased to avoid conflict with Recharts
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./Dashboard.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Existing stats
  const [stats, setStats] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    totalRevenue: 0,
    totalPipeline: 0,
    conversionRate: 0,
    statusCounts: [],
    activeTasksCount: 0,
  });

  // Manager commission state
  const [commissionPercent, setCommissionPercent] = useState(20);
  const [manualOverride, setManualOverride] = useState("");
  const [useManualOverride, setUseManualOverride] = useState(false);

  // Profit margin state (for the profit estimator)
  const [profitMargin, setProfitMargin] = useState(20); // default 20%

  const isAdmin = user?.role === "admin" || user?.isAdmin;

  useEffect(() => {
    // Example: API.get('/settings/commission').then(res => setCommissionPercent(res.data.value))
  }, []);

  // Fetch stats
  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (authLoading || !token) return;

      try {
        setLoading(true);
        const res = await API.get("/leads/stats");
        if (isMounted && res.data) setStats(res.data);
      } catch (err) {
        console.error("Dashboard Stats Fetch Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [token, authLoading]);

  // Handlers for commission updates
  const handleUpdateCommission = async () => {
    setSaving(true);
    try {
      // await API.post('/settings/commission', { percent: commissionPercent });
      toast.success(`Commission percentage saved as ${commissionPercent}%`);
    } catch (error) {
      console.error("Failed to update commission", error);
      toast.error("Failed to update commission");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveManualOverride = async () => {
    if (!manualOverride || isNaN(manualOverride)) return;
    setSaving(true);
    try {
      // await API.post('/managers/commission-override', { amount: manualOverride });
      toast.success(
        `Manual override amount saved: ₹${parseFloat(manualOverride).toLocaleString("en-IN")}`,
      );
    } catch (error) {
      console.error("Failed to save override", error);
      toast.error("Failed to save manual override");
    } finally {
      setSaving(false);
    }
  };

  // Formatting helpers
  const formatYAxis = (tickItem) => {
    if (tickItem >= 10000000) return `₹${(tickItem / 10000000).toFixed(2)}Cr`;
    if (tickItem >= 100000) return `₹${(tickItem / 100000).toFixed(1)}L`;
    if (tickItem >= 1000) return `₹${(tickItem / 1000).toFixed(1)}k`;
    return `₹${tickItem}`;
  };

  const formatIndianCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)}k`;
    return `₹${amount.toFixed(2)}`;
  };

  const financialData = [
    { name: "Revenue", amount: stats.totalRevenue || 0 },
    { name: "Pipeline", amount: stats.totalPipeline || 0 },
  ];

  const pieData =
    stats.statusCounts?.map((item) => ({
      name: item._id || "Unknown",
      value: item.count || 0,
    })) || [];

  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#d97706",
    "#9333ea",
    "#ef4444",
    "#6366f1",
  ];

  const calculatedProfit = (stats.totalRevenue * profitMargin) / 100;

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
      {/* Removed 👋 emoji for a cleaner corporate look */}
      <h2 className={styles.welcomeText}>
        Welcome back, {user?.name || "User"}
      </h2>

      {/* Admin Commission Panel */}
      {isAdmin && (
        <div className={styles.commissionPanel}>
          <h3 className={styles.panelTitle}>
            <Percent size={20} /> Manager Commission Settings
          </h3>
          <div className={styles.commissionGrid}>
            <div className={styles.commissionItem}>
              <label htmlFor="commissionPercent">
                Commission Percentage (%)
              </label>
              <div className={styles.inputGroup}>
                <input
                  id="commissionPercent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  className={styles.commissionInput}
                />
                <button
                  onClick={handleUpdateCommission}
                  disabled={saving}
                  className={styles.saveButton}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Update"}
                </button>
              </div>
              {!useManualOverride && (
                <p className={styles.calculatedPreview}>
                  Based on current revenue (₹
                  {(stats.totalRevenue || 0).toLocaleString("en-IN")}):
                  <br />
                  <strong>
                    Manager gets: ₹
                    {(
                      (stats.totalRevenue || 0) *
                      (commissionPercent / 100)
                    ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </strong>
                </p>
              )}
            </div>

            <div className={styles.commissionItem}>
              <label htmlFor="manualOverride">
                Manual Override (Total ₹ to Manager)
                <span className={styles.optionalTag}>optional</span>
              </label>
              <div className={styles.inputGroup}>
                <div className={styles.overrideInputWrapper}>
                  <span className={styles.rupeeSymbol}>₹</span>
                  <input
                    id="manualOverride"
                    type="number"
                    min="0"
                    step="1000"
                    value={manualOverride}
                    onChange={(e) => setManualOverride(e.target.value)}
                    placeholder="Enter amount"
                    className={styles.overrideInput}
                    disabled={!useManualOverride}
                  />
                </div>
                <div className={styles.overrideControls}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={useManualOverride}
                      onChange={(e) => setUseManualOverride(e.target.checked)}
                    />
                    Enable override
                  </label>
                  <button
                    onClick={handleSaveManualOverride}
                    disabled={saving || !useManualOverride || !manualOverride}
                    className={styles.saveButton}
                  >
                    <Pencil size={16} />
                    Set Amount
                  </button>
                </div>
              </div>
              {useManualOverride && manualOverride && (
                <p className={styles.overridePreview}>
                  Manager will receive: ₹
                  {parseFloat(manualOverride).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className={styles.grid}>
        {[
          {
            title: "Total Leads",
            value: stats.totalLeads,
            icon: <Users size={24} color="#2563eb" />,
            bg: "#eff6ff",
          },
          {
            title: "Total Revenue",
            value: `₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`,
            icon: <IndianRupee size={24} color="#16a34a" />,
            bg: "#f0fdf4",
          },
          {
            title: "Conversion Rate",
            value: `${stats.conversionRate || 0}%`,
            icon: <TrendingUp size={24} color="#d97706" />,
            bg: "#fffbeb",
          },
          {
            title: "Active Tasks",
            value: stats.activeTasksCount,
            icon: <ClipboardList size={24} color="#9333ea" />,
            bg: "#f3e8ff",
            note: "Pending",
          },
        ].map((card, i) => (
          <div key={i} className={styles.card}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: card.bg }}
            >
              {card.icon}
            </div>
            <div className={styles.cardInfo}>
              <p className={styles.cardTitle}>{card.title}</p>
              <h3 className={styles.cardValue}>{card.value}</h3>
              {card.note && (
                <span className={styles.cardNote}>{card.note}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Profit Estimator Card */}
      <div className={styles.profitEstimatorCard}>
        <div className={styles.profitHeader}>
          {/* ✅ Replaced Emoji with Wallet Icon */}
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1e293b",
            }}
          >
            <Wallet size={18} color="#3b82f6" /> Estimated Total Profit
          </h3>
          <span className={styles.profitAmount}>
            {formatIndianCurrency(calculatedProfit)}
          </span>
        </div>
        <div className={styles.marginControl}>
          <div className={styles.marginLabel}>
            <span>Est. Margin</span>
            <strong>{profitMargin}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={profitMargin}
            onChange={(e) => setProfitMargin(parseFloat(e.target.value))}
            className={styles.profitSlider}
          />
          <div className={styles.sliderValues}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        <p className={styles.profitNote}>
          Based on total revenue of ₹
          {(stats.totalRevenue || 0).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          {/* ✅ Replaced Emoji with BarChart3 Icon */}
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1e293b",
              marginBottom: "16px",
            }}
          >
            <BarChart3 size={18} color="#4f46e5" /> Revenue Analytics
          </h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
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
                  tickFormatter={formatYAxis}
                  tick={{ fill: "#64748b", fontSize: 13 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "Amount",
                  ]}
                />
                <Bar
                  dataKey="amount"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                  minPointSize={5} // ✅ Added back to prevent invisible bars
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          {/* ✅ Replaced Emoji with PieChart Icon */}
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1e293b",
              marginBottom: "16px",
            }}
          >
            <PieChartIcon size={18} color="#10b981" /> Lead Conversion Status
          </h3>
          {pieData.length > 0 ? (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    }}
                    formatter={(value) => [`${value} Leads`, "Count"]}
                  />
                  <Legend iconType="circle" />
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
