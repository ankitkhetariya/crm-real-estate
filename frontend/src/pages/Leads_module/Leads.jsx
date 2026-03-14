// Leads.jsx
import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Phone,
  Mail,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  X,
  Save,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import styles from "./Leads.module.css";

import { useAdminView } from "../../hooks/useAdminView";
import AdminViewFilter from "../../components/AdminViewFilter";

const Leads = () => {
  const navigate = useNavigate();
  const { viewTargetId, setTarget } = useAdminView();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI Input States (Won't trigger fetch until applied)
  const [searchInput, setSearchInput] = useState("");
  const [minBudgetInput, setMinBudgetInput] = useState("");
  const [maxBudgetInput, setMaxBudgetInput] = useState("");
  const [statusInput, setStatusInput] = useState("All");

  // Active Filter States (These trigger the fetch)
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    status: "All",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
        search: activeFilters.search || undefined,
        status:
          activeFilters.status !== "All" ? activeFilters.status : undefined,
        assignedTo: viewTargetId || undefined,
        minPrice: activeFilters.minPrice || undefined,
        maxPrice: activeFilters.maxPrice || undefined,
      };

      const res = await API.get("/leads", { params });
      const payload = res.data;

      if (payload && Array.isArray(payload.data)) {
        setLeads(payload.data);
        setTotalPages(payload.totalPages || 1);
      } else if (Array.isArray(payload)) {
        setLeads(payload);
        setTotalPages(1);
      } else {
        setLeads([]);
        setTotalPages(1);
      }
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, activeFilters, viewTargetId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setPage(1);
  }, [activeFilters, viewTargetId]);

  const handleBudgetInput = (e, setter) => {
    const val = e.target.value;
    if (val === "" || Number(val) >= 0) setter(val);
  };

  const handleApplyFilters = () => {
    if (Number(minBudgetInput) < 0 || Number(maxBudgetInput) < 0) {
      toast.error("Budget cannot be negative!");
      return;
    }
    if (
      minBudgetInput &&
      maxBudgetInput &&
      Number(minBudgetInput) > Number(maxBudgetInput)
    ) {
      toast.error("Min budget cannot be greater than Max budget!");
      return;
    }

    setActiveFilters({
      search: searchInput.trim(),
      minPrice: minBudgetInput,
      maxPrice: maxBudgetInput,
      status: statusInput,
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setMinBudgetInput("");
    setMaxBudgetInput("");
    setStatusInput("All");
    setActiveFilters({ search: "", minPrice: "", maxPrice: "", status: "All" });
    setPage(1);
  };

  const handleViewDetails = (lead) => {
    Swal.fire({
      background: "var(--card-bg)",
      color: "var(--text-primary)",
      width: "500px",
      showConfirmButton: false,
      showCloseButton: true,
      html: `
      <div style="text-align:left; font-family: 'Inter', sans-serif;">
        <h2 style="margin: 0 0 10px 0; font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">${lead.name}</h2>
        <div style="margin-bottom: 20px; font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
          🏢 ${lead.company || "Individual Client"}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <div style="background: var(--input-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
             <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Status</div>
             <div style="font-size: 1rem; font-weight: 600; color: ${getStatusColorHex(lead.status)};">${lead.status}</div>
          </div>
          <div style="background: var(--input-bg); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
             <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Budget</div>
             <div style="font-size: 1rem; font-weight: 600; color: #2563eb;">₹${Number(lead.budget).toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--card-border);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Email</div>
          <div style="font-size: 0.95rem; font-weight: 500; color: var(--text-primary); word-break: break-all;">
             <a href="mailto:${lead.email}" style="color: var(--link-color); text-decoration: none;">${lead.email}</a>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Phone</div>
          <div style="font-size: 0.95rem; font-weight: 500; color: var(--text-primary);">
             <a href="tel:${lead.phone}" style="color: var(--text-primary); text-decoration: none;">${lead.phone}</a>
          </div>
        </div>

        ${
          lead.notes
            ? `
        <div style="margin-top: 20px; background: #fff7ed; padding: 12px; border-radius: 8px; border-left: 4px solid #f97316;">
          <div style="font-size: 0.75rem; color: #9a3412; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Notes</div>
          <div style="font-size: 0.9rem; color: #431407; white-space: pre-wrap;">${lead.notes}</div>
        </div>
        `
            : ""
        }
      </div>
      `,
    });
  };

  const getStatusColorHex = (status) => {
    switch (status) {
      case "New":
        return "#3b82f6";
      case "Contacted":
        return "#f59e0b";
      case "Qualified":
        return "#8b5cf6";
      case "Proposal Sent":
        return "#0ea5e9";
      case "Converted":
        return "#16a34a";
      case "Lost":
        return "#dc2626";
      default:
        return "var(--text-primary)";
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
      toast.error("Status Update failed");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Lead?",
      text: "You won't be able to revert this!",
      background: "var(--card-bg)",
      color: "var(--text-primary)",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/leads/${id}`);
        toast.success("Lead Deleted");
        if (leads.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchLeads();
        }
      } catch {
        toast.error("Failed to delete lead");
      }
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

  const getWordCount = (str) => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

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

  if (loading) return <div className={styles.loading}>Loading Leads...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Sales Leads</h2>

        <button className={styles.addBtn} onClick={() => navigate("/add-lead")}>
          <Plus size={18} /> New Lead
        </button>
      </div>

      {["admin", "manager"].includes(
        JSON.parse(localStorage.getItem("user") || "{}").role?.toLowerCase(),
      ) && (
        <div className={styles.adminFilterWrapperOuter}>
          <AdminViewFilter
            currentViewId={viewTargetId}
            onViewChange={setTarget}
          />
        </div>
      )}

      {/* FILTER CARD */}
      <div className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.inputWrapper}>
            <Search size={16} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <IndianRupee size={16} className={styles.inputIcon} />
            <input
              type="number"
              min="0"
              placeholder="Min Budget"
              value={minBudgetInput}
              onChange={(e) => handleBudgetInput(e, setMinBudgetInput)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <IndianRupee size={16} className={styles.inputIcon} />
            <input
              type="number"
              min="0"
              placeholder="Max Budget"
              value={maxBudgetInput}
              onChange={(e) => handleBudgetInput(e, setMaxBudgetInput)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <Filter size={16} className={styles.inputIcon} />
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button className={styles.clearBtn} onClick={handleClearFilters}>
            Clear
          </button>
          <button className={styles.applyBtn} onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>

      <div className={styles.tableCardContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lead Info</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.emptyState}>
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id}>
                  <td data-label="Lead Info">
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

                  <td data-label="Contact">
                    <div className={styles.contactCell}>
                      <a href={`mailto:${lead.email}`}>
                        <Mail size={14} /> {lead.email}
                      </a>

                      <a href={`tel:${lead.phone}`}>
                        <Phone size={14} /> {lead.phone}
                      </a>
                    </div>
                  </td>

                  <td data-label="Status">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleStatusChange(lead._id, e.target.value)
                      }
                      className={styles.statusSelect}
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

                  <td data-label="Budget">
                    <div className={styles.budgetCell}>
                      ₹{Number(lead.budget).toLocaleString("en-IN")}
                    </div>
                  </td>

                  <td data-label="Action">
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleViewDetails(lead)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => openEditModal(lead)}
                        title="Edit Lead"
                      >
                        <Edit size={16} />
                      </button>

                      <button
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

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft size={18} /> Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

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
                            : "var(--text-secondary)",
                        background:
                          getWordCount(currentLead.notes || "") >= 15
                            ? "#fef2f2"
                            : "var(--input-bg)",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        border:
                          getWordCount(currentLead.notes || "") >= 15
                            ? "1px solid #fecaca"
                            : "1px solid var(--input-border)",
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
                    style={{
                      borderColor:
                        getWordCount(currentLead.notes || "") >= 15
                          ? "#ef4444"
                          : "var(--input-border)",
                    }}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
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
