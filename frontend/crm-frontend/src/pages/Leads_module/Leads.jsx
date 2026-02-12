import { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Phone,
  Mail,
  Edit,
  X,
  Save,
  Briefcase,
  MapPin,
  MessageSquare,
  Eye, // ✅ Added Eye Icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import styles from "./Leads.module.css";

// 1. Import Global Tools
import { useAdminView } from "../../hooks/useAdminView";
import AdminViewFilter from "../../components/AdminViewFilter";

const Leads = () => {
  const navigate = useNavigate();

  // 2. Use Global Hook
  const { viewTargetId, setTarget } = useAdminView();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  /* Fetching all leads */
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

  /*  PROFESSIONAL VIEW DETAILS POPUP */
  const handleViewDetails = (lead) => {
    Swal.fire({
      title: null,
      html: `
          <div style="text-align: left; font-family: 'Inter', sans-serif; color: #334155;">

            <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:start; flex-wrap:wrap; gap:10px;">
              <div>
                  <h2 style="margin: 0; font-size: 1.4rem; color: #0f172a; font-weight: 700;">${lead.name}</h2>
                  <div style="font-size: 0.9rem; color: #64748b; margin-top: 4px; display:flex; align-items:center; gap:6px;">
                      <span style="background:#f1f5f9; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">${lead.company || "Individual"}</span>
                  </div>
              </div>
              <div>
                  <span style="background:${getStatusColor(lead.status)}; color:white; padding:4px 12px; border-radius:20px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">${lead.status}</span>
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">

              <div style="flex: 1 1 200px; background:#f8fafc; padding:10px; border-radius:8px;">
                  <div style="color:#64748b; font-size:0.7rem; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Email</div>
                  <div style="font-weight:500; color:#0f172a; font-size:0.9rem; word-break: break-all;">${lead.email}</div>
              </div>

              <div style="flex: 1 1 200px; background:#f8fafc; padding:10px; border-radius:8px;">
                  <div style="color:#64748b; font-size:0.7rem; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Phone</div>
                  <div style="font-weight:500; color:#0f172a; font-size:0.9rem;">${lead.phone}</div>
              </div>

              <div style="flex: 1 1 200px; background:#f8fafc; padding:10px; border-radius:8px;">
                  <div style="color:#64748b; font-size:0.7rem; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Budget</div>
                  <div style="font-weight:600; color:#2563eb; font-size:1rem;">₹${Number(lead.budget).toLocaleString("en-IN")}</div>
              </div>

              <div style="flex: 1 1 200px; background:#f8fafc; padding:10px; border-radius:8px;">
                  <div style="color:#64748b; font-size:0.7rem; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Source</div>
                  <div style="font-weight:500; color:#0f172a; font-size:0.9rem;">${lead.source}</div>
              </div>

            </div>

            ${
              lead.address
                ? `
            <div style="margin-bottom: 20px;">
               <div style="color:#64748b; font-size:0.75rem; font-weight:700; text-transform:uppercase; margin-bottom:6px;">📍 Address</div>
               <div style="color:#334155; font-size:0.9rem;">${lead.address}</div>
            </div>`
                : ""
            }

            <div style="background:#fff7ed; padding:15px; border-radius:8px; border-left:4px solid #f97316;">
              <div style="color:#9a3412; font-size:0.75rem; font-weight:800; text-transform:uppercase; margin-bottom:6px;">📝 Full Notes</div>
              <p style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: #334155; white-space: pre-wrap;">${lead.notes || "No notes available."}</p>
            </div>
          </div>
        `,
      showCloseButton: true,
      showConfirmButton: false,
      width: "550px", // Limits max width on desktop
      padding: "20px",
      customClass: {
        popup: "swal2-responsive-popup", // Optional hooks for CSS if needed later
      },
    });
  };
  // Helper for Status Colors in Popup
  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "#3b82f6";
      case "Contacted":
        return "#f59e0b";
      case "Qualified":
        return "#10b981";
      case "Converted":
        return "#65a30d";
      case "Lost":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

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

  // Helper: Accurate Word Count
  const getWordCount = (str) => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  // Strict 15-Word Limit Handler
  const handleNotesChange = (e) => {
    const val = e.target.value;
    const words = val.trim().split(/\s+/).filter(Boolean);
    const MAX_WORDS = 15;

    if (words.length <= MAX_WORDS) {
      setCurrentLead({ ...currentLead, notes: val });
    } else if (words.length > MAX_WORDS) {
      if (val.length - (currentLead.notes || "").length > 1) {
        const truncated = words.slice(0, MAX_WORDS).join(" ");
        setCurrentLead({ ...currentLead, notes: truncated });
        toast.error(`Text truncated to ${MAX_WORDS} words.`);
      }
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (currentLead.budget < 0) return toast.error("Invalid budget value");

    try {
      const res = await API.put(`/leads/${currentLead._id}`, currentLead);
      setLeads(leads.map((l) => (l._id === currentLead._id ? res.data : l)));
      toast.success("Lead Updated Successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/leads/${id}`, { status: newStatus });
      setLeads(
        leads.map((l) => (l._id === id ? { ...l, status: newStatus } : l)),
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this Lead?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await API.delete(`/leads/${id}`);
        setLeads(leads.filter((lead) => lead._id !== id));
        toast.success("Lead removed successfully");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: "Are you absolutely sure?",
      text: "This will delete ALL leads. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete everything!",
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

  /* 3. Search and Filter logic */
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (lead.company &&
        lead.company.toLowerCase().includes(searchText.toLowerCase())) ||
      lead.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const role = (currentUser.role || "agent").toLowerCase();
    const getSafeId = (field) => String(field?._id || field || "").trim();
    const myId = getSafeId(currentUser._id || currentUser.id);

    let matchesRole = false;
    const assignedId = getSafeId(lead.assignedTo);
    const creatorId = getSafeId(lead.createdBy);
    const filterId = getSafeId(viewTargetId);

    if (role === "admin") {
      matchesRole = filterId
        ? assignedId === filterId || creatorId === filterId
        : true;
    } else if (role === "manager") {
      matchesRole = filterId ? assignedId === filterId : true;
    } else {
      matchesRole = assignedId === myId || creatorId === myId;
    }

    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading)
    return <div className={styles.loading}>Loading Dashboard...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Sales Leads</h2>
        <div className={styles.headerActions}>
          {["admin", "manager"].includes(
            JSON.parse(
              localStorage.getItem("user") || "{}",
            ).role?.toLowerCase(),
          ) && (
            <button className={styles.deleteAllBtn} onClick={handleDeleteAll}>
              <Trash2 size={18} /> Delete All
            </button>
          )}
          <button
            className={styles.addBtn}
            onClick={() => navigate("/add-lead")}
          >
            <Plus size={18} /> New Lead
          </button>
        </div>
      </div>

      {["admin", "manager"].includes(
        JSON.parse(localStorage.getItem("user") || "{}").role?.toLowerCase(),
      ) && (
        <AdminViewFilter
          currentViewId={viewTargetId}
          onViewChange={setTarget}
        />
      )}

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className={styles.filterWrapper}>
          <Filter size={18} className={styles.filterIcon} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
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
              <th>Lead Info</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Budget</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyState}>
                  {viewTargetId
                    ? "No leads found for this user context."
                    : "No leads found matching your search."}
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead._id}>
                  <td data-label="LEAD INFO">
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
                  <td data-label="CONTACT">
                    <div className={styles.contactCell}>
                      <a
                        href={`mailto:${lead.email}`}
                        className={styles.contactLink}
                      >
                        <Mail size={14} /> {lead.email}
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className={`${styles.contactLink} ${styles.phoneLink}`}
                      >
                        <Phone size={14} /> {lead.phone}
                      </a>
                    </div>
                  </td>
                  <td data-label="STATUS">
                    <select
                      className={styles.statusSelect}
                      value={lead.status}
                      onChange={(e) =>
                        handleStatusChange(lead._id, e.target.value)
                      }
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
                      <MessageSquare size={14} className={styles.noteIcon} />
                      <span className={styles.noteText}>
                        {lead.notes ? lead.notes : "No notes added"}
                      </span>
                    </div>
                  </td>
                  <td data-label="BUDGET">
                    <div className={styles.budgetCell}>
                      ₹{Number(lead.budget).toLocaleString("en-IN")}
                    </div>
                    <div className={styles.sourceLabel}>{lead.source}</div>
                  </td>
                  <td data-label="ACTIONS">
                    <div className={styles.actions}>
                      {/* ✅ VIEW DETAILS BUTTON */}
                      <button
                        className={styles.viewBtn}
                        onClick={() => handleViewDetails(lead)}
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className={styles.editBtn}
                        onClick={() => openEditModal(lead)}
                        title="Edit Lead"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(lead._id)}
                        title="Delete Lead"
                      >
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
              <button
                className={styles.closeBtn}
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveChanges} className={styles.editForm}>
              <div className={styles.formGrid}>
                {/* Inputs ... */}
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    name="name"
                    value={currentLead.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company Name</label>
                  <input
                    name="company"
                    value={currentLead.company || ""}
                    onChange={handleEditChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input
                    name="email"
                    value={currentLead.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    value={currentLead.phone}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Budget (₹)</label>
                  <input
                    type="number"
                    name="budget"
                    min="0"
                    value={currentLead.budget}
                    onChange={handleEditChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Source</label>
                  <select
                    name="source"
                    value={currentLead.source}
                    onChange={handleEditChange}
                  >
                    <option value="Website">Website</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Ads">Ads</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* NOTES SECTION WITH COUNTER */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <label>Notes</label>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color:
                          getWordCount(currentLead.notes || "") >= 15
                            ? "#ef4444"
                            : "#64748b",
                        background:
                          getWordCount(currentLead.notes || "") >= 15
                            ? "#fef2f2"
                            : "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        border:
                          getWordCount(currentLead.notes || "") >= 15
                            ? "1px solid #fecaca"
                            : "1px solid #e2e8f0",
                      }}
                    >
                      Word Count: {getWordCount(currentLead.notes || "")}/15
                    </span>
                  </div>
                  <textarea
                    name="notes"
                    value={currentLead.notes || ""}
                    onChange={handleNotesChange}
                    rows="3"
                    placeholder="Enter notes (Max 15 words)..."
                    style={{
                      borderColor:
                        getWordCount(currentLead.notes || "") >= 15
                          ? "#ef4444"
                          : "#cbd5e1",
                    }}
                  />
                  {getWordCount(currentLead.notes || "") >= 15 && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#ef4444",
                        marginTop: "4px",
                      }}
                    >
                      Maximum word limit reached.
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <Save size={18} /> Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
