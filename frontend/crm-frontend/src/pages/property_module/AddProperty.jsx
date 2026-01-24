import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios"; 
import { Save, ArrowLeft, UploadCloud, X, Bed, Bath, Maximize } from "lucide-react";
import Swal from 'sweetalert2'; 
import toast from 'react-hot-toast';
import styles from "./AddProperty.module.css"; 

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); 

  // ✅ Updated State: Added bedrooms, bathrooms, and area
  const [formData, setFormData] = useState({
    title: "",
    type: "Apartment",
    price: "",
    city: "",    
    address: "", 
    description: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    status: "Available",
    image: "" 
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // ✅ Validation Logic: Negative values ko allow nahi karega
    if (type === "number" && value < 0) {
      toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)} cannot be negative!`);
      setFormData({ ...formData, [name]: 0 });
      return;
    }

    setFormData({ ...formData, [name]: value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Final Validation Check before API call
    if (formData.price < 0 || formData.bedrooms < 0 || formData.bathrooms < 0 || formData.area < 0) {
      toast.error("Please enter positive values only!");
      return;
    }

    setLoading(true);

    try {
      await API.post("/properties", formData);
      
      await Swal.fire({
        icon: 'success',
        title: 'Property Added! 🏠',
        timer: 2000,
        showConfirmButton: false
      });

      navigate("/properties"); 
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.message || "Something went wrong!"
      });
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
          
          <div className={styles.formGroup}>
            <label>Property Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Luxury Villa" />
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
            <input type="number" name="price" min="0" required value={formData.price} onChange={handleChange} placeholder="5000000" />
          </div>

          <div className={styles.formGroup}>
            <label>City</label>
            <input type="text" name="city" required value={formData.city} onChange={handleChange} placeholder="e.g. Ahmedabad" />
          </div>

          {/* ✅ NEW: Bedrooms, Bathrooms, Area Fields */}
          <div className={styles.formGroup}>
            <label><Bed size={16} /> Bedrooms</label>
            <input type="number" name="bedrooms" min="0" value={formData.bedrooms} onChange={handleChange} placeholder="e.g. 3" />
          </div>

          <div className={styles.formGroup}>
            <label><Bath size={16} /> Bathrooms</label>
            <input type="number" name="bathrooms" min="0" value={formData.bathrooms} onChange={handleChange} placeholder="e.g. 2" />
          </div>

          <div className={styles.formGroup}>
            <label><Maximize size={16} /> Area (sqft)</label>
            <input type="number" name="area" min="0" value={formData.area} onChange={handleChange} placeholder="e.g. 1500" />
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
            </select>
          </div>

          <div className={styles.formGroup} style={{gridColumn: "1 / -1"}}>
            <label>Full Address</label>
            <input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="e.g. 101, Galaxy Tower, SG Highway" />
          </div>

          {/* Image Upload Section */}
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