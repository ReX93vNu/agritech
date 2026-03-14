import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, Edit3, Save, X } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000/api/readings/";

function App() {
  const [readings, setReadings] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Fetch Data (Read)
  const fetchReadings = async () => {
    const res = await axios.get(`${API_URL}?search=${search}`);
    setReadings(res.data);
  };

  useEffect(() => { fetchReadings(); }, [search]);

  // Delete Record (Delete)
  const handleDelete = async (id) => {
    if (confirm("Delete this record?")) {
      await axios.delete(`${API_URL}${id}/`);
      fetchReadings();
    }
  };

  // Update Record (Update/Patch)
  const handleSave = async (id) => {
    await axios.patch(`${API_URL}${id}/`, editData);
    setEditingId(null);
    fetchReadings();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">AgriTech Dashboard</h1>
            <p className="text-slate-500">FarmShield AI Monitoring System</p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all w-64 shadow-sm"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-emerald-200">
              <Plus size={20} /> Add New
            </button>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Sensor ID</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Moisture</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Temp</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Humidity</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {readings.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">#{r.sensor}</td>
                  <td className="px-6 py-4">
                    {editingId === r.id ? 
                      <input className="w-20 border rounded px-2 py-1" defaultValue={r.soil_moisture} onChange={e => setEditData({...editData, soil_moisture: e.target.value})} /> 
                      : `${r.soil_moisture}%`}
                  </td>
                  <td className="px-6 py-4">{r.temperature}°C</td>
                  <td className="px-6 py-4">{r.humidity}%</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    {editingId === r.id ? (
                      <>
                        <button onClick={() => handleSave(r.id)} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg"><Save size={18}/></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-50 p-2 rounded-lg"><X size={18}/></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => {setEditingId(r.id); setEditData(r);}} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit3 size={18}/></button>
                        <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
