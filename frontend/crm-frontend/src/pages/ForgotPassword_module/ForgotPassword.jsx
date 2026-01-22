import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios"; 
import toast from 'react-hot-toast'; 
import { Mail, ArrowRight, KeyRound } from "lucide-react"; 
import styles from "./ForgotPassword.module.css"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend API Call
      await API.post("/auth/forgot-password", { email });
      
      // Success Message
      toast.success("Reset link sent to your email!");
      
      // Optional: Input clear kar do
      setEmail("");

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong.";
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
          <p>No worries! Enter your email and we will send you a reset link.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          
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
            {loading ? "Sending Link..." : "Send Reset Link"}
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

export default ForgotPassword;