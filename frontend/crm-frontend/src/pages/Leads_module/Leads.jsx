import { useEffect, useState } from "react";
import API from "../../api/axios"; 
import { Plus, Search, Filter, Trash2, Phone, Mail, Edit, X, Save } from "lucide-react";
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

  // --- Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null); // Data being edited

  // Fetch Logic
  const fetchLeads = async () => {
    try {
      const res = await API.get("/leads");
      setLeads(res.data);
    } catch (err) {
      console.error("Error fetching leads:", err);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // --- Delete Functions ---
  const handleDeleteAll = async () => {
    if (leads.length === 0) return;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will delete ALL leads permanently!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete everything!'
    });

    if (result.isConfirmed) {
      try {
        await API.delete("/leads/delete-all");
        setLeads([]); 
        Swal.fire('Deleted!', 'All leads cleared.', 'success');
      } catch (err) {
        toast.error("Failed to delete data");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this Lead?',
      text: "Action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/leads/${id}`);
        setLeads(leads.filter((lead) => lead._id !== id));
        Swal.fire('Deleted!', 'Lead removed.', 'success');
      } catch (err) {
        toast.error("Failed to delete lead");
      }
    }
  };

  // --- Status Change ---
  const handleStatusChange = async (id, newStatus) => {
    const updatedList = leads.map(l => l._id === id ? { ...l, status: newStatus } : l);
    setLeads(updatedList);
    try {
        await API.put(`/leads/${id}`, { status: newStatus });
        toast.success(`Status updated`);
    } catch(err) {
        toast.error("Update failed");
        fetchLeads();
    }
  };

  // --- EDIT MODAL LOGIC (New) ---

  // 1. Open Modal and fill data
  const openEditModal = (lead) => {
    setCurrentLead(lead); // Set the lead to be edited
    setIsEditModalOpen(true);
  };

  // 2. Handle Input Change in Modal
  const handleEditChange = (e) => {
    setCurrentLead({ ...currentLead, [e.target.name]: e.target.value });
  };

  // 3. Save Changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
        await API.put(`/leads/${currentLead._id}`, currentLead);
        
        // Update local state UI
        setLeads(leads.map(l => l._id === currentLead._id ? currentLead : l));
        
        toast.success("Lead Updated Successfully! 🎉");
        setIsEditModalOpen(false); // Close Modal
    } catch (error) {
        console.error(error);
        toast.error("Failed to update lead");
    }
  };

  // --- Filter Logic ---
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchText.toLowerCase()) || 
      lead.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className={styles.loading}>Loading Leads...</div>;

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h2>My Leads</h2>
        <div style={{ display: "flex", gap: "12px" }}>
            {leads.length > 0 && (
                <button onClick={handleDeleteAll} className={styles.deleteBtn}>
                    <Trash2 size={18} /> Delete All
                </button>
            )}
            <button className={styles.addBtn} onClick={() => navigate("/add-lead")}>
              <Plus size={18} /> Add New Lead
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className={styles.selectWrapper}>
            <Filter size={16} style={{marginRight: "8px", color:"#64748b"}} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Budget</th>
                        <th style={{textAlign:"center"}}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLeads.length === 0 ? (
                        <tr><td colSpan="6" style={{textAlign:"center", padding:"30px", color:"#94a3b8"}}>No leads found.</td></tr>
                    ) : (
                        filteredLeads.map((lead) => (
                            <tr key={lead._id}>
                                <td>
                                    <div className={styles.leadName}>{lead.name}</div>
                                    <div className={styles.leadSub}>{lead.address || "No Address"}</div>
                                </td>
                                <td>
                                    <div className={styles.contactRow}><Mail size={12}/> {lead.email}</div>
                                    <div className={styles.contactRow}><Phone size={12}/> {lead.phone}</div>
                                </td>
                                <td>
                                    <select 
                                        className={styles.statusSelect}
                                        value={lead.status}
                                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                                        style={{
                                            backgroundColor: lead.status === 'New' ? '#dbeafe' : 
                                                           lead.status === 'Converted' ? '#dcfce7' : '#f1f5f9',
                                            color: lead.status === 'New' ? '#1e40af' : 
                                                   lead.status === 'Converted' ? '#166534' : '#475569'
                                        }}
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Converted">Converted</option>
                                        <option value="Lost">Lost</option>
                                    </select>
                                </td>
                                <td>{lead.source}</td>
                                <td>₹{lead.budget?.toLocaleString()}</td>
                                <td style={{textAlign:"center"}}>
                                    
                                    {/* ✏️ Edit Button - Opens Modal */}
                                    <button 
                                        className={styles.editBtn} 
                                        onClick={() => openEditModal(lead)}
                                        title="Edit Lead"
                                    >
                                        <Edit size={16} />
                                    </button>

                                    {/* 🗑️ Delete Button */}
                                    <button 
                                        className={styles.actionBtn} 
                                        onClick={() => handleDelete(lead._id)}
                                        title="Delete Lead"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* 🚀 EDIT MODAL (POPUP) */}
      {isEditModalOpen && currentLead && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Edit Lead Details</h3>
                    <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSaveChanges}>
                    <div className={styles.formGrid}>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input 
                                name="name"
                                value={currentLead.name} 
                                onChange={handleEditChange} 
                                className={styles.input} 
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Company</label>
                            <input 
                                name="company"
                                value={currentLead.company} 
                                onChange={handleEditChange} 
                                className={styles.input} 
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email</label>
                            <input 
                                name="email"
                                value={currentLead.email} 
                                onChange={handleEditChange} 
                                className={styles.input} 
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Phone</label>
                            <input 
                                name="phone"
                                value={currentLead.phone} 
                                onChange={handleEditChange} 
                                className={styles.input} 
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Budget (₹)</label>
                            <input 
                                type="number"
                                name="budget"
                                value={currentLead.budget} 
                                onChange={handleEditChange} 
                                className={styles.input} 
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Source</label>
                            <select 
                                name="source"
                                value={currentLead.source} 
                                onChange={handleEditChange} 
                                className={styles.input} 
                            >
                                <option value="Website">Website</option>
                                <option value="Referral">Referral</option>
                                <option value="Social Media">Social Media</option>
                                <option value="Cold Call">Cold Call</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Address</label>
                            <input 
                                name="address"
                                value={currentLead.address || ""} 
                                onChange={handleEditChange} 
                                className={styles.input} 
                            />
                        </div>

                    </div>

                    <button type="submit" className={styles.saveBtn}>
                        <Save size={18} style={{marginRight: "8px"}} /> Save Changes
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Leads;