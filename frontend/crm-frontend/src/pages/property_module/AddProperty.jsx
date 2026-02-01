import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios"; 
import { Save, ArrowLeft, UploadCloud, X, Bed, Bath, Maximize, User, Plus, Trash2 } from "lucide-react";
import Swal from 'sweetalert2'; 
import toast from 'react-hot-toast';
import styles from "./AddProperty.module.css"; 

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); 
  const [leads, setLeads] = useState([]);

  // ✅ State initialized with Arrays for dynamic rooms
  const [formData, setFormData] = useState({
    title: "",
    type: "Apartment",
    price: "",
    city: "",    
    address: "", 
    description: "",
    bedrooms: [], // Array of objects { size: "10x10" }
    bathrooms: [], // Array of objects
    area: "",
    status: "Available",
    image: "",
    owner: "" 
  });

  // Fetch Leads for the dropdown
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await API.get("/leads");
        // Ensure we get an array (handle different API response structures)
        setLeads(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };
    fetchLeads();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Basic validation for simple numbers
    if (type === "number" && value < 0) {
      toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)} cannot be negative!`);
      setFormData({ ...formData, [name]: 0 });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Logic to ADD a new room
  const handleAddRoom = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { size: "" }]
    }));
  };

  // ✅ Logic to REMOVE a room
  const handleRemoveRoom = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // ✅ Logic to UPDATE room size
  const handleRoomChange = (field, index, value) => {
    const updatedList = [...formData[field]];
    updatedList[index].size = value;
    setFormData({ ...formData, [field]: updatedList });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: 'File too large', text: 'Max 2MB allowed.' });
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

  // ✅ FIXED SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.price < 0 || formData.area < 0) {
      toast.error("Please enter positive values for Price and Area!");
      return;
    }

    setLoading(true);
    try {
      // 1. Create a copy of the data
      const payload = { ...formData };

      // 🚨 CRITICAL FIX: Handle Empty Owner to prevent 500 Error
      if (!payload.owner || payload.owner === "") {
        delete payload.owner; 
      }

      // 2. Ensure numbers are actual numbers
      payload.price = Number(payload.price);
      payload.area = Number(payload.area);

      // 3. Send Request
      await API.post("/properties", payload);
      
      await Swal.fire({ icon: 'success', title: 'Property Added! 🏠', timer: 2000, showConfirmButton: false });
      navigate("/properties"); 
    } catch (err) {
      console.error("Submit Error:", err);
      Swal.fire({ icon: 'error', title: 'Submission Failed', text: err.response?.data?.message || "Something went wrong!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate("/properties")}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2>Add New Property</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.grid}>
          {/* Title */}
          <div className={styles.formGroup}>
            <label>Property Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Luxury Villa" />
          </div>

          {/* Type */}
          <div className={styles.formGroup}>
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
            </select>
          </div>

          {/* Price */}
          <div className={styles.formGroup}>
            <label>Price (₹)</label>
            <input type="number" name="price" min="0" required value={formData.price} onChange={handleChange} placeholder="5000000" />
          </div>

          {/* City */}
          <div className={styles.formGroup}>
            <label>City</label>
            <input type="text" name="city" required value={formData.city} onChange={handleChange} placeholder="e.g. Ahmedabad" />
          </div>

          {/* ✅ DYNAMIC BEDROOMS */}
          <div className={`${styles.formGroup} ${styles.dynamicGroup}`}>
            <label className={styles.dynamicLabel}>
              <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                <Bed size={16} /> Bedrooms ({formData.bedrooms.length})
              </div>
              <button type="button" onClick={() => handleAddRoom('bedrooms')} className={styles.addMiniBtn}>
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
                    onChange={(e) => handleRoomChange('bedrooms', index, e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => handleRemoveRoom('bedrooms', index)} className={styles.deleteMiniBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {formData.bedrooms.length === 0 && <span className={styles.emptyText}>No bedrooms added.</span>}
            </div>
          </div>

          {/* ✅ DYNAMIC BATHROOMS */}
          <div className={`${styles.formGroup} ${styles.dynamicGroup}`}>
            <label className={styles.dynamicLabel}>
              <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                 <Bath size={16} /> Bathrooms ({formData.bathrooms.length})
              </div>
              <button type="button" onClick={() => handleAddRoom('bathrooms')} className={styles.addMiniBtn}>
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
                    onChange={(e) => handleRoomChange('bathrooms', index, e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => handleRemoveRoom('bathrooms', index)} className={styles.deleteMiniBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
               {formData.bathrooms.length === 0 && <span className={styles.emptyText}>No bathrooms added.</span>}
            </div>
          </div>

          {/* Area */}
          <div className={styles.formGroup}>
            <label><Maximize size={16} /> Area (sqft)</label>
            <input type="number" name="area" min="0" value={formData.area} onChange={handleChange} placeholder="e.g. 1500" />
          </div>

          {/* ✅ Owner Dropdown */}
          <div className={styles.formGroup}>
            <label><User size={16} /> Assign to Lead (Optional)</label>
            <select name="owner" value={formData.owner} onChange={handleChange}>
              <option value="">-- No Owner/Lead --</option>
              {leads.map((l) => (
                <option key={l._id} value={l._id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className={styles.formGroup}>
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
            </select>
          </div>

          {/* Address */}
          <div className={styles.formGroup} style={{gridColumn: "1 / -1"}}>
            <label>Full Address</label>
            <input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="e.g. 101, Galaxy Tower, SG Highway" />
          </div>

          {/* Image */}
          <div className={styles.formGroup} style={{gridColumn: "1 / -1"}}>
            <label>Property Image</label>
            {!preview ? (
              <div className={styles.uploadBox}>
                <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
                <UploadCloud size={32} color="#2563eb"/>
                <span className={styles.uploadText}>Click to Upload Image</span>
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <img src={preview} alt="Preview" className={styles.previewImg} />
                <button type="button" onClick={removeImage} className={styles.removeBtn}><X size={16}/></button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.formGroup} style={{gridColumn: "1 / -1"}}>
            <label>Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Describe the property features..." />
          </div>
        </div>

        <div className={styles.footer}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Saving..." : <><Save size={18} /> Save Property</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;