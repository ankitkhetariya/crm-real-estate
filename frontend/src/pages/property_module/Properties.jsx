import { useEffect, useState, useCallback } from "react";
import API, { API_BASE_URL } from "../../api/axios";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  MapPin,
  X,
  UploadCloud,
  Bed,
  Bath,
  Maximize,
  User,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import styles from "./Properties.module.css";

import { useAdminView } from "../../hooks/useAdminView";
import AdminViewFilter from "../../components/AdminViewFilter";

const Properties = () => {
  const navigate = useNavigate();
  const { viewTargetId, setTarget } = useAdminView();

  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [brochureUploading, setBrochureUploading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [statusInput, setStatusInput] = useState("All");

  const [activeFilters, setActiveFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    status: "All",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProp, setCurrentProp] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const PLACEHOLDER_IMG =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  const getBrochureUrl = (brochurePath) =>
    brochurePath ? `${API_BASE_URL}${brochurePath}` : null;

  const fetchData = useCallback(async () => {
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

      const [propRes, leadRes] = await Promise.all([
        API.get("/properties", { params }),
        API.get("/leads"),
      ]);

      const paginated = propRes.data;
      setProperties(Array.isArray(paginated.data) ? paginated.data : []);
      setTotal(paginated.total ?? 0);
      setTotalPages(paginated.totalPages ?? 1);
      setPage(paginated.page ?? 1);
      setLeads(
        Array.isArray(leadRes.data) ? leadRes.data : (leadRes.data?.data ?? []),
      );
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [page, activeFilters, viewTargetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [viewTargetId]);

  const handleApplyFilters = () => {
    if (Number(minPriceInput) < 0 || Number(maxPriceInput) < 0) {
      toast.error("Budget cannot be negative!");
      return;
    }
    if (
      minPriceInput &&
      maxPriceInput &&
      Number(minPriceInput) > Number(maxPriceInput)
    ) {
      toast.error("Min budget cannot be greater than Max budget!");
      return;
    }
    setActiveFilters({
      search: searchInput.trim(),
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      status: statusInput,
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setStatusInput("All");
    setActiveFilters({ search: "", minPrice: "", maxPrice: "", status: "All" });
    setPage(1);
  };

  const handleBudgetInput = (e, setter) => {
    const val = e.target.value;
    if (val === "" || Number(val) >= 0) setter(val);
  };

  const handleDeleteAll = async () => {
    if (properties.length === 0) return;
    const result = await Swal.fire({
      title: "Delete All?",
      text: "This will remove ALL properties permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, clear all!",
    });
    if (result.isConfirmed) {
      try {
        await API.delete("/properties/delete-all");
        toast.success("All properties cleared");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete all");
      }
    }
  };

  const handleViewDetails = (prop) => {
    const bedroomsList =
      prop.bedrooms && prop.bedrooms.length > 0
        ? prop.bedrooms
            .map(
              (b, i) =>
                `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #e2e8f0;"><span style="color:#64748b; font-size: 0.9rem;">Bedroom ${i + 1}</span><span style="font-weight:600; color:#0f172a; font-size: 0.9rem;">${b.size}</span></div>`,
            )
            .join("")
        : '<div style="color:#94a3b8; font-style:italic; font-size: 0.9rem;">No details added</div>';

    const bathroomsList =
      prop.bathrooms && prop.bathrooms.length > 0
        ? prop.bathrooms
            .map(
              (b, i) =>
                `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #e2e8f0;"><span style="color:#64748b; font-size: 0.9rem;">Bathroom ${i + 1}</span><span style="font-weight:600; color:#0f172a; font-size: 0.9rem;">${b.size}</span></div>`,
            )
            .join("")
        : '<div style="color:#94a3b8; font-style:italic; font-size: 0.9rem;">No details added</div>';

    const ownerName = prop.owner ? prop.owner.name || "Unknown" : "Unassigned";

    Swal.fire({
      title: null,
      html: `
        <div style="text-align: left; font-family: 'Inter', sans-serif; color: #334155;">
          <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 15px;">
            <h2 style="margin: 0; font-size: 1.5rem; color: #0f172a; font-weight: 800;">${prop.title}</h2>
            <div style="margin-top: 5px; color: #2563eb; font-weight: 700; font-size: 1.2rem;">₹${Number(prop.price).toLocaleString("en-IN")}</div>
            <div style="font-size: 0.9rem; color: #64748b; margin-top: 4px; display:flex; align-items:center; gap:4px;">📍 ${prop.address ? prop.address + ", " : ""}${prop.city}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background:#f8fafc; padding:10px; border-radius:8px;"><div style="color:#64748b; text-transform:uppercase; font-size:0.7rem; font-weight:700;">Type</div><div style="font-weight:600; color:#0f172a;">${prop.type}</div></div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px;"><div style="color:#64748b; text-transform:uppercase; font-size:0.7rem; font-weight:700;">Area</div><div style="font-weight:600; color:#0f172a;">${prop.area || 0} sqft</div></div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px;"><div style="color:#64748b; text-transform:uppercase; font-size:0.7rem; font-weight:700;">Status</div><div style="color:${prop.status === "Available" ? "#166534" : "#991b1b"}; font-weight:600;">${prop.status}</div></div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px;"><div style="color:#64748b; text-transform:uppercase; font-size:0.7rem; font-weight:700;">Owner</div><div style="font-weight:600; color:#0f172a;">${ownerName}</div></div>
          </div>
          <div style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div><strong style="color: #0f172a; display: block; margin-bottom: 10px; font-size: 0.95rem; border-bottom:2px solid #e2e8f0; padding-bottom:4px;">Bedrooms</strong>${bedroomsList}</div>
              <div><strong style="color: #0f172a; display: block; margin-bottom: 10px; font-size: 0.95rem; border-bottom:2px solid #e2e8f0; padding-bottom:4px;">Bathrooms</strong>${bathroomsList}</div>
            </div>
          </div>
          ${prop.description ? `<div style="background:#f1f5f9; padding:12px; border-radius:8px;"><div style="color:#64748b; text-transform:uppercase; font-size:0.7rem; font-weight:700; margin-bottom:4px;">Description</div><p style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: #475569; word-wrap: break-word;">${prop.description}</p></div>` : ""}
          ${prop.brochureUrl ? `<p style="margin-top:16px;"><a href="${getBrochureUrl(prop.brochureUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:600;">View Brochure</a></p>` : ""}
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: "550px",
      padding: "24px",
      customClass: { popup: "animated-popup" },
    });
  };

  const openEditModal = (prop) => {
    setCurrentProp({
      ...prop,
      owner: prop.owner?._id || prop.owner || "",
      bedrooms: Array.isArray(prop.bedrooms) ? prop.bedrooms : [],
      bathrooms: Array.isArray(prop.bathrooms) ? prop.bathrooms : [],
      brochureUrl: prop.brochureUrl || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" && value < 0) {
      toast.error(
        `${name.charAt(0).toUpperCase() + name.slice(1)} cannot be negative!`,
      );
      setCurrentProp({ ...currentProp, [name]: 0 });
      return;
    }
    setCurrentProp({ ...currentProp, [name]: value });
  };

  const handleRoomChange = (field, index, value) => {
    const updatedList = [...currentProp[field]];
    updatedList[index].size = value;
    setCurrentProp({ ...currentProp, [field]: updatedList });
  };

  const handleAddRoom = (field) => {
    setCurrentProp((prev) => ({
      ...prev,
      [field]: [...prev[field], { size: "" }],
    }));
  };

  const handleRemoveRoom = (field, index) => {
    setCurrentProp((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProp({ ...currentProp, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const payload = { ...currentProp };
      if (payload.owner === "") payload.owner = null;
      const res = await API.put(`/properties/${currentProp._id}`, payload);
      setProperties(
        properties.map((p) => (p._id === currentProp._id ? res.data : p)),
      );
      toast.success("Updated Successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Update Failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });
    if (result.isConfirmed) {
      try {
        await API.delete(`/properties/${id}`);
        toast.success("Deleted successfully");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/properties/${id}`, { status: newStatus });
      setProperties(
        properties.map((p) => (p._id === id ? { ...p, status: newStatus } : p)),
      );
      toast.success("Status Updated");
    } catch (err) {
      toast.error("Status Update failed");
    }
  };

  const handleBrochureUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file || !currentProp?._id) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed for brochures.");
      return;
    }
    setBrochureUploading(true);
    try {
      const formData = new FormData();
      formData.append("brochure", file);
      const res = await API.post(
        `/properties/${currentProp._id}/brochure`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setCurrentProp((prev) =>
        prev ? { ...prev, brochureUrl: res.data.brochureUrl } : null,
      );
      setProperties(
        properties.map((p) =>
          p._id === currentProp._id
            ? { ...p, brochureUrl: res.data.brochureUrl }
            : p,
        ),
      );
      toast.success("Brochure uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Brochure upload failed");
    } finally {
      setBrochureUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveBrochure = async () => {
    if (!currentProp?._id || !currentProp.brochureUrl) return;
    setBrochureUploading(true);
    try {
      const res = await API.delete(`/properties/${currentProp._id}/brochure`);
      setCurrentProp((prev) => (prev ? { ...prev, brochureUrl: "" } : null));
      setProperties(
        properties.map((p) =>
          p._id === currentProp._id ? { ...p, brochureUrl: "" } : p,
        ),
      );
      toast.success("Brochure removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove brochure");
    } finally {
      setBrochureUploading(false);
    }
  };

  if (loading)
    return <div className={styles.loading}>Loading Properties...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Properties</h2>
        <div className={styles.headerActions}>
          {JSON.parse(localStorage.getItem("user") || "{}").role === "admin" &&
            total > 0 && (
              <button onClick={handleDeleteAll} className={styles.deleteBtn}>
                <Trash2 size={18} /> Delete All
              </button>
            )}
          <button
            className={styles.addBtn}
            onClick={() => navigate("/add-property")}
          >
            <Plus size={18} /> Add Property
          </button>
        </div>
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

      {/* ADVANCED FILTER BAR */}
      <div className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.inputWrapper}>
            <Search size={16} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Search title, city..."
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
              value={minPriceInput}
              onChange={(e) => handleBudgetInput(e, setMinPriceInput)}
            />
          </div>
          <div className={styles.inputWrapper}>
            <IndianRupee size={16} className={styles.inputIcon} />
            <input
              type="number"
              min="0"
              placeholder="Max Budget"
              value={maxPriceInput}
              onChange={(e) => handleBudgetInput(e, setMaxPriceInput)}
            />
          </div>
          <div className={styles.inputWrapper}>
            <Filter size={16} className={styles.inputIcon} />
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
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

      <div className={styles.gridContainer}>
        {properties.length === 0 ? (
          <div
            className={styles.noData}
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "40px",
              color: "var(--text-muted)",
            }}
          >
            <p>No properties found.</p>
            {viewTargetId && (
              <span style={{ fontSize: "12px", color: "#ef4444" }}>
                No properties found for this user context.
              </span>
            )}
          </div>
        ) : (
          properties.map((prop) => (
            <div key={prop._id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img
                  src={prop.image || PLACEHOLDER_IMG}
                  alt={prop.title}
                  className={styles.cardImage}
                />
                <span className={styles.typeBadge}>{prop.type}</span>
                {prop.brochureUrl && (
                  <span
                    className={styles.pdfBadge}
                    title="PDF brochure attached"
                  >
                    <FileText size={12} /> PDF
                  </span>
                )}
                {["admin", "manager"].includes(
                  JSON.parse(
                    localStorage.getItem("user") || "{}",
                  ).role?.toLowerCase(),
                ) &&
                  prop.assignedTo && (
                    <span
                      className={styles.agentBadge}
                      style={{
                        position: "absolute",
                        bottom: "5px",
                        right: "5px",
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <User size={10} />{" "}
                      {prop.assignedTo.name ||
                        prop.assignedTo.username ||
                        "Agent"}
                    </span>
                  )}
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.title}>{prop.title}</h3>
                  <span className={styles.price}>
                    ₹{Number(prop.price).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className={styles.location}>
                  <MapPin size={14} /> {prop.city}
                </div>
                <div className={styles.propertySpecs}>
                  <div className={styles.specItem}>
                    <Bed size={16} />{" "}
                    <span>{prop.bedrooms?.length || 0} Beds</span>
                  </div>
                  <div className={styles.specItem}>
                    <Bath size={16} />{" "}
                    <span>{prop.bathrooms?.length || 0} Bath</span>
                  </div>
                  <div className={styles.specItem}>
                    <Maximize size={16} /> <span>{prop.area || 0} sqft</span>
                  </div>
                </div>
                <div className={styles.statusWrapper}>
                  <select
                    value={prop.status}
                    onChange={(e) =>
                      handleStatusChange(prop._id, e.target.value)
                    }
                    className={styles.statusSelect}
                    data-status={prop.status}
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>
              </div>
              <div className={styles.cardFooter}>
                {getBrochureUrl(prop.brochureUrl) && (
                  <a
                    href={getBrochureUrl(prop.brochureUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.iconBtn} ${styles.brochureIconBtn}`}
                    title="View Brochure"
                  >
                    <FileText size={16} />
                  </a>
                )}
                <button
                  className={`${styles.iconBtn} ${styles.viewIconBtn}`}
                  onClick={() => handleViewDetails(prop)}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={() => openEditModal(prop)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                  onClick={() => handleDelete(prop._id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.paginationBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft size={18} /> Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {page} of {totalPages} ({total} total)
          </span>
          <button
            type="button"
            className={styles.paginationBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && currentProp && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Property Details</h3>
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
                  <label>Title</label>
                  <input
                    name="title"
                    value={currentProp.title}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    name="city"
                    value={currentProp.city}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={currentProp.price}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <User
                      size={16}
                      style={{ marginRight: "4px", verticalAlign: "middle" }}
                    />{" "}
                    Assign to Lead (Owner)
                  </label>
                  <select
                    name="owner"
                    value={currentProp.owner}
                    onChange={handleEditChange}
                  >
                    <option value="">-- No Owner/Lead --</option>
                    {leads.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select
                    name="type"
                    value={currentProp.type}
                    onChange={handleEditChange}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Area (sqft)</label>
                  <input
                    type="number"
                    name="area"
                    value={currentProp.area || ""}
                    onChange={handleEditChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.dynamicLabel}>
                    <label>Bedrooms ({currentProp.bedrooms.length})</label>
                    <button
                      type="button"
                      onClick={() => handleAddRoom("bedrooms")}
                      className={styles.addMiniBtn}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className={styles.roomList}>
                    {currentProp.bedrooms.map((room, index) => (
                      <div key={index} className={styles.roomRow}>
                        <input
                          type="text"
                          placeholder="Size"
                          value={room.size}
                          onChange={(e) =>
                            handleRoomChange("bedrooms", index, e.target.value)
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRoom("bedrooms", index)}
                          className={styles.deleteMiniBtn}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.dynamicLabel}>
                    <label>Bathrooms ({currentProp.bathrooms.length})</label>
                    <button
                      type="button"
                      onClick={() => handleAddRoom("bathrooms")}
                      className={styles.addMiniBtn}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className={styles.roomList}>
                    {currentProp.bathrooms.map((room, index) => (
                      <div key={index} className={styles.roomRow}>
                        <input
                          type="text"
                          placeholder="Size"
                          value={room.size}
                          onChange={(e) =>
                            handleRoomChange("bathrooms", index, e.target.value)
                          }
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveRoom("bathrooms", index)}
                          className={styles.deleteMiniBtn}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    name="status"
                    value={currentProp.status}
                    onChange={handleEditChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Update Photo</label>
                  <div className={styles.imageUpdateSection}>
                    {currentProp.image && (
                      <div className={styles.previewContainer}>
                        <img src={currentProp.image} alt="Preview" />
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentProp({ ...currentProp, image: "" })
                          }
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <label className={styles.imageActionBtn}>
                      <UploadCloud size={16} />
                      <span>
                        {currentProp.image ? "Change Image" : "Upload Image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>
                    <FileText
                      size={16}
                      style={{ marginRight: "4px", verticalAlign: "middle" }}
                    />{" "}
                    PDF Brochure
                  </label>
                  <div className={styles.brochureSection}>
                    {currentProp.brochureUrl ? (
                      <>
                        <a
                          href={getBrochureUrl(currentProp.brochureUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.brochureLink}
                        >
                          View current brochure
                        </a>
                        <button
                          type="button"
                          onClick={handleRemoveBrochure}
                          disabled={brochureUploading}
                          className={styles.removeBrochureBtn}
                          title="Remove brochure"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </>
                    ) : (
                      <span className={styles.brochureNone}>
                        No brochure uploaded
                      </span>
                    )}
                    <label className={styles.brochureUploadBtn}>
                      <UploadCloud size={16} />
                      <span>
                        {brochureUploading
                          ? "Uploading..."
                          : "Upload or replace PDF"}
                      </span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleBrochureUpload}
                        disabled={brochureUploading}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={currentProp.description || ""}
                    onChange={handleEditChange}
                    rows="4"
                    style={{
                      resize: "vertical",
                      width: "100%",
                      boxSizing: "border-box",
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
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={saveLoading}
                >
                  {saveLoading ? "Saving..." : "Update Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Properties;
