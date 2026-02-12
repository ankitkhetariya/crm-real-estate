import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";
import {
  Save,
  ArrowLeft,
  CheckSquare,
  Calendar,
  Flag,
  User,
  FileText,
} from "lucide-react";
import styles from "./AddTask.module.css"; // ✅ CSS Module Import

const AddTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    lead: "",
  });

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await API.get("/leads");
        setLeads(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeads();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.title || !formData.dueDate) {
      toast.error("Title & Date required!");
      setLoading(false);
      return;
    }
    try {
      await API.post("/tasks", formData);
      toast.success("Task Added Successfully! 📅");
      navigate("/tasks");
    } catch (err) {
      toast.error("Failed to add task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate("/tasks")} className={styles.backBtn}>
          <ArrowLeft size={24} />
        </button>
        <h2>Create Follow-up / Task</h2>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* Title */}
        <div className={styles.formGroup}>
          <label>
            Task Title <span style={{ color: "red" }}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <CheckSquare size={18} color="#6b7280" />
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Call Client for Payment"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Date */}
        <div className={styles.formGroup}>
          <label>
            Due Date & Time <span style={{ color: "red" }}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <Calendar size={18} color="#6b7280" />
            <input
              type="datetime-local"
              name="dueDate"
              required
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Priority & Lead Row */}
        <div className={styles.row}>
          <div className={`${styles.formGroup} ${styles.col}`}>
            <label>Priority</label>
            <div className={styles.inputWrapper}>
              <Flag size={18} color="#6b7280" />
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High 🔥</option>
              </select>
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.col}`}>
            <label>Link to Lead</label>
            <div className={styles.inputWrapper}>
              <User size={18} color="#6b7280" />
              <select name="lead" value={formData.lead} onChange={handleChange}>
                <option value="">-- None --</option>
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label>Description</label>
          <div className={styles.inputWrapper}>
            <FileText size={18} color="#6b7280" />
            <textarea
              name="description"
              rows="3"
              placeholder="Additional details..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            "Saving..."
          ) : (
            <>
              <Save size={18} /> Save Task
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddTask;
