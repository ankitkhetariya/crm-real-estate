import { Routes, Route, Navigate } from "react-router-dom"; 
import { Toaster } from 'react-hot-toast'; 

// Pages
import Login from "./pages/Login_module/Login"; 
import Register from "./pages/Register_module/Register";
import ForgotPassword from "./pages/ForgotPassword_module/ForgotPassword";
import ResetPassword from "./pages/ResetPassword_module/ResetPassword"; 
import Dashboard from "./pages/Dashboard_module/Dashboard"; 
import Leads from "./pages/Leads_module/Leads"; 
import AddLead from "./pages/Leads_module/AddLead"; 
import Properties from "./pages/property_module/Properties"; 
import AddProperty from "./pages/property_module/AddProperty"; 
import Tasks from "./pages/Task_module/Tasks";
import AddTask from "./pages/Task_module/AddTask";
import Settings from "./pages/Settings_module/Settings"; 

// ✅ Support Page Import (Isse add kiya hai)
import Support from "./pages/Support_module/Support";

// Components
import PrivateRoute from "./components/PrivateRoute"; 
import Layout from "./components/Layout_module/Layout"; 

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes with Sidebar Layout */}
        <Route element={<PrivateRoute />}>
          
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />

          {/* Leads Module Routes */}
          <Route path="/leads" element={<Layout><Leads /></Layout>} />
          <Route path="/add-lead" element={<Layout><AddLead /></Layout>} />

          {/* Property Module Routes */}
          <Route path="/properties" element={<Layout><Properties /></Layout>} />
          <Route path="/add-property" element={<Layout><AddProperty /></Layout>} />

          {/* Task Module Routes */}
          <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
          <Route path="/add-task" element={<Layout><AddTask /></Layout>} />

          {/* Settings Module Route */}
          <Route path="/settings" element={<Layout><Settings /></Layout>} />

          {/* ✅ Support Route Added Here */}
          <Route path="/support" element={<Layout><Support /></Layout>} />

        </Route>

      </Routes>
    </>
  );
}

export default App;