import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function NurseIntake() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Form State
  const [form, setForm] = useState({
    symptoms: '',
    bpSystolic: '',
    bpDiastolic: '',
    heartRate: '',
    spo2: '',
    temperature: '',
    respiratoryRate: ''
  });
  
  // Results State
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // --- 1. HANDLE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    try {
      await axios.post(`${API_BASE}/api/login`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Login failed. Check credentials.');
    }
  };

  // --- 2. HANDLE INPUT CHANGES ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- 3. HANDLE TRIAGE SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setResult(null);

    const payload = {
      symptoms: form.symptoms,
      vitals: {
        bp_systolic: parseInt(form.bpSystolic),
        bp_diastolic: parseInt(form.bpDiastolic),
        heart_rate: parseInt(form.heartRate),
        spo2: parseInt(form.spo2),
        temperature: parseFloat(form.temperature),
        respiratory_rate: parseInt(form.respiratoryRate)
      }
    };

    try {
      const response = await axios.post(`${API_BASE}/api/triage`, payload);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit triage request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable Tailwind styles
  const inputClass = "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors";
  const labelClass = "block text-slate-400 text-sm mb-1";
  const cardClass = "w-full max-w-2xl bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl";

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className={cardClass}>
          <h1 className="text-2xl font-bold text-white mb-2 text-center">🩺 AarogyaTriage</h1>
          <p className="text-slate-400 text-center mb-6">Nurse / Medical Officer Login</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={labelClass}>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                className={inputClass} 
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className={inputClass} 
                placeholder="Enter your password"
              />
            </div>
            
            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                ⚠️ {loginError}
              </div>
            )}

            <button type="submit" className="w-full py-3 rounded-lg font-semibold bg-teal-500 hover:bg-teal-400 text-slate-900 transition-colors">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN INTAKE FORM ---
  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col items-center font-sans">
      
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white">📋 Nurse Intake & Triage</h1>
        <button 
          onClick={() => setIsLoggedIn(false)} 
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Form Card */}
      <div className={cardClass}>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Symptoms */}
          <div>
            <label className={labelClass}>Patient Symptoms</label>
            <textarea 
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
              required
              rows="4"
              className={inputClass + " resize-none"}
              placeholder="e.g., Crushing chest pain radiating to left jaw, diaphoresis, dyspnea for 45 mins."
            />
          </div>

          {/* Vitals Grid */}
          <div className="pt-4 border-t border-slate-700">
            <h2 className="text-teal-400 text-sm font-semibold uppercase tracking-wider mb-4">Vital Signs</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              
              <div>
                <label className={labelClass}>BP Systolic (mmHg)</label>
                <input type="number" name="bpSystolic" value={form.bpSystolic} onChange={handleChange} required className={inputClass} placeholder="120" />
              </div>
              <div>
                <label className={labelClass}>BP Diastolic (mmHg)</label>
                <input type="number" name="bpDiastolic" value={form.bpDiastolic} onChange={handleChange} required className={inputClass} placeholder="80" />
              </div>
              <div>
                <label className={labelClass}>Heart Rate (bpm)</label>
                <input type="number" name="heartRate" value={form.heartRate} onChange={handleChange} required className={inputClass} placeholder="88" />
              </div>
              <div>
                <label className={labelClass}>SpO2 (%)</label>
                <input type="number" name="spo2" value={form.spo2} onChange={handleChange} required className={inputClass} placeholder="98" />
              </div>
              <div>
                <label className={labelClass}>Temperature (°F)</label>
                <input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} required className={inputClass} placeholder="98.6" />
              </div>
              <div>
                <label className={labelClass}>Respiratory Rate</label>
                <input type="number" name="respiratoryRate" value={form.respiratoryRate} onChange={handleChange} required className={inputClass} placeholder="18" />
              </div>

            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              ❌ {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isSubmitting 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-teal-500 hover:bg-teal-400 text-slate-900'
            }`}
          >
            {isSubmitting ? 'ANALYZING...' : 'SUBMIT TRIAGE REQUEST'}
          </button>
        </form>
      </div>

      {/* --- 4. RESULTS DISPLAY --- */}
      {result && (
        <div className="w-full max-w-2xl mt-6 bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-5 shadow-xl">
          
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h2 className="text-lg font-semibold text-teal-400">📊 Triage Assessment</h2>
            {result.priority_tier && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                result.priority_tier === 'P1' ? 'bg-red-500 text-white' :
                result.priority_tier === 'P2' ? 'bg-orange-500 text-white' :
                result.priority_tier === 'P3' ? 'bg-yellow-500 text-slate-900' :
                'bg-green-500 text-slate-900'
              }`}>
                {result.priority_tier}
              </span>
            )}
          </div>

          {result.summary && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-1">AI Summary</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{result.summary}</p>
            </div>
          )}

          {result.timeline && result.timeline.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Clinical Timeline</h3>
              <div className="space-y-3">
                {result.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="w-20 text-xs text-slate-500 font-mono pt-0.5">{event.time}</div>
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0"></div>
                    <div className="text-sm text-slate-300">{event.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}

    </div>
  );
}