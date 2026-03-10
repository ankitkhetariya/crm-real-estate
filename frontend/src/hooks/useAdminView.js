import { useState, useEffect } from "react";

export const useAdminView = () => {
  // 1. Load the saved filter from LocalStorage (Memory)
  const [viewTargetId, setViewTargetId] = useState(() => {
    return localStorage.getItem("admin_view_target_id") || "";
  });

  // 2. Save filter when changed
  const setTarget = (id) => {
    if (id) {
      localStorage.setItem("admin_view_target_id", id);
    } else {
      localStorage.removeItem("admin_view_target_id");
    }
    setViewTargetId(id);
  };

  // 3. THE FIX: Safe Comparison Function
  // We use this everywhere instead of "==="
  const isMatch = (docUserId, docOwnerId) => {
    // If Admin hasn't selected anyone, show everything
    if (!viewTargetId) return true;

    // Normalize everything to Strings safely
    const target = String(viewTargetId);

    // Check Creator (handle if populated object or raw ID)
    const creator = String(docUserId?._id || docUserId || "");

    // Check Owner
    const owner = String(docOwnerId?._id || docOwnerId || "");

    return creator === target || owner === target;
  };

  return { viewTargetId, setTarget, isMatch };
};
