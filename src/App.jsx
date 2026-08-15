import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

import Navigation from './components/Navigation';
import Drawer from './components/Drawer';

import Dashboard from './pages/Dashboard';
import KisaanDetail from './pages/KisaanDetail';
import Godaam from './pages/Godaam';
import Tijori from './pages/Tijori';
import Zameendar from './pages/Zameendar';
import KhataBook from './pages/KhataBook';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

export default function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedKisaanId, setSelectedKisaanId] = useState(null);

  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  /*
   * -----------------------------------------
   * PASSWORD RECOVERY HANDLER
   * -----------------------------------------
   */

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (updatingPassword) return;

    setPasswordError('');
    setPasswordMessage('');

    if (newPassword.length < 6) {
      setPasswordError(
        'Password kam az kam 6 characters ka hona chahiye.'
      );
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError(
        'Password mein kam az kam 1 capital letter hona chahiye.'
      );
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError(
        'Password mein kam az kam 1 small letter hona chahiye.'
      );
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError(
        'Password mein kam az kam 1 number hona chahiye.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        'New password aur confirm password same nahi hain.'
      );
      return;
    }

    setUpdatingPassword(true);

    try {

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setPasswordMessage(
        'Password successfully update ho gaya hai!'
      );

      setNewPassword('');
      setConfirmPassword('');

      /*
       * Recovery session clear kar ke
       * user ko fresh login screen par bhejen
       */

      setTimeout(async () => {

        await supabase.auth.signOut();

        localStorage.removeItem('munshi_user');

        setUser(null);
        setPasswordRecovery(false);
        setActiveTab('home');

      }, 1500);

    } catch (err) {

      console.error('Password update error:', err);

      setPasswordError(
        err?.message ||
        'Password update nahi ho saka. Dobara try karein.'
      );

    } finally {
      setUpdatingPassword(false);
    }
  };

  /*
   * -----------------------------------------
   * SESSION + AUTH LISTENER
   * -----------------------------------------
   */

  useEffect(() => {

    let mounted = true;

    async function checkUserSession() {

      // Recovery link URL params check
      const hash = window.location.hash;
      const isRecoveryURL = hash && hash.includes('type=recovery');

      if (isRecoveryURL) {
        setPasswordRecovery(true);
        setLoading(false);
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {

        setUser(session.user);

        localStorage.setItem(
          'munshi_user',
          JSON.stringify(session.user)
        );

      } else {

        const savedUser =
          localStorage.getItem('munshi_user');

        if (savedUser) {

          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            localStorage.removeItem('munshi_user');
          }

        }

      }

      setLoading(false);
    }

    checkUserSession();

    /*
     * Auth state listener
     */

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (event, session) => {

        console.log(
          'Supabase Auth Event:',
          event
        );

        if (event === 'PASSWORD_RECOVERY') {

          setPasswordRecovery(true);
          setPasswordError('');
          setPasswordMessage('');
          setNewPassword('');
          setConfirmPassword('');

          setLoading(false);

          return;
        }

        if (session?.user && !passwordRecovery) {

          setUser(session.user);

          localStorage.setItem(
            'munshi_user',
            JSON.stringify(session.user)
          );

        } else if (event === 'SIGNED_OUT') {

          setUser(null);

          localStorage.removeItem(
            'munshi_user'
          );

        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };

  }, [passwordRecovery]);

  /*
   * -----------------------------------------
   * LOGIN HANDLER
   * -----------------------------------------
   */

  const handleLogin = (userData) => {

    setUser(userData);

    localStorage.setItem(
      'munshi_user',
      JSON.stringify(userData)
    );
  };

  /*
   * -----------------------------------------
   * LOGOUT
   * -----------------------------------------
   */

  const handleLogout = async () => {

    await supabase.auth.signOut();

    localStorage.removeItem(
      'munshi_user'
    );

    setUser(null);
    setIsDrawerOpen(false);
    setActiveTab('home');
  };

  /*
   * -----------------------------------------
   * KISAAN SELECT
   * -----------------------------------------
   */

  const handleSelectKisaan = (id) => {

    setSelectedKisaanId(id);
    setActiveTab('kisaan');
  };

  /*
   * -----------------------------------------
   * LOADING SCREEN
   * -----------------------------------------
   */

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">

        <div className="text-center space-y-3">

          <div className="w-10 h-10 border-4 border-[#1e3a29] border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-xs font-bold text-[#1e3a29]">
            Digital Munshi Load Ho Raha Hai...
          </p>

        </div>

      </div>
    );
  }

  /*
   * -----------------------------------------
   * PASSWORD RESET SCREEN
   * -----------------------------------------
   */

  if (passwordRecovery) {

    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">

        <div className="w-full max-w-md">

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xl">

            <div className="text-center mb-6">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#1e3a29] text-white flex items-center justify-center text-2xl">
                🔐
              </div>

              <h1 className="mt-4 text-2xl font-serif font-bold text-[#1e3a29]">
                Set New Password
              </h1>

              <p className="text-xs text-stone-500 mt-2">
                Apna naya password enter karein.
              </p>

            </div>

            {passwordError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl font-medium">
                {passwordMessage}
              </div>
            )}

            <form
              onSubmit={handlePasswordUpdate}
              className="space-y-4"
            >

              <div>

                <label className="text-[10px] text-stone-600 font-bold block mb-1.5">
                  NEW PASSWORD
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Example: Munshi@123"
                  autoComplete="new-password"
                  className="w-full p-3.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]"
                />

              </div>

              <div>

                <label className="text-[10px] text-stone-600 font-bold block mb-1.5">
                  CONFIRM PASSWORD
                </label>

                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Password dobara enter karein"
                  autoComplete="new-password"
                  className="w-full p-3.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#1e3a29]"
                />

              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">

                <p className="text-[10px] font-bold text-emerald-900 mb-1">
                  🔐 Password requirements
                </p>

                <p className="text-[9px] text-emerald-800">
                  ✓ 6+ characters
                </p>

                <p className="text-[9px] text-emerald-800">
                  ✓ 1 Capital letter
                </p>

                <p className="text-[9px] text-emerald-800">
                  ✓ 1 Small letter
                </p>

                <p className="text-[9px] text-emerald-800">
                  ✓ 1 Number
                </p>

              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full bg-[#1e3a29] text-white py-3.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#162c1f] transition disabled:opacity-50"
              >
                {updatingPassword
                  ? 'Updating Password...'
                  : 'Update Password'}
              </button>

            </form>

          </div>

        </div>

      </div>
    );
  }

  /*
   * -----------------------------------------
   * PRIVACY / TERMS
   * -----------------------------------------
   */

  if (activeTab === 'privacy') {
    return (
      <PrivacyPolicy
        onBack={() => setActiveTab('home')}
      />
    );
  }

  if (activeTab === 'terms') {
    return (
      <Terms
        onBack={() => setActiveTab('home')}
      />
    );
  }

  /*
   * -----------------------------------------
   * NOT LOGGED IN
   * -----------------------------------------
   */

  if (!user) {

    return (
      <LandingPage
        onLogin={handleLogin}
        onOpenPolicy={(policy) =>
          setActiveTab(policy)
        }
      />
    );
  }

  /*
   * -----------------------------------------
   * MAIN APP
   * -----------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-20">

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleDrawer={toggleDrawer}
      />

      <Drawer
        isOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
      />

      <main>

        {activeTab === 'home' && (
          <Dashboard
            setActiveTab={setActiveTab}
            onSelectKisaan={handleSelectKisaan}
          />
        )}

        {activeTab === 'kisaan' && (
          <KisaanDetail
            kisaanId={selectedKisaanId}
            onBack={() =>
              setActiveTab('zameendar')
            }
          />
        )}

        {activeTab === 'godaam' && (
          <Godaam />
        )}

        {activeTab === 'tijori' && (
          <Tijori />
        )}

        {activeTab === 'zameendar' && (
          <Zameendar
            onSelectKisaan={handleSelectKisaan}
          />
        )}

        {activeTab === 'khatabook' && (
          <KhataBook />
        )}

      </main>

    </div>
  );
}
