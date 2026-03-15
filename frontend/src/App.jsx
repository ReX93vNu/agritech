import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, Edit3, Save, X, LogOut, User as UserIcon, Bell, AlertTriangle, CheckCircle, Droplets, Thermometer, Wind, Leaf, MapPin, Tablet } from 'lucide-react';
import Login from './components/Login';

const BASE_URL = "http://127.0.0.1:8000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('readings'); 
  const [readings, setReadings] = useState([]);
  const [farms, setFarms] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedReading, setSelectedReading] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showModal, setShowModal] = useState(null); 
  const [formData, setFormData] = useState({});
  const username = localStorage.getItem('username');

  const headers = { Authorization: `Token ${token}` };

  const fetchData = async () => {
    try {
      const [r, f, n] = await Promise.all([
        axios.get(`${BASE_URL}/readings/?search=${search}`, { headers }),
        axios.get(`${BASE_URL}/farms/?search=${search}`, { headers }),
        axios.get(`${BASE_URL}/sensors/?search=${search}`, { headers })
      ]);
      setReadings(r.data);
      setFarms(f.data);
      setNodes(n.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [search, token, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
  };

  const handleAction = async (method, type, id = '', payload = {}) => {
    const endpoint = type === 'reading' ? 'readings' : type === 'farm' ? 'farms' : 'sensors';
    try {
      await axios({
        method,
        url: `${BASE_URL}/${endpoint}/${id}${id ? '/' : ''}`,
        data: payload,
        headers
      });
      setEditingId(null);
      setShowModal(null);
      setFormData({});
      fetchData();
    } catch (err) {
      alert(`Error performing ${method} on ${type}`);
    }
  };

  if (!token) return <Login setToken={setToken} />;

  const abnormalReadings = readings.filter(r => r.is_abnormal);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 1. Navbar */}
      <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white"><CheckCircle size={20} /></div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">FarmShield AI</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['readings', 'farms', 'nodes'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => {setActiveTab(tab); setSearch("");}} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative">
            <button onClick={() => setShowAlerts(!showAlerts)} className={`p-2 rounded-full transition-all ${showAlerts ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:text-emerald-600'}`}>
              <Bell size={22} />
              {abnormalReadings.length > 0 && <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>}
            </button>
            {showAlerts && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-20">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-700">Recent Alerts</span>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{abnormalReadings.length}</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {abnormalReadings.map(r => (
                    <div key={r.id} onClick={() => {setSelectedReading(r); setShowAlerts(false);}} className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors">
                      <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Abnormal</p>
                      <p className="text-sm font-medium text-slate-800">{r.farm_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 capitalize">{username}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Authorized</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><LogOut size={20} /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 capitalize">{activeTab}</h1>
            <p className="text-slate-500 mt-1">Management and monitoring for your connected agricultural assets.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="text" value={search} placeholder={`Search ${activeTab}...`} className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-64 shadow-sm" onChange={(e) => setSearch(e.target.value)} />
            </div>
            {activeTab !== 'readings' && (
              <button 
                onClick={() => {setEditingId(null); setEditData({}); setShowModal(activeTab === 'farms' ? 'farm' : 'node');}} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all"
              >
                <Plus size={20} /> Add {activeTab === 'farms' ? 'Farm' : 'Node'}
              </button>
            )}
          </div>
        </header>

        {/* 2. Main Tables */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              {activeTab === 'readings' ? (
                <tr>
                  <th className="px-6 py-4">Farm / Node</th>
                  <th className="px-4 py-4">Moist</th><th className="px-4 py-4">pH</th><th className="px-4 py-4">Temp</th><th className="px-4 py-4">Humid</th><th className="px-4 py-4">Leaf</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              ) : activeTab === 'farms' ? (
                <tr><th className="px-6 py-4">Farm Name</th><th className="px-6 py-4">Location</th><th className="px-6 py-4 text-right">Actions</th></tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Node ID</th>
                  <th className="px-6 py-4">Farm</th> {/* New Column Header */}
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Battery</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeTab === 'readings' && readings.map((r) => (
                <tr key={r.id} onClick={() => setSelectedReading(r)} className="hover:bg-slate-50/50 cursor-pointer group transition-colors">
                  <td className="px-6 py-4 font-bold">{r.farm_name} <span className="block text-[10px] text-slate-400 uppercase">Node #{r.sensor}</span></td>
                  <td className="px-4 py-4 font-medium">{r.soil_moisture}%</td><td className="px-4 py-4">{r.ph}</td><td className="px-4 py-4">{r.temperature}°</td><td className="px-4 py-4">{r.humidity}%</td><td className="px-4 py-4">{r.leaf_wetness}</td>
                  <td className="px-4 py-4">{r.is_abnormal ? <span className="text-red-600 text-xs font-bold">Abnormal</span> : <span className="text-emerald-600 text-xs font-bold">Normal</span>}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => {e.stopPropagation(); if(confirm("Delete reading?")) handleAction('delete', 'reading', r.id)}} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'farms' && farms.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-6 py-4 font-bold">{f.name}</td>
                  <td className="px-6 py-4 text-slate-500"><MapPin size={14} className="inline mr-1"/> {f.location}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => {e.stopPropagation(); setEditData(f); setEditingId(f.id); setShowModal('farm');}} className="text-slate-300 hover:text-blue-500 p-2"><Edit3 size={16}/></button>
                    <button onClick={(e) => {e.stopPropagation(); if(confirm("Delete farm?")) handleAction('delete', 'farm', f.id)}} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'nodes' && nodes.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="px-6 py-4 font-bold">Node #{n.id}</td>
                  {/* New Farm Column Data */}
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {n.farm_name || `Farm #${n.farm}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${n.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-4 border-2 rounded-sm relative p-0.5 ${n.battery_lvl < 20 ? 'border-red-500' : 'border-slate-400'}`}>
                        <div className={`h-full transition-all ${n.battery_lvl < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${n.battery_lvl}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${n.battery_lvl < 20 ? 'text-red-500' : 'text-slate-500'}`}>{n.battery_lvl}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => {setEditData(n); setEditingId(n.id); setShowModal('node');}} className="text-slate-300 hover:text-blue-500 p-2"><Edit3 size={16}/></button>
                    <button onClick={() => {if(confirm("Delete node?")) handleAction('delete', 'node', n.id)}} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={(e) => {e.preventDefault(); handleAction(editingId ? 'patch' : 'post', showModal, editingId || '', formData)}} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 capitalize">{editingId ? 'Edit' : 'Add'} {showModal}</h2>
            <div className="space-y-4">
              {showModal === 'farm' ? (
                <>
                  <input type="text" placeholder="Farm Name" defaultValue={editData.name} className="w-full p-3 bg-slate-50 rounded-xl outline-none" onChange={e => setFormData({...formData, name: e.target.value})}/>
                  <input type="text" placeholder="Location" defaultValue={editData.location} className="w-full p-3 bg-slate-50 rounded-xl outline-none" onChange={e => setFormData({...formData, location: e.target.value})}/>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Assigned Farm</label>
                    <select className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={formData.farm || editData.farm || ""} onChange={e => setFormData({...formData, farm: e.target.value})}>
                      <option value="">Select Farm</option>
                      {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Node Status</label>
                    <select 
                      className="w-full p-3 bg-slate-50 rounded-xl outline-none" 
                      value={formData.status || editData.status || "Active"} 
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <input type="number" step="0.001" placeholder="Latitude" defaultValue={editData.latitude} className="w-full p-3 bg-slate-50 rounded-xl outline-none" onChange={e => setFormData({...formData, latitude: e.target.value})}/>
                  <input type="number" step="0.001" placeholder="Longitude" defaultValue={editData.longitude} className="w-full p-3 bg-slate-50 rounded-xl outline-none" onChange={e => setFormData({...formData, longitude: e.target.value})}/>
                </>
              )}
            </div>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => {setShowModal(null); setEditingId(null); setEditData({}); setFormData({});}} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg">Save</button>
            </div>
          </form>
        </div>
      )}

      {selectedReading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden">
            <div className={`p-8 flex justify-between items-center ${selectedReading.is_abnormal ? 'bg-red-500' : 'bg-emerald-600'} text-white`}>
              <div><h2 className="text-2xl font-bold">{selectedReading.farm_name}</h2><p className="text-sm opacity-80 uppercase font-bold tracking-widest mt-1">Node #{selectedReading.sensor}</p></div>
              <button onClick={() => setSelectedReading(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <MetricCard icon={<Droplets size={16}/>} label="Moisture" value={`${selectedReading.soil_moisture}%`} />
                <MetricCard icon={<Thermometer size={16}/>} label="Temp" value={`${selectedReading.temperature}°C`} />
                <MetricCard icon={<Wind size={16}/>} label="Humidity" value={`${selectedReading.humidity}%`} />
              </div>
              <div className={`p-6 rounded-2xl border ${selectedReading.is_abnormal ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <h3 className={`text-xs font-bold uppercase mb-2 ${selectedReading.is_abnormal ? 'text-red-700' : 'text-emerald-700'}`}>AI Guidance</h3>
                <p className="text-slate-700 leading-relaxed text-sm font-medium">{selectedReading.advice}</p>
              </div>
            </div>
            <div className="px-8 pb-8 flex justify-end"><button onClick={() => setSelectedReading(null)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

const MetricCard = ({ icon, label, value }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-2 text-slate-400 mb-1">{icon}<p className="text-[10px] uppercase font-bold">{label}</p></div>
    <p className="text-lg font-bold text-slate-800">{value}</p>
  </div>
);

export default App;