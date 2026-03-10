import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Mail, ArrowRight, KeyRound } from "lucide-react";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Send OTP Request
      await API.post("/auth/forgot-password", { email });

      // 2. Success Message
      toast.success("OTP sent! Please check your email 📧");

      // 3. Redirect to Reset Password Page
      // We pass the email in 'state' so the next page can auto-fill it
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to send OTP.";
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
          <h2>Forgot Password?</h2>
          <p>No worries! Enter your email to receive an OTP.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSendOtp} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP Code"}
            {!loading && <ArrowRight size={18} style={{ marginLeft: "8px" }} />}
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

export default ForgotPassword;
