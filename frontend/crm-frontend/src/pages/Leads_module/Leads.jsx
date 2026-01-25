import { useEffect, useState } from "react";
import API from "../../api/axios"; 
import { Plus, Search, Filter, Trash2, Phone, Mail, Edit, X, Save, Briefcase, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2'; 
import styles from "./Leads.module.css"; 

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  /* Fetching all leads from backend */
  const fetchLeads = async () => {
    try {
      const res = await API.get("/leads");
      setLeads(res.data);
    } catch (err) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchLeads(); 
  }, []);

  /* Modal control for editing leads */
  const openEditModal = (lead) => {
    setCurrentLead({ ...lead });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" && value < 0) {
      toast.error("Value cannot be negative!");
      setCurrentLead({ ...currentLead, [name]: 0 });
      return;
    }
    setCurrentLead({ ...currentLead, [name]: value });
  };

  /* Save lead updates */
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (currentLead.budget < 0) return toast.error("Invalid budget value");

    try {
        const res = await API.put(`/leads/${currentLead._id}`, currentLead);
        setLeads(leads.map(l => l._id === currentLead._id ? res.data : l));
        toast.success("Lead Updated Successfully!");
        setIsEditModalOpen(false);
    } catch (error) {
        toast.error("Update failed");
    }
  };

  /* Quick status update from table */
  const handleStatusChange = async (id, newStatus) => {
    try {
        await API.put(`/leads/${id}`, { status: newStatus });
        setLeads(leads.map(l => l._id === id ? { ...l, status: newStatus } : l));
        toast.success(`Status updated to ${newStatus}`);
    } catch(err) {
        toast.error("Update failed");
    }
  };

  /* Single lead deletion */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this Lead?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        await API.delete(`/leads/${id}`);
        setLeads(leads.filter((lead) => lead._id !== id));
        toast.success("Lead removed successfully");
      } catch (err) { toast.error("Failed to delete"); }
    }
  };

  /* Delete all leads functionality */
  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Are you absolutely sure?',
      text: "This will delete ALL leads. This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete everything!'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await API.delete("/leads/delete-all");
        setLeads([]); 
        toast.success("All Leads have been cleared!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to clear leads");
      } finally {
        setLoading(false);
      }
    }
  };

  /* Search and Filter logic */
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
        lead.name.toLowerCase().includes(searchText.toLowerCase()) || 
        (lead.company && lead.company.toLowerCase().includes(searchText.toLowerCase())) ||
        lead.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className={styles.loading}>Loading Dashboard...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Sales Leads</h2>
        <div className={styles.headerActions}>
            <button className={styles.deleteAllBtn} onClick={handleDeleteAll}>
                <Trash2 size={18} /> Delete All
            </button>
            <button className={styles.addBtn} onClick={() => navigate("/add-lead")}>
                <Plus size={18} /> New Lead
            </button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            className={styles.searchInput}
            type="text" 
            placeholder="Search by name, email or company..." 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)} 
          />
        </div>
        <div className={styles.filterWrapper}>
            <Filter size={18} className={styles.filterIcon} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
        </div>
      </div>

      <div className={styles.tableCardContainer}>
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Lead Name & Company</th>
                    <th>Contact Details</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Budget & Source</th>
                    <th style={{textAlign: "center"}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredLeads.length === 0 ? (
                    <tr><td colSpan="6" className={styles.emptyState}>No leads found matching your search.</td></tr>
                ) : (
                    filteredLeads.map((lead) => (
                        <tr key={lead._id}>
                            <td data-label="LEAD & COMPANY">
                                <div className={styles.leadInfo}>
                                    <div className={styles.avatar}>{lead.name.charAt(0)}</div>
                                    <div>
                                        <div className={styles.leadName}>{lead.name}</div>
                                        <div className={styles.companyName}>
                                            <Briefcase size={12} /> {lead.company || "Individual"}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td data-label="CONTACT INFO">
                                <div className={styles.contactCell}>
                                    <span><Mail size={14}/> {lead.email}</span>
                                    <span><Phone size={14}/> {lead.phone}</span>
                                </div>
                            </td>
                            <td data-label="STATUS">
                                <select 
                                    className={styles.statusSelect}
                                    value={lead.status}
                                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                    data-status={lead.status}
                                >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Proposal Sent">Proposal Sent</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </td>
                            <td data-label="NOTES">
                                <div className={styles.noteCell} title={lead.notes}>
                                    {lead.notes ? (lead.notes.length > 30 ? lead.notes.substring(0, 30) + "..." : lead.notes) : <span className={styles.noNote}>-</span>}
                                </div>
                            </td>
                            <td data-label="BUDGET & SOURCE">
                                <div className={styles.budgetCell}>₹{Number(lead.budget).toLocaleString('en-IN')}</div>
                                <div className={styles.sourceLabel}>{lead.source}</div>
                            </td>
                            <td data-label="ACTIONS">
                                <div className={styles.actions}>
                                    <button className={styles.editBtn} onClick={() => openEditModal(lead)} title="Edit Lead">
                                      <Edit size={16} />
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(lead._id)} title="Delete Lead">
                                      <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {isEditModalOpen && currentLead && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Update Lead Details</h3>
                    <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
                </div>
                <form onSubmit={handleSaveChanges} className={styles.editForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}><label>Full Name</label><input name="name" value={currentLead.name} onChange={handleEditChange} required /></div>
                        <div className={styles.formGroup}><label>Company Name</label><input name="company" value={currentLead.company || ""} onChange={handleEditChange} /></div>
                        <div className={styles.formGroup}><label>Email Address</label><input name="email" value={currentLead.email} onChange={handleEditChange} required /></div>
                        <div className={styles.formGroup}><label>Phone Number</label><input name="phone" value={currentLead.phone} onChange={handleEditChange} required /></div>
                        <div className={styles.formGroup}><label>Budget (₹)</label><input type="number" name="budget" min="0" value={currentLead.budget} onChange={handleEditChange} /></div>
                        <div className={styles.formGroup}>
                            <label>Source</label>
                            <select name="source" value={currentLead.source} onChange={handleEditChange}>
                                <option value="Website">Website</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Social Media">Social Media</option>
                                <option value="Ads">Ads</option>
                                <option value="Referral">Referral</option>
                                <option value="Cold Call">Cold Call</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}><label>Notes</label><textarea name="notes" value={currentLead.notes || ""} onChange={handleEditChange} rows="3" /></div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                        <button type="submit" className={styles.saveBtn}><Save size={18} /> Update Lead</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Leads;