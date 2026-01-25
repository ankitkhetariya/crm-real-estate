import { useEffect, useState } from "react";
import API from "../../api/axios"; 
import { Plus, Search, Filter, Trash2, Edit, MapPin, X, Save, UploadCloud, Bed, Bath, Maximize, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2'; 
import styles from "./Properties.module.css"; 

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]); // ✅ Added to fetch leads
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProp, setCurrentProp] = useState(null);

  const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  // ✅ Fetching Properties and Leads
  const fetchData = async () => {
    try {
      const [propRes, leadRes] = await Promise.all([
        API.get("/properties"),
        API.get("/leads")
      ]);
      setProperties(propRes.data);
      setLeads(leadRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteAll = async () => {
    if (properties.length === 0) return;
    const result = await Swal.fire({
      title: 'Delete All?',
      text: "This will remove ALL your properties permanently!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, clear all!'
    });

    if (result.isConfirmed) {
      try {
        await API.delete("/properties/delete-all");
        setProperties([]);
        toast.success("All properties cleared");
      } catch (err) {
        toast.error("Failed to delete all");
      }
    }
  };

  const openEditModal = (prop) => {
    // Ensuring owner field is handled
    setCurrentProp({ ...prop, owner: prop.owner?._id || prop.owner || "" });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" && value < 0) {
      toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)} cannot be negative!`);
      setCurrentProp({ ...currentProp, [name]: 0 });
      return;
    }
    setCurrentProp({ ...currentProp, [name]: value });
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
      const res = await API.put(`/properties/${currentProp._id}`, currentProp);
      // Refresh properties after edit to see updated owner
      setProperties(properties.map(p => p._id === currentProp._id ? res.data : p));
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
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete'
    });
    if (result.isConfirmed) {
      try {
        await API.delete(`/properties/${id}`);
        setProperties(properties.filter(p => p._id !== id));
        toast.success("Deleted successfully");
      } catch (err) { toast.error("Failed to delete"); }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/properties/${id}`, { status: newStatus });
      setProperties(properties.map(p => p._id === id ? { ...p, status: newStatus } : p));
      toast.success("Status Updated");
    } catch(err) { toast.error("Status Update failed"); }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchText.toLowerCase()) || p.city?.toLowerCase().includes(searchText.toLowerCase()); 
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className={styles.loading}>Loading Properties...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Properties</h2>
        <div className={styles.headerActions}>
            {properties.length > 0 && (
                <button onClick={handleDeleteAll} className={styles.deleteBtn}>
                    <Trash2 size={18} /> Delete All
                </button>
            )}
            <button className={styles.addBtn} onClick={() => navigate("/add-property")}>
              <Plus size={18} /> Add Property
            </button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input type="text" placeholder="Search title or city..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className={styles.searchInput} />
        </div>
        <div className={styles.filterWrapper}>
            <Filter size={18} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
            </select>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {filteredProperties.map((prop) => (
          <div key={prop._id} className={styles.card}>
            <div className={styles.imageWrapper}>
                <img src={prop.image || PLACEHOLDER_IMG} alt={prop.title} className={styles.cardImage} />
                <span className={styles.typeBadge}>{prop.type}</span>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.title}>{prop.title}</h3>
                    <span className={styles.price}>₹{Number(prop.price).toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.location}><MapPin size={14} /> {prop.city}</div>
                <div className={styles.propertySpecs}>
                    <div className={styles.specItem}><Bed size={16}/> <span>{prop.bedrooms || 0} BHK</span></div>
                    <div className={styles.specItem}><Bath size={16}/> <span>{prop.bathrooms || 0} Bath</span></div>
                    <div className={styles.specItem}><Maximize size={16}/> <span>{prop.area || 0} sqft</span></div>
                </div>
                <div className={styles.statusWrapper}>
                    <select value={prop.status} onChange={(e) => handleStatusChange(prop._id, e.target.value)} className={styles.statusSelect} data-status={prop.status}>
                        <option value="Available">Available</option>
                        <option value="Sold">Sold</option>
                        <option value="Rented">Rented</option>
                    </select>
                </div>
            </div>
            <div className={styles.cardFooter}>
                <button className={styles.iconBtn} onClick={() => openEditModal(prop)}><Edit size={16} /></button>
                <button className={`${styles.iconBtn} ${styles.deleteIconBtn}`} onClick={() => handleDelete(prop._id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && currentProp && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Edit Property Details</h3>
                    <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
                </div>
                <form onSubmit={handleSaveChanges} className={styles.editForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}><label>Title</label><input name="title" value={currentProp.title} onChange={handleEditChange} required /></div>
                        <div className={styles.formGroup}><label>City</label><input name="city" value={currentProp.city} onChange={handleEditChange} required /></div>
                        <div className={styles.formGroup}><label>Price (₹)</label><input type="number" name="price" value={currentProp.price} onChange={handleEditChange} required /></div>
                        
                        {/* ✅ Link to Lead/Owner Dropdown for 0..1 Validation */}
                        <div className={styles.formGroup}>
                            <label><User size={16} /> Assign to Lead (Owner)</label>
                            <select name="owner" value={currentProp.owner} onChange={handleEditChange}>
                                <option value="">-- No Owner/Lead --</option>
                                {leads.map((l) => (
                                    <option key={l._id} value={l._id}>{l.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Type</label>
                            <select name="type" value={currentProp.type} onChange={handleEditChange}>
                                <option value="Apartment">Apartment</option><option value="House">House</option><option value="Commercial">Commercial</option><option value="Land">Land</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}><label>Bedrooms</label><input type="number" name="bedrooms" value={currentProp.bedrooms || ""} onChange={handleEditChange} /></div>
                        <div className={styles.formGroup}><label>Bathrooms</label><input type="number" name="bathrooms" value={currentProp.bathrooms || ""} onChange={handleEditChange} /></div>
                        <div className={styles.formGroup}><label>Area (sqft)</label><input type="number" name="area" value={currentProp.area || ""} onChange={handleEditChange} /></div>
                        <div className={styles.formGroup}>
                            <label>Status</label>
                            <select name="status" value={currentProp.status} onChange={handleEditChange}>
                                <option value="Available">Available</option><option value="Sold">Sold</option><option value="Rented">Rented</option>
                            </select>
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label>Update Photo</label>
                            <div className={styles.imageUpdateSection}>
                              {currentProp.image && (
                                <div className={styles.previewContainer}>
                                  <img src={currentProp.image} alt="Preview" />
                                  <button type="button" onClick={() => setCurrentProp({...currentProp, image: ""})}><X size={12}/></button>
                                </div>
                              )}
                              <div className={styles.uploadTrigger}>
                                <UploadCloud size={20} />
                                <span>Change Image</span>
                                <input type="file" accept="image/*" onChange={handleEditImageChange} />
                              </div>
                            </div>
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}><label>Description</label><textarea name="description" value={currentProp.description || ""} onChange={handleEditChange} rows="3" /></div>
                    </div>
                    <div className={styles.modalActions}>
                      <button type="button" className={styles.cancelBtn} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                      <button type="submit" className={styles.saveBtn} disabled={saveLoading}>{saveLoading ? "Saving..." : "Update Property"}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Properties;