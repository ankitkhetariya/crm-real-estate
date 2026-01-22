import React from "react";
import { HelpCircle } from "lucide-react"; // Code icon ki ab zaroorat nahi hai agar initial dikhana hai
import styles from "./Support.module.css";

const Support = () => {
  
  const developers = [
    {
      id: 1,
      name: "Mohit Khetariya",
      role: "Lead Developer",
      email: "ankitkhetariya@gmail.com",
      initial: "M"
    },
    {
      id: 2,
      name: "Harsh Rakholiya",
      role: "Tester & Developer",
      email: "rakholiyaharsh186@gmail.com", 
      initial: "H"
    },
    {
      id: 3,
      name: "Bhautik Rafaliya",
      role: "Technical Support",
      email: "bhautikrafaliya30@gmail.com",
      initial: "B"
    }
  ];

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h2>
            <HelpCircle size={32} style={{verticalAlign:"middle", marginRight:"10px", color:"#2563eb"}}/> 
            Contact for Support
        </h2>
        <p>Directly contact the developers for any technical issues.</p>
      </div>

      <div className={styles.grid}>
        {developers.map((dev) => (
          <div key={dev.id} className={styles.card}>
            
            {/* ✅ CHANGE HERE: Ab sabka Initial dikhega */}
            <div className={styles.avatar}>
                <span style={{fontSize: "28px"}}>{dev.initial}</span>
            </div>

            <h3 className={styles.name}>{dev.name}</h3>
            <p className={styles.role}>{dev.role}</p>
            
            <a 
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${dev.email}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.emailLink}
              title="Click to open Gmail"
            >
              {dev.email}
            </a>
          </div>
        ))}
      </div>

      <div className={styles.note}>
        <strong>Note:</strong> We usually respond within 24 hours.
      </div>

    </div>
  );
};

export default Support;