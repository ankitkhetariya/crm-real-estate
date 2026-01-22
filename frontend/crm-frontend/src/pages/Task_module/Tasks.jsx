import { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, CheckCircle, Clock, Calendar } from "lucide-react";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2'; // ✅ SweetAlert2 Import
import styles from "./Tasks.module.css"; // ✅ CSS Module Import

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ SweetAlert2 for Delete Confirmation
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/tasks/${id}`);
        Swal.fire('Deleted!', 'Your task has been deleted.', 'success');
        fetchTasks();
      } catch (err) {
        toast.error("Failed to delete task");
      }
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await API.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTasks();
      toast.success(newStatus === "completed" ? "Task Completed! 🎉" : "Task Re-opened");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h2><Calendar color="#2563eb" /> Task Manager</h2>
        <button onClick={() => navigate("/add-task")} className={styles.addBtn}>
          <Plus size={18} /> Add Task
        </button>
      </div>

      {/* Task List */}
      <div className={styles.taskList}>
        {tasks.length === 0 ? (
            <div className={styles.emptyState}>
                <h3>No tasks found! 🚀</h3>
                <p>Start your day by adding a new follow-up.</p>
            </div>
        ) : 
          tasks.map((task) => (
            <div key={task._id} className={`${styles.taskCard} ${task.status === "completed" ? styles.completed : ""}`}>
              
              {/* Task Info */}
              <div className={styles.taskInfo}>
                <h3 style={{ textDecoration: task.status === "completed" ? "line-through" : "none" }}>
                    {task.title}
                </h3>
                
                <div className={styles.metaTags}>
                    <span><Clock size={14} style={{ verticalAlign: "middle" }}/> {new Date(task.dueDate).toLocaleString()}</span>
                    
                    {task.relatedLead && (
                        <span className={`${styles.tag} ${styles.leadTag}`}>
                            👤 {task.relatedLead.name}
                        </span>
                    )}
                    
                    <span className={`${styles.tag} ${
                        task.priority === 'high' ? styles.priorityHigh : 
                        task.priority === 'medium' ? styles.priorityMedium : styles.priorityLow
                    }`}>
                        {task.priority.toUpperCase()}
                    </span>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button 
                    onClick={() => toggleStatus(task)} 
                    className={styles.iconBtn}
                    title={task.status === "completed" ? "Mark Pending" : "Mark Done"}
                >
                    <CheckCircle size={24} color={task.status === "completed" ? "#16a34a" : "#cbd5e1"} />
                </button>
                <button 
                    onClick={() => handleDelete(task._id)} 
                    className={styles.iconBtn}
                    title="Delete Task"
                >
                    <Trash2 size={24} color="#ef4444" />
                </button>
              </div>

            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Tasks;