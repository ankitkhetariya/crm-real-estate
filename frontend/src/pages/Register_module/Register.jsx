import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  ShieldAlert,
  Briefcase,
  Phone,
  ArrowLeft,
} from "lucide-react";
import styles from "./Register.module.css";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // SMART SECURITY CHECK:
  // LocalStorage se role nikalenge. Agar "admin" hai, toh hi form khulega.
  const currentUserRole = localStorage.getItem("role");
  const isAdmin = currentUserRole === "admin";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "agent",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password,
      };

      await API.post("/auth/register", payload);

      // Admin ke liye success message aur redirect
      toast.success(
        `${formData.role.toUpperCase()} account created successfully!`,
      );
      navigate("/admin-dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration Failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // DISABLED VIEW (Agar koi non-admin ya public aane ki koshish kare)
  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={`${styles.iconCircle} ${styles.disabledIcon}`}>
              <ShieldAlert size={28} color="#ef4444" />
            </div>
            <h2>Registration Closed</h2>
            <p>
              Public registration is currently disabled for security reasons.
            </p>
          </div>

          <div className={styles.disabledBody}>
            <p>
              Please contact the Administrator to get your account credentials.
            </p>
            <button
              onClick={() => navigate("/login")}
              className={styles.registerBtn}
            >
              Go to Login Page
            </button>
          </div>

          <div className={styles.footer}>
            Need specialized access? <a href="#">Contact Admin</a>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE FORM VIEW (Sirf Admin ko dikhega)
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <UserPlus size={28} color="#2563eb" />
          </div>
          <h2>Add New Employee</h2>
          <p>Create credentials for your team members</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Role Dropdown */}
          <div className={styles.inputGroup}>
            <label
              style={{
                marginBottom: "2px",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Select Role
            </label>
            <div className={`${styles.inputWrapper} ${styles.selectWrapper}`}>
              <Briefcase size={18} className={styles.inputIcon} />
              <select
                name="role"
                className={styles.selectInput}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="agent">Agent (Sales)</option>
                <option value="manager">Manager (Team Lead)</option>
                <option value="admin">Admin (Owner)</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                name="password"
                placeholder="Create a temporary password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.registerBtn}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register Employee"}
          </button>
        </form>

        <div
          className={styles.footer}
          style={{ display: "flex", justifyContent: "center", gap: "8px" }}
        >
          <button
            onClick={() => navigate("/admin-dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
