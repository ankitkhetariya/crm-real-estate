import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  Save,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  Briefcase,
  Users,
} from "lucide-react";
import styles from "./AddLead.module.css";

// 1. Import Global Hook
import { useAdminView } from "../../hooks/useAdminView";

const AddLead = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 2. Get Global Filter ID (Used only for initial default)
  const { viewTargetId } = useAdminView();

  const [loading, setLoading] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState([]);

  // 3. State Initialization
  const [formData, setFormData] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "New",
    source: "Website",
    budget: "",
    address: "",
    notes: "",
    assignedTo: viewTargetId || "", // Auto-select if filter is active
  }));

  // 4. Fetch Assignable Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/admin/master-dashboard");
        if (user?.role === "admin") {
          // Admin sees everyone
          setAssignableUsers([
            ...(data.managersList || []),
            ...(data.agentsList || []),
          ]);
        } else if (user?.role === "manager") {
          // Manager sees only their team
          const myAgents = (data.agentsList || []).filter((a) => {
            const mgrId = a.managedBy?._id || a.managedBy;
            return String(mgrId) === String(user.id || user._id);
          });
          setAssignableUsers(myAgents);
        }
      } catch (err) {
        console.error("Failed to load users");
      }
    };
    if (user?.role === "admin" || user?.role === "manager") fetchUsers();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" && value < 0) {
      toast.error("Budget cannot be negative!");
      setFormData((prev) => ({ ...prev, [name]: 0 }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.budget < 0) return toast.error("Invalid budget value");

    setLoading(true);
    const userId = user?.id || user?._id;

    // 5. Assignment Logic
    const finalAssignee = formData.assignedTo ? formData.assignedTo : userId;

    const payload = {
      ...formData,
      budget: formData.budget ? Number(formData.budget) : 0,
      assignedTo: finalAssignee,
    };

    try {
      await API.post("/leads", payload);

      let successMsg = "New Lead Added Successfully! 🎉";
      if (finalAssignee !== userId) {
        const assigneeName =
          assignableUsers.find((u) => u._id === finalAssignee)?.name || "Agent";
        successMsg = `Lead assigned to ${assigneeName}! 🚀`;
      }

      toast.success(successMsg);
      navigate("/leads");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/leads")}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2>Add New Lead</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.grid}>
          {/* Assignment Dropdown (Admin/Manager Only) */}
          {(user?.role === "admin" || user?.role === "manager") && (
            <div
              className={styles.formGroup}
              style={{
                gridColumn: "1/-1",
                background: "#f8fafc",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <label
                style={{
                  color: "#4f46e5",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Users size={16} /> Assign Lead To:
              </label>
              <div className={styles.inputWrapper} style={{ marginTop: "8px" }}>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  style={{
                    fontWeight: "600",
                    padding: "10px",
                    width: "100%",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                >
                  <option value="">Myself (Keep in my list)</option>
                  {assignableUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.role === "manager" ? "Manager: " : "Agent: "} {u.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Visual Feedback */}
              {viewTargetId && formData.assignedTo === viewTargetId && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#16a34a",
                    marginTop: "6px",
                    fontWeight: "500",
                  }}
                >
                  ✓ Auto-selected from Global Filter.
                </p>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label>
              Lead Name <span style={{ color: "red" }}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <User size={16} className={styles.icon} />
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>
              Email Address <span style={{ color: "red" }}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.icon} />
              <input
                type="email"
                name="email"
                required
                placeholder="client@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>
              Phone Number <span style={{ color: "red" }}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <Phone size={16} className={styles.icon} />
              <input
                type="text"
                name="phone"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Company</label>
            <div className={styles.inputWrapper}>
              <Briefcase size={16} className={styles.icon} />
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Budget (₹)</label>
            <div className={styles.inputWrapper}>
              <DollarSign size={16} className={styles.icon} />
              <input
                type="number"
                name="budget"
                min="0"
                placeholder="50000"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
            >
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Ads">Ads</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
            <label>Address</label>
            <div className={styles.inputWrapper}>
              <MapPin size={16} className={styles.icon} />
              <input
                type="text"
                name="address"
                placeholder="Full Address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
            <label>Notes</label>
            <div
              className={styles.inputWrapper}
              style={{ alignItems: "flex-start" }}
            >
              <FileText
                size={16}
                className={styles.icon}
                style={{ marginTop: "12px" }}
              />
              <textarea
                name="notes"
                rows="3"
                placeholder="Any special requirements..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} /> Save Lead
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLead;
