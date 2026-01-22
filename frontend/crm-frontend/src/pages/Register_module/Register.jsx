import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios"; 
import toast from 'react-hot-toast'; 
import { UserPlus, User, Mail, Lock } from "lucide-react"; 
import styles from "./Register.module.css"; 

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);

    try {
      // Backend API Call
      // Note: confirmPassword backend bhejne ki zaroorat nahi hoti usually
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      await API.post("/auth/register", payload);
      
      toast.success("Account created! Please log in.");
      navigate("/login");

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration Failed";
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
            <UserPlus size={28} color="#2563eb" />
          </div>
          <h2>Create Account</h2>
          <p>Join us and manage your leads effectively</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Name */}
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input 
                type="text" name="name" placeholder="John Doe" required 
                value={formData.name} onChange={handleChange} 
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input 
                type="email" name="email" placeholder="name@company.com" required 
                value={formData.email} onChange={handleChange} 
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label>Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type="password" name="password" placeholder="Create a password" required 
                value={formData.password} onChange={handleChange} 
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input 
                type="password" name="confirmPassword" placeholder="Confirm password" required 
                value={formData.confirmPassword} onChange={handleChange} 
              />
            </div>
          </div>

          <button type="submit" className={styles.registerBtn} disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>

        {/* Footer */}
        <div className={styles.footer}>
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;