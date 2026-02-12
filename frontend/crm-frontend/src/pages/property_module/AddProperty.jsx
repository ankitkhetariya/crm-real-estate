import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios";
import {
  Save,
  ArrowLeft,
  UploadCloud,
  X,
  Bed,
  Bath,
  Maximize,
  User,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import styles from "./AddProperty.module.css";

// 1. Import Global Hook
import { useAdminView } from "../../hooks/useAdminView";

const AddProperty = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 2. Get Global Filter ID
  const { viewTargetId } = useAdminView();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [leads, setLeads] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);

  // 3. State Initialization
  const [formData, setFormData] = useState(() => ({
    title: "",
    type: "Apartment",
    price: "",
    city: "",
    address: "",
    description: "",
    bedrooms: [],
    bathrooms: [],
    area: "",
    status: "Available",
    image: "",
    owner: "",
    assignedTo: viewTargetId || "", // Auto-fill if filter active
  }));

  // 4. Fetch Leads & Assignable Users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, adminRes] = await Promise.all([
          API.get("/leads"),
          user?.role === "admin" || user?.role === "manager"
            ? API.get("/admin/master-dashboard")
            : Promise.resolve({ data: {} }),
        ]);

        // Set Leads
        setLeads(
          Array.isArray(leadsRes.data)
            ? leadsRes.data
            : leadsRes.data.data || [],
        );

        // Set Assignable Users
        if (user?.role === "admin") {
          setAssignableUsers([
            ...(adminRes.data.managersList || []),
            ...(adminRes.data.agentsList || []),
          ]);
        } else if (user?.role === "manager") {
          const myAgents = (adminRes.data.agentsList || []).filter((a) => {
            const mgrId = a.managedBy?._id || a.managedBy;
            return String(mgrId) === String(user.id || user._id);
          });
          setAssignableUsers(myAgents);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Validation
    if (type === "number" && value < 0) {
      toast.error(
        `${name.charAt(0).toUpperCase() + name.slice(1)} cannot be negative!`,
      );
      setFormData((prev) => ({ ...prev, [name]: 0 }));
      return;
    }

    // FIX: If changing assigned Agent, RESET the Owner selection
    if (name === "assignedTo") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        owner: "", // Reset owner because the list of available leads will change
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  //  LOGIC: Filter Leads based on who is assigned this property
  const getSafeId = (field) => {
    if (!field) return "";
    return typeof field === "object" ? field._id : field;
  };

  // 1. Determine who "owns" this property currently (Selected Agent OR Logged-in User)
  const currentPropertyOwnerId = formData.assignedTo
    ? formData.assignedTo
    : user?.id || user?._id;

  // 2. Filter the leads list to show ONLY leads belonging to that person
  const filteredLeads = leads.filter((lead) => {
    const leadOwnerId = getSafeId(lead.assignedTo);
    return String(leadOwnerId) === String(currentPropertyOwnerId);
  });

  // Logic to ADD a new room
  const handleAddRoom = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { size: "" }],
    }));
  };

  // Logic to REMOVE a room
  const handleRemoveRoom = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Logic to UPDATE room size
  const handleRoomChange = (field, index, value) => {
    const updatedList = [...formData[field]];
    updatedList[index].size = value;
    setFormData({ ...formData, [field]: updatedList });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File too large",
          text: "Max 2MB allowed.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setFormData({ ...formData, image: "" });
  };

  // 5. Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.price < 0 || formData.area < 0) {
      toast.error("Please enter positive values for Price and Area!");
      return;
    }

    setLoading(true);

    const currentUserId = user?.id || user?._id;
    const finalAssignee = formData.assignedTo
      ? formData.assignedTo
      : currentUserId;

    try {
      const payload = { ...formData, assignedTo: finalAssignee };

      if (!payload.owner || payload.owner === "") {
        delete payload.owner;
      }

      payload.price = Number(payload.price);
      payload.area = Number(payload.area);

      await API.post("/properties", payload);

      let successMsg = "Property Added! 🏠";
      if (finalAssignee !== currentUserId) {
        const assigneeName =
          assignableUsers.find((u) => u._id === finalAssignee)?.name || "Agent";
        successMsg = `Property assigned to ${assigneeName}! 🏠`;
      }

      await Swal.fire({
        icon: "success",
        title: successMsg,
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/properties");
    } catch (err) {
      console.error("Submit Error:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/properties")}
        >
          <ArrowLeft size={20} /> Back
        </button>
        <h2>Add New Property</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.grid}>
          {/* Assignment Dropdown (Admin/Manager) */}
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
                <Users size={16} /> Assign Property To:
              </label>
              <div style={{ marginTop: "8px" }}>
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
            <label>Property Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Luxury Villa"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Price (₹)</label>
            <input
              type="number"
              name="price"
              min="0"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="5000000"
            />
          </div>

          <div className={styles.formGroup}>
            <label>City</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Ahmedabad"
            />
          </div>

          {/* DYNAMIC BEDROOMS */}
          <div className={`${styles.formGroup} ${styles.dynamicGroup}`}>
            <label className={styles.dynamicLabel}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Bed size={16} /> Bedrooms ({formData.bedrooms.length})
              </div>
              <button
                type="button"
                onClick={() => handleAddRoom("bedrooms")}
                className={styles.addMiniBtn}
              >
                <Plus size={14} /> Add
              </button>
            </label>
            <div className={styles.roomList}>
              {formData.bedrooms.map((room, index) => (
                <div key={index} className={styles.roomRow}>
                  <input
                    type="text"
                    placeholder={`Size (e.g. 12x14)`}
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
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {formData.bedrooms.length === 0 && (
                <span className={styles.emptyText}>No bedrooms added.</span>
              )}
            </div>
          </div>

          {/* DYNAMIC BATHROOMS */}
          <div className={`${styles.formGroup} ${styles.dynamicGroup}`}>
            <label className={styles.dynamicLabel}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Bath size={16} /> Bathrooms ({formData.bathrooms.length})
              </div>
              <button
                type="button"
                onClick={() => handleAddRoom("bathrooms")}
                className={styles.addMiniBtn}
              >
                <Plus size={14} /> Add
              </button>
            </label>
            <div className={styles.roomList}>
              {formData.bathrooms.map((room, index) => (
                <div key={index} className={styles.roomRow}>
                  <input
                    type="text"
                    placeholder={`Size (e.g. 8x6)`}
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
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {formData.bathrooms.length === 0 && (
                <span className={styles.emptyText}>No bathrooms added.</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <Maximize size={16} /> Area (sqft)
            </label>
            <input
              type="number"
              name="area"
              min="0"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. 1500"
            />
          </div>

          {/*  FILTERED Owner Dropdown */}
          <div className={styles.formGroup}>
            <label>
              <User size={16} /> Assign to Lead (Optional)
            </label>
            <select name="owner" value={formData.owner} onChange={handleChange}>
              <option value="">-- No Owner/Lead --</option>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No leads found for selected user
                </option>
              )}
            </select>
            {formData.assignedTo && filteredLeads.length === 0 && (
              <p style={{ fontSize: "10px", color: "red", marginTop: "4px" }}>
                * This user has no leads yet.
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
            </select>
          </div>

          <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
            <label>Full Address</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 101, Galaxy Tower, SG Highway"
            />
          </div>

          <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
            <label>Property Image</label>
            {!preview ? (
              <div className={styles.uploadBox}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
                <UploadCloud size={32} color="#2563eb" />
                <span className={styles.uploadText}>Click to Upload Image</span>
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <img
                  src={preview}
                  alt="Preview"
                  className={styles.previewImg}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className={styles.removeBtn}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the property features..."
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} /> Save Property
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
