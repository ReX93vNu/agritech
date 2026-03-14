import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, Edit3, Save, X, LogOut, User as UserIcon, Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import Login from './components/Login';

const API_URL = "http://127.0.0.1:8000/api/readings/";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [readings, setReadings] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedReading, setSelectedReading] = useState(null); // For the Detail Modal
  const username = localStorage.getItem('username');

  // Fetch Data with Token
  const fetchReadings = async () => {
    try {
      const res = await axios.get(`${API_URL}?search=${search}`, {
        headers: { Authorization: `Token ${token}` }
      });
      setReadings(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  useEffect(() => {
    if (token) fetchReadings();
  }, [search, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Don't trigger the row click modal
    if (confirm("Delete this record?")) {
      await axios.delete(`${API_URL}${id}/`, { headers: { Authorization: `Token ${token}` }});
      fetchReadings();
    }
  };

  const handleSave = async (e, id) => {
    e.stopPropagation();
    await axios.patch(`${API_URL}${id}/`, editData, { headers: { Authorization: `Token ${token}` }});
    setEditingId(null);
    fetchReadings();
  };

  // Auth Guard
  if (!token) return <Login setToken={setToken} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 1. Navbar */}
      <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <CheckCircle className="text-white" size={20} />
          </div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">FarmShield AI</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative text-slate-400 hover:text-emerald-600 transition-colors">
            <Bell size={22} />
            {readings.filter(r => r.is_abnormal).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
            )}
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">{username}</p>
              <p className="text-xs text-slate-500 mt-1">Authorized Staff</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Crop Monitor</h1>
            <p className="text-slate-500 mt-1">Real-time health status for your connected sensors.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="text" placeholder="Search farm or date..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-64 shadow-sm"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-100">
              <Plus size={20} /> Add Reading
            </button>
          </div>
        </header>

        {/* 2. Summarized Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Farm / Location</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Moisture</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {readings.map((r) => (
                <tr 
                  key={r.id} 
                  onClick={() => setSelectedReading(r)}
                  className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{r.farm_name || `Sensor #${r.sensor}`}</p>
                    <p className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === r.id ? 
                      <input 
                        className="w-20 border rounded px-2 py-1" 
                        defaultValue={r.soil_moisture} 
                        onClick={(e) => e.stopPropagation()}
                        onChange={e => setEditData({...editData, soil_moisture: e.target.value})} 
                      /> 
                      : <span className="text-slate-700 font-medium">{r.soil_moisture}%</span>}
                  </td>
                  <td className="px-6 py-4">
                    {r.is_abnormal ? (
                      <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                        <AlertTriangle size={14} /> Abnormal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                        <CheckCircle size={14} /> Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === r.id ? (
                      <>
                        <button onClick={(e) => handleSave(e, r.id)} className="text-emerald-600 p-2"><Save size={18}/></button>
                        <button onClick={(e) => {e.stopPropagation(); setEditingId(null)}} className="text-slate-400 p-2"><X size={18}/></button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => {e.stopPropagation(); setEditingId(r.id); setEditData(r);}} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit3 size={18}/></button>
                        <button onClick={(e) => handleDelete(e, r.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={18}/></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Detail & Advice Modal */}
      {selectedReading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`p-6 flex justify-between items-center ${selectedReading.is_abnormal ? 'bg-red-500' : 'bg-emerald-600'} text-white`}>
              <div>
                <h2 className="text-xl font-bold">{selectedReading.farm_name}</h2>
                <p className="text-sm opacity-90">Sensor ID: #{selectedReading.sensor}</p>
              </div>
              <button onClick={() => setSelectedReading(null)} className="hover:bg-black/10 p-2 rounded-full"><X /></button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Moisture</p>
                  <p className="text-2xl font-bold text-slate-800">{selectedReading.soil_moisture}%</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Temperature</p>
                  <p className="text-2xl font-bold text-slate-800">{selectedReading.temperature}°C</p>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${selectedReading.is_abnormal ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <h3 className={`text-sm font-bold uppercase mb-2 ${selectedReading.is_abnormal ? 'text-red-700' : 'text-emerald-700'}`}>
                  AI Assessment & Advice
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {selectedReading.advice}
                </p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-end">
              <button onClick={() => setSelectedReading(null)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
