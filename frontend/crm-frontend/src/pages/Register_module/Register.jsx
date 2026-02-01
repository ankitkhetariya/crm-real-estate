import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios"; 
import toast from 'react-hot-toast'; 
import { UserPlus, User, Mail, Lock, ShieldAlert, Briefcase, Phone } from "lucide-react"; 
import styles from "./Register.module.css"; 

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  //  SECURITY SWITCH: 
  // Set 'true' to LOCK registration (Public cannot access)
  // Set 'false' to OPEN registration (When you want to add staff)
  const isRegistrationDisabled = true; 

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "agent",
    password: "",
    confirmPassword: ""
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
        password: formData.password
      };

      await API.post("/auth/register", payload);
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration Failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 🚫 DISABLED VIEW (Security Mode)
  if (isRegistrationDisabled) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={`${styles.iconCircle} ${styles.disabledIcon}`}>
              <ShieldAlert size={28} color="#ef4444" />
            </div>
            <h2>Registration Closed</h2>
            <p>Public registration is currently disabled for security reasons.</p>
          </div>
          
          <div className={styles.disabledBody}>
            <p>Please contact the Administrator to get your account credentials.</p>
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

  // ✅ ACTIVE FORM VIEW (Only visible if isRegistrationDisabled = false)
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <UserPlus size={28} color="#2563eb" />
          </div>
          <h2>Create Account</h2>
          <p>Join us and manage your leads effectively</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Name */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input type="text" name="name" placeholder="Full Name" required 
                value={formData.name} onChange={handleChange} />
            </div>
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input type="email" name="email" placeholder="Email Address" required 
                value={formData.email} onChange={handleChange} />
            </div>
          </div>

          {/* Phone */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.inputIcon} />
              <input type="text" name="phone" placeholder="Phone Number" 
                value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          {/* Role Dropdown */}
          <div className={styles.inputGroup}>
            <label style={{marginBottom:'2px'}}>Select Role</label>
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
              <input type="password" name="password" placeholder="Create a password" required 
                value={formData.password} onChange={handleChange} />
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input type="password" name="confirmPassword" placeholder="Confirm password" required 
                value={formData.confirmPassword} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className={styles.registerBtn} disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;