import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, Leaf } from 'lucide-react';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api-token-auth/', { username, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      setToken(token);
    } catch (err) {
      alert("Invalid credentials. Try 'admin' or 'farmer_jane'");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-emerald-50 rounded-2xl mb-4">
            <Leaf className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Sign in to manage FarmShield AI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Username" required
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input 
              type="password" placeholder="Password" required
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;