import React, { useState, useEffect } from 'react';
import { TaskItem } from '../types';
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, Search, RefreshCw } from 'lucide-react';

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // New Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status: 'todo',
          priority,
          assignedTo: assignedTo || 'Unassigned',
          dueDate: dueDate || new Date().toISOString().split('T')[0]
        })
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks([newTask, ...tasks]);
        setTitle('');
        setDescription('');
        setAssignedTo('');
        setDueDate('');
      } else {
        alert("Failed to create task");
      }
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(tasks.map(t => (t._id === id || t.id === id) ? updated : t));
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t._id !== id && t.id !== id));
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">MongoDB Task & Project Manager</h2>
          <p className="text-xs text-stone-500 mt-1">Full-stack CRUD operations backed by Express.js API and MongoDB database.</p>
        </div>
        <button
          onClick={fetchTasks}
          className="flex items-center space-x-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Create Task Form */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">Create New Task (MongoDB Document)</h3>
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth token verification"
              required
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of requirements"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Assignee</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Name"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving to MongoDB...' : 'Save Task to Database'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['all', 'todo', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-stone-400 text-xs">Loading tasks from Express API...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">No tasks match your filter.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredTasks.map((task) => {
              const taskId = task._id || task.id || '';
              return (
                <div key={taskId} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-stone-900">{task.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === 'urgent' ? 'bg-red-50 text-red-600 border border-red-200' :
                        task.priority === 'high' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">{task.description || 'No description provided.'}</p>
                    <div className="flex items-center space-x-4 text-[11px] text-stone-400 pt-1">
                      <span>Assigned to: <strong className="text-stone-700">{task.assignedTo}</strong></span>
                      <span>Due: <strong className="text-stone-700">{task.dueDate}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
                    <select
                      value={task.status}
                      onChange={(e: any) => handleUpdateStatus(taskId, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200 focus:outline-none capitalize ${
                        task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        task.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      onClick={() => handleDeleteTask(taskId)}
                      title="Delete Task"
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
