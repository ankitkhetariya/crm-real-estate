import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios"; 
import { Save, ArrowLeft, UploadCloud, X } from "lucide-react";
import Swal from 'sweetalert2'; 
import styles from "./AddProperty.module.css"; 

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); 

  // ✅ State setup (Backend fields ke hisab se)
  const [formData, setFormData] = useState({
    title: "",
    type: "Apartment",
    price: "",
    city: "",    
    address: "", 
    description: "",
    status: "Available",
    image: "" // Base64 string yahan store hogi
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Image Handling Logic
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 2MB Size Limit Check
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
    setLoading(true);

    // 🔴 FIX: Yahan galti thi. Hum 'images' array bhej rahe the.
    // ✅ FIX: Ab hum direct 'image' string bhej rahe hain taaki database aur frontend match karein.
    const payload = {
      ...formData,
      image: formData.image // Direct String (No Array)
    };

    try {
      await API.post("/properties", payload);
      
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
        text: err.response?.data?.message || "City and Address are required!"
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
            <input type="number" name="price" required value={formData.price} onChange={handleChange} placeholder="5000000" />
          </div>

          <div className={styles.formGroup}>
            <label>City</label>
            <input 
              type="text" name="city" required 
              value={formData.city} onChange={handleChange} 
              placeholder="e.g. Ahmedabad" 
            />
          </div>

          <div className={styles.formGroup} style={{gridColumn: "1 / -1"}}>
            <label>Full Address</label>
            <input 
              type="text" name="address" required 
              value={formData.address} onChange={handleChange} 
              placeholder="e.g. 101, Galaxy Tower, SG Highway" 
            />
          </div>

          {/* Image Upload Section */}
          <div className={styles.formGroup} style={{gridColumn: "1 / -1"}}>
            <label>Property Image</label>
            {!preview ? (
              <div style={{border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "20px", textAlign: "center", cursor: "pointer", position: "relative", background: "#f8fafc"}}>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer"}} />
                <UploadCloud size={32} color="#2563eb"/>
                <span style={{display:"block", fontSize:"14px", marginTop:"5px"}}>Click to Upload</span>
              </div>
            ) : (
              <div style={{position: "relative", height: "200px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0"}}>
                <img src={preview} alt="Preview" style={{width: "100%", height: "100%", objectFit: "cover"}} />
                <button type="button" onClick={removeImage} style={{position: "absolute", top: "10px", right: "10px", background: "red", color: "white", border: "none", borderRadius: "50%", padding: "5px", cursor: "pointer"}}><X size={16}/></button>
              </div>
            )}
          </div>

          <div className={styles.formGroup} style={{gridColumn: "1 / -1"}}>
            <label>Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} />
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