# 🏢 Mohit Real Estate CRM

A full-stack, comprehensive Customer Relationship Management (CRM) system explicitly designed for real estate businesses. This application streamlines lead management, property listings, task tracking, and team hierarchy, ensuring smooth operations from initial contact to final conversion.

🟢 **Live Demo:** [Mohit Real Estate CRM](https://crm-mohitrealestate.netlify.app)

---

## 🌟 Key Features

* **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins, Managers, and Agents.
* **Lead Management:** Track potential buyers/tenants. Includes strict Indian 10-digit mobile number validation and word-limited note-taking.
* **Property Portfolio:** Manage property listings (Apartments, Houses, Commercial, Land) with Base64 image uploads and secure PDF Brochure uploads (up to 10MB).
* **Task & Follow-up Tracking:** Assign tasks to specific leads, track due dates, and manage daily workflows.
* **Advanced Analytics Dashboard:** Real-time statistics on total leads, pipeline revenue, and conversion rates, dynamically filtered by user hierarchy.
* **Secure Authentication:** JWT-based login with SendGrid OTP verification integration.
* **Optimized UI/UX:** Fully responsive, mobile-first design using CSS Modules, featuring SweetAlert2 popups and Toast notifications.

---

## 🔐 Role-Based Architecture (Hierarchy)

The CRM enforces a strict structural hierarchy to ensure data privacy and operational efficiency:

1.  **👑 Admin:** * Has absolute control over the system.
    * Can view, edit, and delete ALL leads, properties, and tasks.
    * Can manage the entire team (create/remove Managers and Agents).
    * Can view global dashboard statistics.
2.  **👔 Manager:** * Manages a specific team of Agents.
    * Can view and assign leads/properties to themselves or their assigned Agents.
    * Dashboard reflects statistics for their entire team's pipeline.
3.  **🧑‍💼 Agent:** * The ground-level operator.
    * Can only view, edit, and manage leads, properties, and tasks specifically assigned to them.
    * Cannot see data belonging to other agents or managers.

---

## 🛠️ Tech Stack

**Frontend:**
* **Framework:** React.js (Vite)
* **Routing:** React Router DOM
* **Icons:** Lucide React
* **Styling:** Custom CSS Modules (Mobile-First, Dark Mode Ready)
* **Alerts/Notifications:** SweetAlert2, React Hot Toast
* **Deployment:** Netlify

**Backend:**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose
* **File Handling:** Multer (For PDF Brochures)
* **Authentication:** JSON Web Tokens (JWT), Bcrypt.js
* **Email Services:** SendGrid
* **Deployment:** Render

---

## 🚀 Local Setup & Installation

To run this project locally on your machine, follow these steps:

### Prerequisites
* Node.js (v16+)
* MongoDB (Local or Atlas)
* SendGrid API Key (for email services)

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/crm-real-estate.git](https://github.com/yourusername/crm-real-estate.git)
