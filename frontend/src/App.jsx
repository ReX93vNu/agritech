import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, Edit3, Save, X, LogOut, User as UserIcon, Bell, AlertTriangle, CheckCircle, Droplets, Thermometer, Wind, Leaf } from 'lucide-react';
import Login from './components/Login';

const API_URL = "http://127.0.0.1:8000/api/readings/";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [readings, setReadings] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedReading, setSelectedReading] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const username = localStorage.getItem('username');

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
    e.stopPropagation();
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

  if (!token) return <Login setToken={setToken} />;

  const abnormalReadings = readings.filter(r => r.is_abnormal);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg">
            <CheckCircle className="text-white" size={20} />
          </div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">FarmShield AI</span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Alerts Notification Button */}
          <div className="relative">
            <button 
              onClick={() => setShowAlerts(!showAlerts)}
              className={`p-2 rounded-full transition-all ${showAlerts ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:text-emerald-600'}`}
            >
              <Bell size={22} />
              {abnormalReadings.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {showAlerts && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-20">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-700">Recent Alerts</span>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{abnormalReadings.length}</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {abnormalReadings.length > 0 ? abnormalReadings.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => {setSelectedReading(r); setShowAlerts(false);}}
                      className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors"
                    >
                      <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1">
                        <AlertTriangle size={12}/> Abnormal Record
                      </p>
                      <p className="text-sm font-medium text-slate-800">{r.farm_name}</p>
                      <p className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleString()}</p>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-slate-400 text-sm">No abnormal records found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none capitalize">{username}</p>
              <p className="text-xs text-slate-500 mt-1">Authorized Staff</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Crop Health Monitor</h1>
            <p className="text-slate-500 mt-1">Detailed sensor data for your assigned plantations.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="text" placeholder="Search records..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-64 shadow-sm transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all">
              <Plus size={20} /> Add Reading
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">Farm / Node</th>
                <th className="px-4 py-4">Moisture</th>
                <th className="px-4 py-4">pH</th>
                <th className="px-4 py-4">Temp</th>
                <th className="px-4 py-4">Humidity</th>
                <th className="px-4 py-4">Leaf Wet</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                    <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{new Date(r.timestamp).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{r.soil_moisture}%</td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{r.ph}</td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{r.temperature}°</td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{r.humidity}%</td>
                  <td className="px-4 py-4 text-slate-600 font-medium">{r.leaf_wetness}</td>
                  <td className="px-6 py-4">
                    {r.is_abnormal ? (
                      <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-red-50 text-red-700 rounded-full text-[10px] font-bold border border-red-100">
                        <AlertTriangle size={12} /> Abnormal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100">
                        <CheckCircle size={12} /> Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => {e.stopPropagation(); setEditingId(r.id); setEditData(r);}} className="text-slate-400 hover:text-blue-500 p-2 transition-colors"><Edit3 size={16}/></button>
                    <button onClick={(e) => handleDelete(e, r.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & AI Advice */}
      {selectedReading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden">
            <div className={`p-8 flex justify-between items-center ${selectedReading.is_abnormal ? 'bg-red-500' : 'bg-emerald-600'} text-white`}>
              <div>
                <h2 className="text-2xl font-bold">{selectedReading.farm_name}</h2>
                <p className="text-sm opacity-80 font-medium">Recorded on {new Date(selectedReading.timestamp).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedReading(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <MetricCard icon={<Droplets size={16}/>} label="Moisture" value={`${selectedReading.soil_moisture}%`} />
                <MetricCard icon={<Thermometer size={16}/>} label="Temp" value={`${selectedReading.temperature}°C`} />
                <MetricCard icon={<Wind size={16}/>} label="Humidity" value={`${selectedReading.humidity}%`} />
                <MetricCard icon={<Leaf size={16}/>} label="Leaf Wet" value={selectedReading.leaf_wetness} />
                <MetricCard icon={<CheckCircle size={16}/>} label="pH Level" value={selectedReading.ph} />
                <MetricCard icon={<UserIcon size={16}/>} label="Node ID" value={`#${selectedReading.sensor}`} />
              </div>

              <div className={`p-6 rounded-2xl border ${selectedReading.is_abnormal ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${selectedReading.is_abnormal ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    <AlertTriangle size={16} />
                  </div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${selectedReading.is_abnormal ? 'text-red-700' : 'text-emerald-700'}`}>
                    AI Assessment & Guidance
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm font-medium">
                  {selectedReading.advice}
                </p>
              </div>
            </div>
            <div className="px-8 pb-8 flex justify-end">
              <button onClick={() => setSelectedReading(null)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper for the Modal Metrics
const MetricCard = ({ icon, label, value }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-2 text-slate-400 mb-1">
      {icon}
      <p className="text-[10px] uppercase font-bold tracking-tight">{label}</p>
    </div>
    <p className="text-lg font-bold text-slate-800">{value}</p>
  </div>
);

export default App;
