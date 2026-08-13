import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LandingPage({ onLogin, onOpenPolicy }) {
  const [authMode, setAuthMode] = useState(null);
  const [verificationMode, setVerificationMode] = useState(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [verificationCode, setVerificationCode] = useState('');

  const [registeredContact, setRegisteredContact] = useState('');

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  /*
   * -----------------------------------------
   * CONTACT TYPE
   * -----------------------------------------
   */

  const isEmail = (value) => {
    return value.includes('@');
  };

  /*
   * -----------------------------------------
   * PAKISTAN PHONE FORMAT
   *
   * 03001234567
   *      ↓
   * +923001234567
   * -----------------------------------------
   */

  const formatPhone = (input) => {
    let clean = input.trim().replace(/[^\d+]/g, '');

    if (clean.startsWith('00')) {
      clean = '+' + clean.substring(2);
    }

    if (clean.startsWith('+92')) {
      return clean;
    }

    if (clean.startsWith('92')) {
      return '+' + clean;
    }

    if (clean.startsWith('0')) {
      return '+92' + clean.substring(1);
    }

    return clean;
  };

  /*
   * -----------------------------------------
   * PASSWORD VALIDATION
   * -----------------------------------------
   */

  const validatePassword = (value) => {
    if (value.length < 6) {
      return 'Password kam az kam 6 characters ka hona chahiye.';
    }

    if (!/[A-Z]/.test(value)) {
      return 'Password mein kam az kam 1 capital letter hona chahiye.';
    }

    if (!/[a-z]/.test(value)) {
      return 'Password mein kam az kam 1 small letter hona chahiye.';
    }

    if (!/[0-9]/.test(value)) {
      return 'Password mein kam az kam 1 number hona chahiye.';
    }

    return '';
  };

  /*
   * -----------------------------------------
   * REGISTER
   * -----------------------------------------
   */

  const handleRegister = async () => {
    if (!fullName.trim()) {
      throw new Error('Apna poora naam enter karein.');
    }

    if (!email.trim()) {
      throw new Error('Mobile number ya email enter karein.');
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      throw new Error(passwordError);
    }

    let contact;
    let signupData;

    /*
     * EMAIL REGISTER
     */

    if (isEmail(email.trim())) {
      contact = email.trim().toLowerCase();

      signupData = await supabase.auth.signUp({
        email: contact,
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });
    }

    /*
     * PHONE REGISTER
     */

    else {
      contact = formatPhone(email);

      if (!contact || contact.length < 10) {
        throw new Error(
          'Valid mobile number enter karein. Example: 03001234567'
        );
      }

      signupData = await supabase.auth.signUp({
        phone: contact,
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });
    }

    if (signupData.error) {
      throw signupData.error;
    }

    if (!signupData.data?.user) {
      throw new Error(
        'Account create nahi ho saka. Dobara try karein.'
      );
    }

    /*
     * Agar verification required hai
     */

    if (!signupData.data.session) {
      setRegisteredContact(contact);

      setVerificationMode(
        isEmail(contact) ? 'email' : 'phone'
      );

      setVerificationCode('');
      setErrorMsg('');

      return;
    }

    /*
     * Agar Supabase ne directly session de di
     */

    if (signupData.data.session?.user) {
      onLogin(signupData.data.session.user);
      return;
    }

    /*
     * Safety check
     */

    throw new Error(
      'Account create hua lekin login session nahi bani.'
    );
  };

  /*
   * -----------------------------------------
   * VERIFY OTP
   * -----------------------------------------
   */

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErrorMsg('');
    setLoading(true);

    try {
      const token = verificationCode.trim();

      if (!/^\d{6}$/.test(token)) {
        throw new Error(
          '6 digit verification code enter karein.'
        );
      }

      let verifyResult;

      /*
       * EMAIL OTP
       */

      if (verificationMode === 'email') {
        verifyResult = await supabase.auth.verifyOtp({
          email: registeredContact,
          token,
          type: 'signup'
        });
      }

      /*
       * PHONE OTP
       */

      else {
        verifyResult = await supabase.auth.verifyOtp({
          phone: registeredContact,
          token,
          type: 'sms'
        });
      }

      if (verifyResult.error) {
        throw verifyResult.error;
      }

      if (!verifyResult.data?.user) {
        throw new Error(
          'Verification complete nahi hui. Dobara code check karein.'
        );
      }

      /*
       * Verification ke baad actual session check
       */

      const {
        data: sessionData,
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData?.session?.user) {
        /*
         * Kuch Supabase configurations mein verify ke baad
         * session automatically nahi banti.
         *
         * Isliye password ke saath actual login karte hain.
         */

        const loginPayload =
          verificationMode === 'email'
            ? {
                email: registeredContact,
                password
              }
            : {
                phone: registeredContact,
                password
              };

        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword(
            loginPayload
          );

        if (loginError) {
          throw loginError;
        }

        if (!loginData?.session?.user) {
          throw new Error(
            'Verification ho gayi lekin login session nahi bani.'
          );
        }

        onLogin(loginData.session.user);
        return;
      }

      /*
       * Real Supabase session
       */

      onLogin(sessionData.session.user);

    } catch (err) {
      console.error('Verification error:', err);

      setErrorMsg(
        err?.message ||
          'Verification code ghalat hai. Dobara try karein.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * -----------------------------------------
   * RESEND OTP
   * -----------------------------------------
   */

  const resendCode = async () => {
    if (resending) return;

    setErrorMsg('');
    setResending(true);

    try {
      if (verificationMode === 'email') {
        const { error } =
          await supabase.auth.resend({
            type: 'signup',
            email: registeredContact
          });

        if (error) throw error;
      } else {
        const { error } =
          await supabase.auth.resend({
            type: 'sms',
            phone: registeredContact
          });

        if (error) throw error;
      }

      alert(
        'Verification code dobara bhej diya gaya hai.'
      );

    } catch (err) {
      console.error('Resend error:', err);

      setErrorMsg(
        err?.message ||
          'Code resend nahi ho saka. Thori dair baad dobara try karein.'
      );
    } finally {
      setResending(false);
    }
  };

  /*
   * -----------------------------------------
   * LOGIN
   * -----------------------------------------
   */

  const handleLogin = async () => {
    if (!email.trim()) {
      throw new Error(
        'Mobile number ya email enter karein.'
      );
    }

    if (!password) {
      throw new Error('Password enter karein.');
    }

    let loginData;

    if (isEmail(email.trim())) {
      loginData = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
    } else {
      const phoneNumber = formatPhone(email);

      loginData = await supabase.auth.signInWithPassword({
        phone: phoneNumber,
        password
      });
    }

    if (loginData.error) {
      throw loginData.error;
    }

    if (!loginData.data?.session?.user) {
      throw new Error(
        'Login session nahi bani. Dobara login karein.'
      );
    }

    /*
     * ONLY REAL SUPABASE USER
     */

    onLogin(loginData.data.session.user);
  };

  /*
   * -----------------------------------------
   * MAIN AUTH HANDLER
   * -----------------------------------------
   */

  const handleAuth = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErrorMsg('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        await handleRegister();
        return;
      }

      if (authMode === 'login') {
        await handleLogin();
        return;
      }

    } catch (err) {
      console.error('Authentication error:', err);

      let message =
        err?.message ||
        'Authentication failed. Dobara try karein.';

      const lower = message.toLowerCase();

      if (
        lower.includes('invalid login credentials')
      ) {
        message =
          'Mobile/Email ya Password ghalat hai.';
      }

      if (
        lower.includes('user already registered')
      ) {
        message =
          'Ye account pehle se registered hai. Login karein.';
      }

      if (
        lower.includes('password should be at least')
      ) {
        message =
          'Password kam az kam 6 characters ka hona chahiye.';
      }

      setErrorMsg(message);

    } finally {
      setLoading(false);
    }
  };

  /*
   * -----------------------------------------
   * VERIFICATION SCREEN
   * -----------------------------------------
   */

  if (verificationMode) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-between p-4 md:p-6 max-w-md mx-auto text-stone-800 border-x border-stone-200">

        <header className="flex items-center gap-2.5 py-2 border-b border-stone-200/80 pb-3">

          <div className="bg-[#1e3a29] text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            🌾
          </div>

          <div>
            <h1 className="font-serif font-bold text-base text-[#1e3a29]">
              Digital Munshi
            </h1>

            <span className="text-[10px] text-emerald-800 font-medium">
              Account Verification
            </span>
          </div>

        </header>

        <main className="my-auto py-8">

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xl">

            <div className="text-center">

              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-4">
                {verificationMode === 'email'
                  ? '📧'
                  : '📱'}
              </div>

              <h2 className="text-xl font-serif font-bold text-[#1e3a29]">
                Verify Your Account
              </h2>

              <p className="text-sm text-stone-600 mt-2 leading-relaxed">

                {verificationMode === 'email'
                  ? 'Aap ke email par 6 digit verification code bheja gaya hai.'
                  : 'Aap ke mobile number par 6 digit verification code bheja gaya hai.'}

              </p>

              <p className="text-xs font-semibold text-[#1e3a29] mt-2 break-all">
                {registeredContact}
              </p>

            </div>

            {errorMsg && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <form
              onSubmit={handleVerifyCode}
              className="mt-5 space-y-4"
            >

              <div>

                <label className="text-[10px] text-stone-600 font-bold block mb-1.5">
                  VERIFICATION CODE
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  required
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  placeholder="123456"
                  className="w-full p-4 text-center text-xl tracking-[0.5em] font-bold border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]"
                />

              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  verificationCode.length !== 6
                }
                className="w-full bg-[#1e3a29] text-white py-3.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#162c1f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Verifying...'
                  : 'Verify & Continue'}
              </button>

            </form>

            <div className="text-center mt-5">

              <p className="text-[11px] text-stone-500 mb-2">
                Code nahi mila?
              </p>

              <button
                type="button"
                disabled={resending}
                onClick={resendCode}
                className="text-xs font-bold text-[#1e3a29] hover:underline disabled:opacity-50"
              >
                {resending
                  ? 'Sending...'
                  : 'Resend Verification Code'}
              </button>

            </div>

            <button
              type="button"
              onClick={() => {
                setVerificationMode(null);
                setAuthMode('register');
                setVerificationCode('');
                setErrorMsg('');
              }}
              className="w-full mt-5 pt-4 border-t border-stone-100 text-xs text-stone-500 hover:text-[#1e3a29]"
            >
              ← Back to Register
            </button>

          </div>

        </main>

        <footer className="text-center text-[10px] text-stone-400 border-t border-stone-200/80 pt-3">
          🔒 100% Secure & Encrypted Data
        </footer>

      </div>
    );
  }

  /*
   * -----------------------------------------
   * NORMAL LANDING PAGE
   * -----------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-between p-4 md:p-6 max-w-md mx-auto text-stone-800 border-x border-stone-200">

      {/* HEADER */}

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
              setEmail('');
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

      {/* AUTH */}

      {authMode ? (

        <div className="my-auto py-4">

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xl space-y-4">

            <div className="flex justify-between items-center border-b pb-3">

              <div>

                <h3 className="text-lg font-serif font-bold text-[#1e3a29]">

                  {authMode === 'login'
                    ? 'Login to Account'
                    : 'Create New Account'}

                </h3>

                <p className="text-[11px] text-stone-500 font-serif">

                  {authMode === 'login'
                    ? 'اپنے اکاؤنٹ میں داخل ہوں'
                    : 'نیا اکاؤنٹ بنائیں'}

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

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <form
              onSubmit={handleAuth}
              className="space-y-3.5 pt-1"
            >

              {/* NAME */}

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

              {/* EMAIL / PHONE */}

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
                  placeholder="03001234567 or example@gmail.com"
                  className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]"
                />

                {authMode === 'register' && (
                  <p className="text-[9px] text-stone-500 mt-1.5">
                    Email denge to verification code Gmail par aayega.
                    Mobile number denge to SMS code aayega.
                  </p>
                )}

              </div>

              {/* PASSWORD */}

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
                      className="text-[10px] text-emerald-800 font-semibold hover:underline"
                    >
                      Forgot Password?
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
                  placeholder="Example: Munshi@123"
                  autoComplete={
                    authMode === 'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                  className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]"
                />

                {/* PASSWORD INSTRUCTIONS */}

                {authMode === 'register' && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">

                    <p className="text-[10px] font-bold text-emerald-900 mb-1.5">
                      🔐 Password kesa hona chahiye?
                    </p>

                    <div className="space-y-1 text-[9px] text-emerald-800">

                      <p>
                        ✓ Kam az kam 6 characters
                      </p>

                      <p>
                        ✓ 1 Capital letter — A, B, C
                      </p>

                      <p>
                        ✓ 1 Small letter — a, b, c
                      </p>

                      <p>
                        ✓ 1 Number — 1, 2, 3
                      </p>

                      <p className="font-semibold pt-1">
                        Example: Munshi@123
                      </p>

                    </div>

                  </div>
                )}

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a29] text-white py-3.5 rounded-xl font-bold text-xs shadow-md mt-2 hover:bg-[#162c1f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {loading
                  ? 'Processing...'
                  : authMode === 'login'
                    ? 'Login Now'
                    : 'Create Account & Get Code'}

              </button>

            </form>

            {/* SWITCH */}

            <div className="text-center pt-2 border-t border-stone-100 text-xs">

              {authMode === 'login' ? (

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
                      setEmail('');
                      setAuthMode('register');
                    }}
                    className="font-bold text-[#1e3a29] hover:underline"
                  >
                    Register
                  </button>

                </div>

              ) : (

                <div>

                  <span className="text-stone-500">
                    Already have an account?{' '}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setPassword('');
                      setAuthMode('login');
                    }}
                    className="font-bold text-[#1e3a29] hover:underline"
                  >
                    Login
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      ) : (

        /* LANDING HERO */

        <main className="my-auto py-6 space-y-6">

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
                Already Have Account? Login
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

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
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

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-emerald-800 text-lg">
                  🏪
                </div>

                <h4 className="font-bold text-xs text-stone-800">
                  Godaam Stock
                </h4>

                <p className="text-[10px] text-stone-500 leading-tight">
                  Godaam ka complete stock record.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-emerald-800 text-lg">
                  🔒
                </div>

                <h4 className="font-bold text-xs text-stone-800">
                  Tijori Safe
                </h4>

                <p className="text-[10px] text-stone-500 leading-tight">
                  Cash In aur Cash Out ka complete hisaab.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="text-emerald-800 text-lg">
                  📜
                </div>

                <h4 className="font-bold text-xs text-stone-800">
                  Automatic Sync
                </h4>

                <p className="text-[10px] text-stone-500 leading-tight">
                  Data cloud database par safe.
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
            onClick={() =>
              onOpenPolicy('privacy')
            }
            className="hover:underline"
          >
            Privacy Policy
          </button>

          <span>•</span>

          <button
            onClick={() =>
              onOpenPolicy('terms')
            }
            className="hover:underline"
          >
            Terms of Service
          </button>

        </div>

      </footer>

    </div>
  );
}
