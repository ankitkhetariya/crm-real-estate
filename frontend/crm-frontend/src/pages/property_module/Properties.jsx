import { useEffect, useState } from "react";
import API from "../../api/axios";
import { Plus, Search, Filter, Trash2, Edit, MapPin, X, Save, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import styles from "./Properties.module.css"; 

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: Loading state for Edit Save Button
  const [saveLoading, setSaveLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProp, setCurrentProp] = useState(null);

  const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  const fetchProperties = async () => {
    try {
      const res = await API.get("/properties");
      setProperties(res.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDeleteAll = async () => {
    if (properties.length === 0) return;
    const result = await Swal.fire({
      title: 'Delete All?',
      text: "This will remove ALL properties!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, clear all!'
    });

    if (result.isConfirmed) {
      try {
        await API.delete("/properties/delete-all");
        setProperties([]);
        Swal.fire('Deleted!', 'All data cleared.', 'success');
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/properties/${id}`);
        setProperties(properties.filter(p => p._id !== id));
        Swal.fire('Deleted!', 'Property removed.', 'success');
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  // --- EDIT LOGIC START ---

  const openEditModal = (prop) => {
    setCurrentProp(prop);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setCurrentProp({ ...currentProp, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: 'File too large', text: 'Max 2MB allowed.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProp({ ...currentProp, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditImage = () => {
    setCurrentProp({ ...currentProp, image: "" });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaveLoading(true); // ✅ Start Loading

    try {
      await API.put(`/properties/${currentProp._id}`, currentProp);
      
      setProperties(properties.map(p => p._id === currentProp._id ? currentProp : p));
      
      toast.success("Updated Successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Update Failed");
    } finally {
      setSaveLoading(false); // ✅ Stop Loading
    }
  };

  // --- EDIT LOGIC END ---

  const handleStatusChange = async (id, newStatus) => {
    const updatedList = properties.map(p => p._id === id ? { ...p, status: newStatus } : p);
    setProperties(updatedList);
    try {
      await API.put(`/properties/${id}`, { status: newStatus });
      toast.success("Status Updated");
    } catch(err) {
      toast.error("Update failed");
      fetchProperties();
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchText.toLowerCase()) || 
      p.location?.toLowerCase().includes(searchText.toLowerCase()) || 
      p.city?.toLowerCase().includes(searchText.toLowerCase()); 
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
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search properties..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className={styles.selectWrapper}>
            <Filter size={16} style={{marginRight: "8px", color:"#64748b"}} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
            </select>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {filteredProperties.length === 0 ? (
            <div className={styles.emptyState}>No properties found.</div>
        ) : (
            filteredProperties.map((prop) => (
                <div key={prop._id} className={styles.card}>
                    <div className={styles.imageWrapper}>
                        <img 
                            src={prop.image || PLACEHOLDER_IMG} 
                            alt={prop.title} 
                            className={styles.cardImage}
                            onError={(e) => {e.target.src = PLACEHOLDER_IMG}} 
                        />
                        <span className={styles.typeBadge}>{prop.type}</span>
                    </div>

                    <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.title}>{prop.title}</h3>
                            <span className={styles.price}>₹{prop.price?.toLocaleString()}</span>
                        </div>
                        
                        <div className={styles.location}>
                            <MapPin size={14} /> {prop.city}
                        </div>

                        {/* ✅ NEW: Description shown in card */}
                        <p className={styles.cardDescription}>
                            {prop.description ? 
                                (prop.description.length > 60 ? prop.description.slice(0, 60) + "..." : prop.description) 
                                : "No description available."
                            }
                        </p>

                        <div className={styles.statusWrapper}>
                            <select 
                                value={prop.status}
                                onChange={(e) => handleStatusChange(prop._id, e.target.value)}
                                style={{
                                    backgroundColor: prop.status === 'Available' ? '#dcfce7' : 
                                                     prop.status === 'Sold' ? '#fee2e2' : '#f1f5f9',
                                    color: prop.status === 'Available' ? '#166534' : 
                                           prop.status === 'Sold' ? '#991b1b' : '#475569'
                                }}
                            >
                                <option value="Available">Available</option>
                                <option value="Sold">Sold</option>
                                <option value="Rented">Rented</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.cardFooter}>
                        <button className={styles.iconBtn} onClick={() => openEditModal(prop)} title="Edit">
                            <Edit size={16} />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.deleteIconBtn}`} onClick={() => handleDelete(prop._id)} title="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && currentProp && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Edit Property</h3>
                    <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSaveChanges}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Title</label>
                            <input name="title" value={currentProp.title} onChange={handleEditChange} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>City</label>
                            <input name="city" value={currentProp.city} onChange={handleEditChange} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Price (₹)</label>
                            <input type="number" name="price" value={currentProp.price} onChange={handleEditChange} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Type</label>
                            <select name="type" value={currentProp.type} onChange={handleEditChange} className={styles.input}>
                                <option value="Apartment">Apartment</option>
                                <option value="House">House</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Land">Land</option>
                            </select>
                        </div>

                        {/* Upload Image in Edit */}
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Property Image</label>
                            
                            {!currentProp.image ? (
                                <div className={styles.uploadBox}>
                                    <input type="file" accept="image/*" onChange={handleEditImageChange} className={styles.fileInput} />
                                    <div className={styles.uploadContent}>
                                        <UploadCloud size={32} color="#2563eb"/>
                                        <span style={{fontSize:"14px", fontWeight:"500"}}>Click to Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.imagePreview}>
                                    <img src={currentProp.image} alt="Preview" className={styles.previewImg} />
                                    <button type="button" onClick={removeEditImage} className={styles.removeImgBtn} title="Remove Image">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.label}>Description</label>
                            <textarea name="description" value={currentProp.description || ""} onChange={handleEditChange} className={styles.input} rows="3" />
                        </div>
                    </div>
                    
                    {/* ✅ Save Button shows Loading... */}
                    <button type="submit" className={styles.saveBtn} disabled={saveLoading}>
                        {saveLoading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Properties;