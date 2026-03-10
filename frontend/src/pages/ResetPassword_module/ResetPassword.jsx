import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // ✅ Added useLocation
import API from "../../api/axios";
import toast from "react-hot-toast";
import { KeyRound, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./ResetPassword.module.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Hook to get data from previous page

  const [formData, setFormData] = useState({
    email: location.state?.email || "", // ✅ Auto-fill email if passed
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);

    try {
      await API.post("/auth/reset-password", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      toast.success("Password Changed Successfully! 🎉 Login now.");
      navigate("/login");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update password";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <KeyRound size={28} color="#2563eb" />
          </div>
          <h2>Reset Password</h2>
          <p>Enter the OTP sent to your email to reset your password.</p>
        </div>

        <form onSubmit={handleReset} className={styles.form}>
          {/* Email Field - Auto filled but editable */}
          <div className={styles.inputGroup}>
            <label>Confirm Email</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* OTP Field */}
          <div className={styles.inputGroup}>
            <label>Verification Code (OTP)</label>
            <div className={styles.inputWrapper}>
              <ShieldCheck size={18} className={styles.inputIcon} />
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit code"
                value={formData.otp}
                onChange={handleChange}
                maxLength={6}
                required
                style={{ letterSpacing: "2px", fontWeight: "600" }}
              />
            </div>
          </div>

          {/* New Password */}
          <div className={styles.inputGroup}>
            <label>New Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
            {!loading && <ArrowRight size={18} style={{ marginLeft: "8px" }} />}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.backLink}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
