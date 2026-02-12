import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  User,
  Lock,
  Mail,
  Phone,
  Save,
  X,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import styles from "./Settings.module.css";

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // --- Unified Form State ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  // --- OTP Modal State ---
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- MAIN SUBMIT FUNCTION ---
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, email, phone, currentPassword, newPassword } = formData;
    let hasUpdates = false;

    try {
      // 1. Check if Profile (Name/Phone) changed
      if (name !== user.name || phone !== user.phone) {
        const res = await API.put("/auth/profile", { name, phone });

        // Update Context
        const updatedUser = { ...user, ...res.data.user };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile Info Updated! 👤");
        hasUpdates = true;
      }

      // 2. Check if Password fields are filled
      if (newPassword || currentPassword) {
        if (!newPassword || !currentPassword) {
          toast.error(
            "To change password, fill both Current and New password fields.",
          );
          setLoading(false);
          return;
        }
        await API.put("/auth/update-password", {
          currentPassword,
          newPassword,
        });
        toast.success("Password Changed Successfully! 🔒");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
        })); // Clear pass fields
        hasUpdates = true;
      }

      // 3. Check if Email changed (Triggers OTP)
      if (email !== user.email) {
        await API.post("/auth/request-email-change", { newEmail: email });
        setPendingEmail(email);
        setShowOtpModal(true);
        toast("OTP sent to new email! 📧", { icon: "📨" });
        hasUpdates = true;
      }

      if (!hasUpdates && email === user.email) {
        toast("No changes detected.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save changes.");

      // If email failed, revert it visually
      if (email !== user.email) {
        setFormData((prev) => ({ ...prev, email: user.email }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP Logic
  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Please enter the OTP");
    setLoading(true);
    try {
      const res = await API.put("/auth/verify-email-change", {
        newEmail: pendingEmail,
        otp: otp,
      });

      const updatedUser = { ...user, email: res.data.email };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Email updated successfully! ✅");
      setShowOtpModal(false);
      setOtp("");
      setPendingEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <h1>Account Settings</h1>
        <p>Manage your profile details and security preferences.</p>
      </div>

      {/* Unified Card */}
      <div className={styles.card}>
        <form onSubmit={handleSaveChanges}>
          {/* --- Section 1: Personal Details --- */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <User size={20} className={styles.icon} /> Personal Information
            </h3>

            <div className={styles.grid}>
              {/* Name */}
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <div className={styles.inputWrapper}>
                  <User size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className={styles.inputGroup}>
                <label>Phone Number</label>
                <div className={styles.inputWrapper}>
                  <Phone size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your Phone"
                  />
                </div>
              </div>

              {/* Email (Full Width) */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {formData.email !== user?.email && (
                  <small className={styles.warningText}>
                    * Changing email triggers OTP verification.
                  </small>
                )}
              </div>
            </div>
          </div>

          <div className={styles.divider}></div>

          {/* --- Section 2: Security --- */}
          <div className={styles.section}>
            <h3 className={`${styles.sectionTitle} ${styles.dangerText}`}>
              <ShieldCheck size={20} className={styles.icon} /> Security
            </h3>
            <p className={styles.infoText}>
              Leave these blank if you don't want to change your password.
            </p>

            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label>Current Password</label>
                <div className={styles.inputWrapper}>
                  <KeyRound size={18} />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>New Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="••••••"
                    minLength={6}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- Footer Button --- */}
          <div className={styles.formFooter}>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
              {!loading && <Save size={18} style={{ marginLeft: "8px" }} />}
            </button>
          </div>
        </form>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Verify Email Change</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => {
                  setShowOtpModal(false);
                  setFormData((prev) => ({ ...prev, email: user.email })); // Revert
                }}
              >
                <X size={24} />
              </button>
            </div>
            <p>
              Enter the code sent to <strong>{pendingEmail}</strong>
            </p>
            <input
              type="text"
              className={styles.otpInput}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              className={styles.verifyBtn}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Confirm Update"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
