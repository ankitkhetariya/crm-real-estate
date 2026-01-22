import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios"; 
import toast from 'react-hot-toast'; // ✅ Toast Import
import { LogIn, Mail, Lock } from "lucide-react"; // Icons for better look
import styles from "./Login.module.css"; 

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", formData);
      
      // Context mein login update karein
      login(res.data.user, res.data.token);
      
      // ✅ Success Toast
      toast.success("Welcome back! Login Successful.");
      navigate("/dashboard");

    } catch (err) {
      // ❌ Error Toast
      const errorMsg = err.response?.data?.message || "Invalid Email or Password";
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
            <LogIn size={28} color="#2563eb" />
          </div>
          <h2>Welcome Back</h2>
          <p>Please log in to your CRM account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                type="email" 
                name="email" 
                placeholder="name@company.com" 
                required 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
                <label>Password</label>
                <Link to="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
            </div>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                value={formData.password} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        {/* Footer */}
        <div className={styles.footer}>
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;