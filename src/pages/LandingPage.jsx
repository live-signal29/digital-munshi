import React, { useState } from 'react';

export default function LandingPage({ onLogin, onOpenPolicy }) {
  // 'login' | 'register' | 'forgot' | null
  const [authMode, setAuthMode] = useState(null); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'forgot') {
      alert('Password reset link aap ke number/email par bhej diya gaya hai!');
      setAuthMode('login');
      return;
    }
    if (email) {
      onLogin({ email, name: fullName || 'Zameendar User' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-between p-4 md:p-6 max-w-md mx-auto text-stone-800 border-x border-stone-200">
      
      {/* 1. TOP HEADER WITH LOGIN & REGISTER BUTTONS */}
      <header className="flex justify-between items-center py-2 border-b border-stone-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#1e3a29] text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            🌾
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-[#1e3a29] leading-none">Digital Munshi</h1>
            <span className="text-[10px] text-emerald-800 font-medium">Haji Noor Kissan</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setAuthMode('login')}
            className="text-xs font-bold text-[#1e3a29] px-3 py-1.5 rounded-lg border border-[#1e3a29]/30 hover:bg-emerald-50 transition text-center"
          >
            Login 
            <span className="text-[9px] opacity-75 font-normal block -mt-0.5 font-serif">لاگ ان</span>
          </button>
          <button 
            onClick={() => setAuthMode('register')}
            className="text-xs font-bold bg-[#1e3a29] text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#162c1f] transition text-center"
          >
            Register 
            <span className="text-[9px] opacity-75 font-normal block -mt-0.5 font-serif">رجسٹر</span>
          </button>
        </div>
      </header>

      {/* 2. AUTH MODAL (LOGIN / REGISTER / FORGOT PASSWORD) */}
      {authMode ? (
        <div className="my-auto py-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1e3a29]">
                  {authMode === 'login' && 'Login to Account'}
                  {authMode === 'register' && 'Create New Account'}
                  {authMode === 'forgot' && 'Reset Password'}
                </h3>
                <p className="text-[11px] text-stone-500 font-serif">
                  {authMode === 'login' && 'اپنے اکاؤنٹ میں داخل ہوں'}
                  {authMode === 'register' && 'نیا اکاؤنٹ بنائیں'}
                  {authMode === 'forgot' && 'پاس ورڈ ری سیٹ کریں'}
                </p>
              </div>
              <button 
                onClick={() => setAuthMode(null)} 
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAuth} className="space-y-3.5 pt-1">
              
              {/* Full Name (Only on Register) */}
              {authMode === 'register' && (
                <div>
                  <label className="text-[10px] text-stone-600 font-bold block mb-1">
                    FULL NAME <span className="font-normal text-stone-400 font-serif">(پورا نام)</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    placeholder="Chaudhry Ahmad" 
                    className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]" 
                  />
                </div>
              )}

              {/* Mobile / Email */}
              <div>
                <label className="text-[10px] text-stone-600 font-bold block mb-1">
                  MOBILE / EMAIL <span className="font-normal text-stone-400 font-serif">(موبائل نمبر یا ای میل)</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="03001234567" 
                  className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]" 
                />
              </div>

              {/* Password & Forgot Password Link (Login & Register View) */}
              {authMode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-stone-600 font-bold">
                      PASSWORD <span className="font-normal text-stone-400 font-serif">(پاس ورڈ)</span>
                    </label>

                    {/* Forgot Password Button */}
                    {authMode === 'login' && (
                      <button 
                        type="button" 
                        onClick={() => setAuthMode('forgot')} 
                        className="text-[11px] text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Forgot Password?</span>
                        <span className="font-serif text-[9px] opacity-80">(پاس ورڈ بھول گئے؟)</span>
                      </button>
                    )}
                  </div>

                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]" 
                  />
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full bg-[#1e3a29] text-white py-3.5 rounded-xl font-bold text-xs shadow-md mt-2 hover:bg-[#162c1f] transition"
              >
                {authMode === 'login' && 'Login Now'}
                {authMode === 'register' && 'Create Account Now'}
                {authMode === 'forgot' && 'Send Reset Code'}
              </button>
            </form>

            {/* Bottom Switch Links */}
            <div className="text-center pt-2 border-t border-stone-100 text-xs">
              {authMode === 'login' && (
                <div>
                  <span className="text-stone-500">Don't have an account? </span>
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('register')} 
                    className="font-bold text-[#1e3a29] hover:underline"
                  >
                    Register <span className="font-serif text-[10px] font-normal">(نیا اکاؤنٹ بنائیں)</span>
                  </button>
                </div>
              )}

              {(authMode === 'register' || authMode === 'forgot') && (
                <div>
                  <span className="text-stone-500">Already have an account? </span>
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('login')} 
                    className="font-bold text-[#1e3a29] hover:underline"
                  >
                    Login <span className="font-serif text-[10px] font-normal">(لاگ ان کریں)</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (

        /* 3. LANDING HERO & FEATURE CARDS */
        <main className="my-auto py-6 space-y-6">
          
          {/* HERO BANNER */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[11px] font-semibold px-3 py-1 rounded-full border border-amber-200">
              🌾 Digital Management System
            </span>
            
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-snug">
              Poori Zameendari Ka Hisaab, <br/>
              <span className="text-[#1e3a29] underline decoration-amber-400">Ek Hi Kitaab Mein</span>
            </h2>
            <p className="text-emerald-800 font-serif text-base font-semibold">منشی کی مکمل روزنامچہ کتاب</p>

            <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
              Kisaan ke khaate, Godaam stock, Tijori jama-kharch, aur Tractor ka hisaab — ab mobile me mehfooz.
            </p>

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">
              <button 
                onClick={() => setAuthMode('register')}
                className="w-full bg-[#1e3a29] text-white py-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-[#162c1f]"
              >
                <span>Get Started Free</span>
                <span className="text-[10px] opacity-80 font-normal border-l border-emerald-700 pl-2 font-serif">مفت اکاؤنٹ بنائیں</span>
              </button>
              
              <button 
                onClick={() => setAuthMode('login')}
                className="w-full bg-white border border-stone-300 text-stone-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Already Have Account? Login</span>
                <span className="text-[10px] opacity-70 font-normal font-serif">لاگ ان کریں</span>
              </button>
            </div>
          </div>

          {/* FEATURE CARDS */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center flex items-center justify-center gap-2">
              <span className="h-[1px] w-8 bg-stone-300"></span>
              Is App Me Kya Features Hain?
              <span className="h-[1px] w-8 bg-stone-300"></span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <div className="text-emerald-800 text-lg">🚜</div>
                <h4 className="font-bold text-xs text-stone-800">Kisaan Khaata</h4>
                <p className="text-[10px] text-stone-500 leading-tight">DAP, Spray, Beej, aur Paidawar ka item-wise record.</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <div className="text-emerald-800 text-lg">🏪</div>
                <h4 className="font-bold text-xs text-stone-800">Godaam Stock</h4>
                <p className="text-[10px] text-stone-500 leading-tight">Godaam me kitna maal aaya aur kisaan ko kitna mila.</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <div className="text-emerald-800 text-lg">🔒</div>
                <h4 className="font-bold text-xs text-stone-800">Tijori Safe</h4>
                <p className="text-[10px] text-stone-500 leading-tight">Cash In aur Cash Out ka daily safey-war hisaab.</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <div className="text-emerald-800 text-lg">📜</div>
                <h4 className="font-bold text-xs text-stone-800">Automatic Sync</h4>
                <p className="text-[10px] text-stone-500 leading-tight">Data online cloud database par hamesha safe.</p>
              </div>
            </div>
          </div>

        </main>
      )}

      {/* 4. FOOTER & POLICY LINKS */}
      <footer className="text-center text-[10px] text-stone-400 space-y-1 border-t border-stone-200/80 pt-3">
        <p>🔒 100% Secure & Encrypted Data</p>
        <div className="flex justify-center gap-3 pt-0.5 text-stone-500 font-medium">
          <button onClick={() => onOpenPolicy('privacy')} className="hover:underline">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => onOpenPolicy('terms')} className="hover:underline">Terms of Service</button>
        </div>
      </footer>

    </div>
  );
}
