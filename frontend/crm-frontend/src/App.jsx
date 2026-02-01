import { Routes, Route, Navigate, Outlet } from "react-router-dom"; 
import { Toaster } from 'react-hot-toast'; 

// --- 1. AUTH PAGES ---
import Login from "./pages/Login_module/Login"; 
import Register from "./pages/Register_module/Register";
import ForgotPassword from "./pages/ForgotPassword_module/ForgotPassword";
import ResetPassword from "./pages/ResetPassword_module/ResetPassword"; 

// --- 2. DASHBOARDS ---
import Dashboard from "./pages/Dashboard_module/Dashboard"; 
import AdminDashboard from "./pages/AdminDashboard_module/AdminDashboard"; 

// ✅ FIX 1: Import Path Sahi Kiya (Module Folder ke andar)
import ManagerDashboard from "./pages/ManagerDashboard_module/ManagerDashboard"; 

// --- 3. MODULES ---
import Leads from "./pages/Leads_module/Leads"; 
import AddLead from "./pages/Leads_module/AddLead"; 
import Properties from "./pages/property_module/Properties"; 
import AddProperty from "./pages/property_module/AddProperty"; 
import Tasks from "./pages/Task_module/Tasks";
import AddTask from "./pages/Task_module/AddTask";
import Settings from "./pages/Settings_module/Settings"; 
import Support from "./pages/Support_module/Support";

// --- 4. COMPONENTS ---
import RoleRoute from "./components/RoleRoute"; 
import Layout from "./components/Layout_module/Layout"; 

// ✅ FIX 2: Layout Wrapper Component
// Ye component "Double Layout" problem solve karega taaki design na fate
const AppLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* ======================================================= */}
        {/* ✅ SECURE ROUTES (Sabhi Layout ke andar rahenge)        */}
        {/* ======================================================= */}
        
        <Route element={<AppLayout />}>

            {/* 1. ADMIN ONLY */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
               <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>

            {/* 2. MANAGER & ADMIN */}
            <Route element={<RoleRoute allowedRoles={['manager', 'admin']} />}>
               <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            </Route>

            {/* 3. COMMON ROUTES (Agents, Managers, Admins) */}
            <Route element={<RoleRoute allowedRoles={['agent', 'manager', 'admin']} />}>
              
              <Route path="/dashboard" element={<Dashboard />} /> 
              
              <Route path="/leads" element={<Leads />} />
              <Route path="/add-lead" element={<AddLead />} />

              <Route path="/properties" element={<Properties />} />
              <Route path="/add-property" element={<AddProperty />} />

              <Route path="/tasks" element={<Tasks />} />
              <Route path="/add-task" element={<AddTask />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />

            </Route>

        </Route> {/* End of AppLayout */}

      </Routes>
    </>
  );
}

export default App;