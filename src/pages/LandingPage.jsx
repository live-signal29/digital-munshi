import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LandingPage({ onLogin, onOpenPolicy }) {
  const [authMode, setAuthMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mobile number ko internal email format mein convert karta hai.
  // Agar user actual email dale to wahi use hoga.
  const formatAuthEmail = (input) => {
    const clean = input.trim();

    if (clean.includes('@')) {
      return clean.toLowerCase();
    }

    const phoneClean = clean.replace(/[^0-9]/g, '');

    if (!phoneClean) {
      throw new Error('Mobile number ya email enter karein.');
    }

    return `${phoneClean}@digitalmunshi.com`;
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErrorMsg('');
    setLoading(true);

    try {
      /*
       * ================================
       * FORGOT PASSWORD
       * ================================
       */
      if (authMode === 'forgot') {
        const authEmail = formatAuthEmail(email);

        const { error } = await supabase.auth.resetPasswordForEmail(
          authEmail,
          {
            redirectTo: `${window.location.origin}`
          }
        );

        if (error) {
          throw error;
        }

        alert(
          'Password reset link registered email par bhej diya gaya hai.'
        );

        setAuthMode('login');
        setPassword('');
        return;
      }

      const authEmail = formatAuthEmail(email);

      /*
       * ================================
       * REGISTER
       * ================================
       */
      if (authMode === 'register') {
        if (!fullName.trim()) {
          throw new Error('Apna poora naam enter karein.');
        }

        if (password.length < 6) {
          throw new Error(
            'Password kam az kam 6 characters ka hona chahiye.'
          );
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (error) {
          throw error;
        }

        /*
         * IMPORTANT:
         *
         * Kabhi Supabase signup ke baad email verification
         * required hone ki wajah se session null return karta hai.
         *
         * Aisi situation mein fake user bana kar dashboard
         * OPEN NAHI karna.
         */
        if (!data?.user) {
          throw new Error(
            'Account create nahi ho saka. Dobara try karein.'
          );
        }

        if (!data?.session) {
          setAuthMode('login');
          setPassword('');

          alert(
            'Account successfully create ho gaya hai. ' +
            'Agar email verification enabled hai to pehle email verify karein, ' +
            'phir Login karein.'
          );

          return;
        }

        /*
         * Yahan sirf REAL Supabase user ko App mein bhejna hai.
         */
        onLogin(data.user);

        return;
      }

      /*
       * ================================
       * LOGIN
       * ================================
       */
      if (authMode === 'login') {
        if (!password) {
          throw new Error('Password enter karein.');
        }

        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: authEmail,
            password: password
          });

        /*
         * IMPORTANT:
         * Login error par kabhi fake/local login nahi hoga.
         */
        if (error) {
          throw error;
        }

        /*
         * Real session verify karo.
         */
        if (!data?.session || !data?.user) {
          throw new Error(
            'Login session create nahi hui. Dobara login karein.'
          );
        }

        /*
         * Sirf REAL Supabase user ko dashboard mein bhejo.
         */
        onLogin(data.user);

        return;
      }

    } catch (err) {
      console.error('Authentication error:', err);

      let message = 'Authentication failed. Dobara try karein.';

      if (err?.message) {
        message = err.message;
      }

      /*
       * Common Supabase messages ko simple language mein show karo.
       */
      if (
        message.toLowerCase().includes('invalid login credentials')
      ) {
        message =
          'Mobile/Email ya Password ghalat hai.';
      }

      if (
        message.toLowerCase().includes('user already registered')
      ) {
        message =
          'Ye account pehle se registered hai. Login karein.';
      }

      if (
        message.toLowerCase().includes('password should be at least')
      ) {
        message =
          'Password kam az kam 6 characters ka hona chahiye.';
      }

      setErrorMsg(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-between p-4 md:p-6 max-w-md mx-auto text-stone-800 border-x border-stone-200">

      {/* TOP HEADER */}
      <header className="flex justify-between items-center py-2 border-b border-stone-200/80 pb-3">

        <div className="flex items-center gap-2.5">

          <div className="bg-[#1e3a29] text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            🌾
          </div>

          <div>
            <h1 className="font-serif font-bold text-base text-[#1e3a29] leading-none">
              Digital Munshi
            </h1>

            <span className="text-[10px] text-emerald-800 font-medium">
              Haji Noor Kissan
            </span>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() => {
              setErrorMsg('');
              setPassword('');
              setAuthMode('login');
            }}
            className="text-xs font-bold text-[#1e3a29] px-3 py-1.5 rounded-lg border border-[#1e3a29]/30 hover:bg-emerald-50 transition text-center"
          >
            Login
            <span className="text-[9px] opacity-75 font-normal block -mt-0.5 font-serif">
              لاگ ان
            </span>
          </button>

          <button
            onClick={() => {
              setErrorMsg('');
              setPassword('');
              setFullName('');
              setAuthMode('register');
            }}
            className="text-xs font-bold bg-[#1e3a29] text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#162c1f] transition text-center"
          >
            Register
            <span className="text-[9px] opacity-75 font-normal block -mt-0.5 font-serif">
              رجسٹر
            </span>
          </button>

        </div>
      </header>

      {/* AUTH AREA */}
      {authMode ? (

        <div className="my-auto py-4">

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xl space-y-4">

            {/* MODAL HEADER */}
            <div className="flex justify-between items-center border-b pb-3">

              <div>

                <h3 className="text-lg font-serif font-bold text-[#1e3a29]">
                  {authMode === 'login' && 'Login to Account'}
                  {authMode === 'register' && 'Create New Account'}
                  {authMode === 'forgot' && 'Reset Password'}
                </h3>

                <p className="text-[11px] text-stone-500 font-serif">
                  {authMode === 'login' &&
                    'اپنے اکاؤنٹ میں داخل ہوں'}

                  {authMode === 'register' &&
                    'نیا اکاؤنٹ بنائیں'}

                  {authMode === 'forgot' &&
                    'پاس ورڈ ری سیٹ کریں'}
                </p>

              </div>

              <button
                onClick={() => {
                  setAuthMode(null);
                  setErrorMsg('');
                }}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>

            </div>

            {/* ERROR */}
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleAuth}
              className="space-y-3.5 pt-1"
            >

              {/* FULL NAME */}
              {authMode === 'register' && (
                <div>

                  <label className="text-[10px] text-stone-600 font-bold block mb-1">
                    FULL NAME
                    <span className="font-normal text-stone-400 font-serif">
                      {' '}
                      (پورا نام)
                    </span>
                  </label>

                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Chaudhry Ahmad"
                    className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]"
                  />

                </div>
              )}

              {/* MOBILE / EMAIL */}
              <div>

                <label className="text-[10px] text-stone-600 font-bold block mb-1">
                  MOBILE / EMAIL
                  <span className="font-normal text-stone-400 font-serif">
                    {' '}
                    (موبائل نمبر یا ای میل)
                  </span>
                </label>

                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="03001234567"
                  autoComplete={
                    authMode === 'login'
                      ? 'username'
                      : 'email'
                  }
                  className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]"
                />

              </div>

              {/* PASSWORD */}
              {authMode !== 'forgot' && (
                <div>

                  <div className="flex justify-between items-center mb-1">

                    <label className="text-[10px] text-stone-600 font-bold">
                      PASSWORD
                      <span className="font-normal text-stone-400 font-serif">
                        {' '}
                        (پاس ورڈ)
                      </span>
                    </label>

                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setAuthMode('forgot');
                        }}
                        className="text-[11px] text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>
                          Forgot Password?
                        </span>

                        <span className="font-serif text-[9px] opacity-80">
                          (پاس ورڈ بھول گئے؟)
                        </span>
                      </button>
                    )}

                  </div>

                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    autoComplete={
                      authMode === 'login'
                        ? 'current-password'
                        : 'new-password'
                    }
                    className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]"
                  />

                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a29] text-white py-3.5 rounded-xl font-bold text-xs shadow-md mt-2 hover:bg-[#162c1f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    {authMode === 'login' &&
                      'Login Now'}

                    {authMode === 'register' &&
                      'Create Account Now'}

                    {authMode === 'forgot' &&
                      'Send Reset Link'}
                  </>
                )}

              </button>

            </form>

            {/* BOTTOM SWITCH LINKS */}
            <div className="text-center pt-2 border-t border-stone-100 text-xs">

              {authMode === 'login' && (
                <div>
                  <span className="text-stone-500">
                    Don't have an account?{' '}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setPassword('');
                      setFullName('');
                      setAuthMode('register');
                    }}
                    className="font-bold text-[#1e3a29] hover:underline"
                  >
                    Register
                    <span className="font-serif text-[10px] font-normal">
                      {' '}
                      (نیا اکاؤنٹ بنائیں)
                    </span>
                  </button>
                </div>
              )}

              {(authMode === 'register' ||
                authMode === 'forgot') && (
                <div>

                  <span className="text-stone-500">
                    Already have an account?{' '}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setAuthMode('login');
                    }}
                    className="font-bold text-[#1e3a29] hover:underline"
                  >
                    Login
                    <span className="font-serif text-[10px] font-normal">
                      {' '}
                      (لاگ ان کریں)
                    </span>
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>

      ) : (

        /* LANDING PAGE */
        <main className="my-auto py-6 space-y-6">

          {/* HERO */}
          <div className="text-center space-y-3">

            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[11px] font-semibold px-3 py-1 rounded-full border border-amber-200">
              🌾 Digital Management System
            </span>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-snug">
              Poori Zameendari Ka Hisaab,
              <br />
              <span className="text-[#1e3a29] underline decoration-amber-400">
                Ek Hi Kitaab Mein
              </span>
            </h2>

            <p className="text-emerald-800 font-serif text-base font-semibold">
              منشی کی مکمل روزنامچہ کتاب
            </p>

            <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
              Kisaan ke khaate, Godaam stock, Tijori jama-kharch,
              aur Tractor ka hisaab — ab mobile me mehfooz.
            </p>

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">

              <button
                onClick={() => {
                  setErrorMsg('');
                  setAuthMode('register');
                }}
                className="w-full bg-[#1e3a29] text-white py-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-[#162c1f]"
              >
                <span>
                  Get Started Free
                </span>

                <span className="text-[10px] opacity-80 font-normal border-l border-emerald-700 pl-2 font-serif">
                  مفت اکاؤنٹ بنائیں
                </span>
              </button>

              <button
                onClick={() => {
                  setErrorMsg('');
                  setAuthMode('login');
                }}
                className="w-full bg-white border border-stone-300 text-stone-700 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>
                  Already Have Account? Login
                </span>

                <span className="text-[10px] opacity-70 font-normal font-serif">
                  لاگ ان کریں
                </span>
              </button>

            </div>

          </div>

          {/* FEATURES */}
          <div className="space-y-3 pt-2">

            <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center flex items-center justify-center gap-2">
              <span className="h-[1px] w-8 bg-stone-300"></span>

              Is App Me Kya Features Hain?

              <span className="h-[1px] w-8 bg-stone-300"></span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <div className="text-emerald-800 text-lg">
                  🚜
                </div>

                <h4 className="font-bold text-xs text-stone-800">
                  Kisaan Khaata
                </h4>

                <p className="text-[10px] text-stone-500 leading-tight">
                  DAP, Spray, Beej, aur Paidawar ka item-wise record.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <div className="text-emerald-800 text-lg">
                  🏪
                </div>

                <h4 className="font-bold text-xs text-stone-800">
                  Godaam Stock
                </h4>

                <p className="text-[10px] text-stone-500 leading-tight">
                  Godaam me kitna maal aaya aur kisaan ko kitna mila.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <div className="text-emerald-800 text-lg">
                  🔒
                </div>

                <h4 className="font-bold text-xs text-stone-800">
                  Tijori Safe
                </h4>

                <p className="text-[10px] text-stone-500 leading-tight">
                  Cash In aur Cash Out ka daily safey-war hisaab.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <div className="text-emerald-800 text-lg">
                  📜
                </div>

                <h4 className="font-bold text-xs text-stone-800">
                  Automatic Sync
                </h4>

                <p className="text-[10px] text-stone-500 leading-tight">
                  Data online cloud database par hamesha safe.
                </p>
              </div>

            </div>
          </div>

        </main>
      )}

      {/* FOOTER */}
      <footer className="text-center text-[10px] text-stone-400 space-y-1 border-t border-stone-200/80 pt-3">

        <p>
          🔒 100% Secure & Encrypted Data
        </p>

        <div className="flex justify-center gap-3 pt-0.5 text-stone-500 font-medium">

          <button
            onClick={() => onOpenPolicy('privacy')}
            className="hover:underline"
          >
            Privacy Policy
          </button>

          <span>•</span>

          <button
            onClick={() => onOpenPolicy('terms')}
            className="hover:underline"
          >
            Terms of Service
          </button>

        </div>

      </footer>

    </div>
  );
}
