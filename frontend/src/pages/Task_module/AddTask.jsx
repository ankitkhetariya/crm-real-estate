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
import styles from "./AddTask.module.css";

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
        const leadsArray = Array.isArray(res.data.data)
          ? res.data.data
          : res.data;
        setLeads(leadsArray || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeads();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Strict 50 Word Limit for Description
    if (name === "description") {
      const words = value.match(/\S+/g) || [];
      if (words.length > 50) {
        const truncated = words.slice(0, 50).join(" ");
        // Prevent adding more words, but allow deleting
        if (value.length > formData.description.length) {
          setFormData({ ...formData, [name]: truncated });
          return;
        }
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validations
    if (!formData.title || !formData.dueDate) {
      toast.error("Title & Date are required!");
      return;
    }

    if (!formData.lead) {
      toast.error("Please select a Lead to assign this task!");
      return;
    }

    setLoading(true);
    try {
      await API.post("/tasks", formData);
      toast.success("Task Added Successfully!");
      navigate("/tasks");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add task.");
    } finally {
      setLoading(false);
    }
  };

  // Get current word count dynamically
  const currentWords = (formData.description.match(/\S+/g) || []).length;

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
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.col}`}>
            <label>
              Link to Lead <span style={{ color: "red" }}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <User size={18} color="#6b7280" />
              <select
                name="lead"
                value={formData.lead}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Lead --</option>
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
          {/* Label and Word Counter side by side */}
          <div className={styles.labelRow}>
            <label>Notes</label>
            <span
              className={`${styles.wordCount} ${
                currentWords >= 50
                  ? styles.wordCountDanger
                  : currentWords >= 30
                    ? styles.wordCountWarning
                    : ""
              }`}
            >
              {currentWords}/50 words
            </span>
          </div>

          <div className={`${styles.inputWrapper} ${styles.textareaWrapper}`}>
            <FileText size={18} color="#6b7280" className={styles.iconTop} />
            <textarea
              name="description"
              rows="3"
              placeholder="Any special requirements..."
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
