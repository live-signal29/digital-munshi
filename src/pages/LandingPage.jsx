import React, { useState } from 'react';

export default function LandingPage({ onLogin, onOpenPolicy }) {
  const [isLoginView, setIsLoginView] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin({ email });
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-3">
          <div className="bg-[#1e3a29] text-white p-2 rounded-xl text-lg font-bold">🌾</div>
          <div>
            <h1 className="font-serif font-bold text-xl text-[#1e3a29]">Digital Munshi</h1>
            <p className="text-xs text-stone-500">Haji Noor Kissan</p>
          </div>
        </div>
        <button 
          onClick={() => setIsLoginView(!isLoginView)}
          className="text-xs font-semibold border border-[#1e3a29] text-[#1e3a29] px-4 py-2 rounded-lg"
        >
          {isLoginView ? 'Register' : 'Login'}
        </button>
      </div>

      {/* Auth / Info Screen */}
      <div className="my-auto py-8">
        {!isLoginView ? (
          <div className="space-y-6 text-center">
            <span className="inline-block bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full border border-amber-200">
              🌾 Zameendar ke munshi ke liye banaya gaya
            </span>
            <h2 className="text-3xl font-serif font-bold text-stone-900 leading-tight">
              Poori zameendari ka hisaab, ek hi kitaab mein
            </h2>
            <p className="text-emerald-800 font-serif text-lg">منشی کی روزنامچہ کتاب</p>
            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              Rozana jama-kharch, kashtkaaron ke khaate, zameen aur fasal ka record, qarz aur mazdooron ki hazri — sab kuch mehfooz.
            </p>

            <div className="space-y-3 pt-4 max-w-xs mx-auto">
              <button onClick={() => setIsLoginView(true)} className="w-full bg-[#1e3a29] text-white py-3 rounded-xl font-bold text-sm shadow-md">
                Muft account banayein
              </button>
              <button onClick={() => setIsLoginView(true)} className="w-full bg-stone-100 border border-stone-200 text-stone-700 py-3 rounded-xl font-bold text-sm">
                Pehle se account hai? Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 max-w-xs mx-auto">
            <h3 className="text-xl font-serif font-bold text-[#1e3a29] text-center">
              {isLoginView ? 'Login to Account' : 'Naya Account Banayein'}
            </h3>
            <div>
              <label className="text-[10px] text-stone-500 font-bold block mb-1">EMAIL / PHONE</label>
              <input type="text" required value={email} onChange={e => setEmail(e.target.value)} placeholder="03001234567" className="w-full p-2.5 text-xs border border-stone-300 rounded-lg focus:outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-stone-500 font-bold block mb-1">PASSWORD</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-2.5 text-xs border border-stone-300 rounded-lg focus:outline-none" />
            </div>
            <button type="submit" className="w-full bg-[#1e3a29] text-white py-3 rounded-xl font-bold text-xs shadow-md">
              Dakhil Hon
            </button>
          </form>
        )}
      </div>

      {/* Footer Links */}
      <div className="text-center text-[10px] text-stone-400 space-y-1">
        <p>🔒 Aap ka data sirf aap dekh sakte hain</p>
        <div className="flex justify-center gap-3 pt-1">
          <button onClick={() => onOpenPolicy('privacy')} className="underline hover:text-stone-600">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => onOpenPolicy('terms')} className="underline hover:text-stone-600">Terms of Service</button>
        </div>
      </div>
    </div>
  );
}
