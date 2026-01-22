import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from 'react-hot-toast';
import { User, Lock, ShieldCheck, Mail, Save } from "lucide-react";
import styles from "./Settings.module.css"; //CSS Importerd

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // --- State 1: Profile ---
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });

  // --- State 2: Password ---
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: ""
  });

  //  1. Update Profile Function
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put("/auth/profile", profileData);
      
      const updatedUser = { ...user, name: res.data.user.name, email: res.data.user.email };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile Updated! 👤");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  //  2. Change Password Function
  const handlePassChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put("/auth/update-password", passData);
      toast.success("Password Changed Successfully! 🔒");
      setPassData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>
           <User size={30} color="#2563eb" /> Account Settings
        </h2>
        <p className={styles.subtitle}>Manage your personal information and security settings.</p>
      </div>

      {/* --- Card 1: Edit Profile --- */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
            <User size={20} className={styles.iconBlue} /> Personal Information
        </div>
        
        <form onSubmit={handleProfileUpdate} className={styles.form}>
            <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
                <input 
                    type="text" 
                    className={styles.simpleInput}
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Enter your name"
                />
            </div>
            
            <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={`${styles.inputWrapper} ${styles.readOnlyWrapper}`}>
                    <Mail size={18} color="#64748b" />
                    <input 
                        type="email" 
                        className={styles.inputField}
                        value={profileData.email} 
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                </div>
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? "Saving..." : <><Save size={18} /> Update Profile</>}
            </button>
        </form>
      </div>

      {/* --- Card 2: Security --- */}
      <div className={`${styles.card} ${styles.securityCard}`}>
        <div className={styles.cardHeader}>
            <ShieldCheck size={20} color="#ef4444" /> 
            <span className={styles.dangerTitle}>Security</span>
        </div>

        <form onSubmit={handlePassChange} className={styles.form}>
            <div className={styles.inputGroup}>
                <label className={styles.label}>Current Password</label>
                <div className={styles.inputWrapper}>
                    <Lock size={18} color="#64748b" />
                    <input 
                        type="password" 
                        className={styles.inputField}
                        placeholder="Enter current password"
                        value={passData.currentPassword}
                        onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                        required
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>New Password</label>
                <div className={styles.inputWrapper}>
                    <Lock size={18} color="#64748b" />
                    <input 
                        type="password" 
                        className={styles.inputField}
                        placeholder="Enter new strong password"
                        value={passData.newPassword}
                        onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                        required
                        minLength={6}
                    />
                </div>
            </div>

            <button type="submit" className={`${styles.btn} ${styles.dangerBtn}`} disabled={loading}>
                {loading ? "Processing..." : "Change Password"}
            </button>
        </form>
      </div>

    </div>
  );
};

export default Settings;