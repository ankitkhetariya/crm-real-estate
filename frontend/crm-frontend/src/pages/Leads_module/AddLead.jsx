import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios"; 
import toast from 'react-hot-toast'; 
import { Save, ArrowLeft, User, Mail, Phone, MapPin, DollarSign, FileText, Briefcase } from "lucide-react"; 
import styles from "./AddLead.module.css"; 

const AddLead = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "New",
    source: "Website",
    budget: "",
    address: "",
    notes: ""
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    //  Validate budget to prevent negative values
    if (type === "number" && value < 0) {
        toast.error("Budget cannot be negative!");
        setFormData({ ...formData, [name]: 0 });
        return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final Check
    if (formData.budget < 0) {
        toast.error("Invalid budget value");
        return;
    }

    setLoading(true);
    const userId = user?.id || user?._id;

    if (!user || !userId) {
        toast.error("User session expired. Please login again.");
        setLoading(false);
        return;
    }

    const payload = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : 0, 
        assignedTo: userId 
    };

    try {
      await API.post("/leads", payload);
      toast.success("New Lead Added Successfully! 🎉");
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
          <div className={styles.formGroup}>
            <label>Lead Name <span style={{color:"red"}}>*</span></label>
            <div className={styles.inputWrapper}>
                <User size={16} className={styles.icon}/>
                <input type="text" name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Email Address <span style={{color:"red"}}>*</span></label>
            <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.icon}/>
                <input type="email" name="email" required placeholder="client@gmail.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Phone Number <span style={{color:"red"}}>*</span></label>
            <div className={styles.inputWrapper}>
                <Phone size={16} className={styles.icon}/>
                <input type="text" name="phone" required placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Company</label>
            <div className={styles.inputWrapper}>
                <Briefcase size={16} className={styles.icon}/>
                <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Budget (₹)</label>
            <div className={styles.inputWrapper}>
                <DollarSign size={16} className={styles.icon}/>
                <input type="number" name="budget" min="0" placeholder="50000" value={formData.budget} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
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
            <select name="source" value={formData.source} onChange={handleChange}>
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Ads">Ads</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup} style={{gridColumn: "1 / -1"}}>
            <label>Address</label>
            <div className={styles.inputWrapper}>
                <MapPin size={16} className={styles.icon}/>
                <input type="text" name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup} style={{gridColumn: "1 / -1"}}>
            <label>Notes</label>
            <div className={styles.inputWrapper} style={{alignItems:"flex-start"}}>
                <FileText size={16} className={styles.icon} style={{marginTop:"12px"}}/>
                <textarea name="notes" rows="3" placeholder="Any special requirements..." value={formData.notes} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Saving..." : <><Save size={18} /> Save Lead</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLead;