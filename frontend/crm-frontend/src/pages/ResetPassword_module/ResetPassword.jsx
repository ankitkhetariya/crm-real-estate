import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import toast from 'react-hot-toast'; // ✅ Toast Import
import { KeyRound, Lock, Mail, ArrowRight } from "lucide-react"; // Icons
import styles from "./ResetPassword.module.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = async (e) => {
    e.preventDefault();

    // 1. Frontend Validation
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);

    try {
      // Backend request
      await API.post("/auth/reset-password", { 
        email: formData.email, 
        newPassword: formData.newPassword 
      });

      // ✅ Success
      toast.success("Password Changed Successfully! 🎉 Login now.");
      navigate("/login");

    } catch (err) {
      // ❌ Error
      const errorMsg = err.response?.data?.error || "Failed to update password";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <KeyRound size={28} color="#2563eb" />
          </div>
          <h2>Reset Password</h2>
          <p>Secure your account with a new password</p>
        </div>

        {/* Form */}
        <form onSubmit={handleReset} className={styles.form}>
          
          {/* Email Field */}
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
            {loading ? "Updating..." : "Update Password"}
            {!loading && <ArrowRight size={18} style={{marginLeft: "8px"}}/>}
          </button>

        </form>

        {/* Footer */}
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