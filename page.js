'use client';

import React, { useState, useEffect } from 'react';
import { kora } from '../lib/kora-engine';
import { Wallet, Lock, Plus, ShieldCheck, Activity, Target, Cpu } from 'lucide-react';

export default function Home() {
  const [address, setAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Simulated Vault State for UI display
  const [myVaults, setMyVaults] = useState([
    { id: 1, name: "Down Payment", current: 4200, target: 10000, active: true },
    { id: 2, name: "Node Setup", current: 1500, target: 1500, active: true }
  ]);

  const onConnect = async () => {
    setIsConnecting(true);
    try {
      const addr = await kora.connect();
      setAddress(addr);
    } catch (e) {
      alert("Please install Nami Wallet!");
    }
    setIsConnecting(false);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white selection:bg-indigo-600/30 font-sans">
      {/* Header */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center py-10 px-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 shadow-xl shadow-indigo-600/20">
            <Lock size={24} />
          </div>
          <div>
            <span className="text-3xl font-black uppercase tracking-tighter block leading-none italic">KORA</span>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1">Savings Protocol</span>
          </div>
        </div>
        <button 
          onClick={onConnect}
          className="bg-white text-black px-10 py-4 rounded-3xl font-black hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 shadow-2xl"
        >
          <Wallet size={18} />
          {address ? `${address.slice(0, 10)}...` : "Sync Mainnet"}
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-20 flex flex-col lg:grid lg:grid-cols-12 gap-20">
        
        {/* Left Side: Hero Info */}
        <div className="lg:col-span-12 mb-10">
            <h1 className="text-[110px] font-black leading-[0.85] tracking-tighter italic mb-10">
                Secure. <br/> <span className="text-indigo-600">Locked.</span> <br/> Wealth.
            </h1>
            <p className="text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                Decentralized savings discipline powered by Haskell Plutus contracts. Lock your ADA against specific targets and only withdraw when the goal is reached.
            </p>
        </div>

        {/* Middle: Active Vaults */}
        <div className="lg:col-span-8 space-y-10">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Your Active Contracts</h3>
                <button className="flex items-center gap-2 text-indigo-500 font-bold hover:text-white transition">
                    <Plus size={18} /> New Vault
                </button>
            </div>

            {myVaults.map(v => (
                <div key={v.id} className="relative p-1 rounded-[40px] bg-gradient-to-br from-indigo-600/20 via-slate-800 to-transparent">
                  <div className="bg-[#0b0e14] rounded-[39px] p-10 border border-white/5 backdrop-blur-3xl">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h4 className="text-3xl font-black mb-2 italic">{v.name}</h4>
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-widest">
                          <Cpu size={12} /> Haskell Script Verified
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black">{v.current} ₳</p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">In Vault</p>
                      </div>
                    </div>

                    {/* THE PROGRESS BAR */}
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Vault Progress</span>
                        <span>{Math.round((v.current / v.target) * 100)}% to Goal</span>
                      </div>
                      <div className="h-4 bg-[#02040a] rounded-full border border-white/5 p-1 relative overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                          style={{ width: `${(v.current/v.target)*100}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                      <button className="flex-1 bg-white/5 border border-white/5 py-4 rounded-2xl font-black hover:bg-white/10 transition">Save More</button>
                      <button 
                        disabled={v.current < v.target}
                        className={`flex-1 py-4 rounded-2xl font-black transition tracking-tight ${v.current >= v.target ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-900/50 text-slate-700 cursor-not-allowed border border-white/5'}`}
                      >
                         {v.current >= v.target ? 'Withdraw Savings' : 'Script Locked'}
                      </button>
                    </div>
                  </div>
                </div>
            ))}
        </div>

        {/* Right Side: Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-[#0b0e14] border border-white/5 p-10 rounded-[40px] shadow-2xl">
            <Target className="text-indigo-600 mb-6" size={32} />
            <h4 className="text-xl font-black uppercase mb-8">Ecosystem</h4>
            <div className="space-y-6">
              <div className="flex justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-slate-500 font-bold">Total Locked</span>
                <span className="font-black">5,700 ₳</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-slate-500 font-bold">Protocol Status</span>
                <span className="text-emerald-500 font-black text-xs flex items-center gap-2"><Activity size={12}/> ACTIVE</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-indigo-600/5 border border-indigo-600/10 rounded-[40px] flex items-center gap-4 group">
            <ShieldCheck size={24} className="text-indigo-500 group-hover:scale-110 transition" />
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-loose">
              Security: Plutus V2 <br/> Mainnet Operational
            </p>
          </div>
        </div>

      </main>

      <footer className="max-w-6xl mx-auto py-20 border-t border-white/5 mt-20 flex justify-between items-center opacity-30 text-[10px] font-black uppercase tracking-[0.5em]">
        <span>Haskell-Majority Application</span>
        <span>Built with Lucid Cardano SDK</span>
      </footer>
    </div>
  );
}