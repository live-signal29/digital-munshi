import React from 'react';

export default function Drawer({
  isOpen,
  toggleDrawer,
  setActiveTab,
  onLogout,
  user
}) {
  if (!isOpen) return null;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    toggleDrawer();
  };

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    'Digital Munshi User';

  const contact =
    user?.email ||
    user?.phone ||
    'Account information unavailable';

  return (
    <div className="fixed inset-0 z-50 flex">

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={toggleDrawer}
      />

      {/* Drawer */}
      <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10">

        <div className="space-y-5">

          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3">

            <div className="flex items-center gap-2">

              <span className="text-2xl">🌾</span>

              <div>
                <h2 className="font-serif font-bold text-[#1e3a29]">
                  Digital Munshi
                </h2>

                <p className="text-[10px] text-stone-500">
                  Menu & Settings
                </p>
              </div>

            </div>

            <button
              onClick={toggleDrawer}
              className="text-stone-400 text-lg font-bold hover:text-stone-600"
            >
              ✕
            </button>

          </div>

          {/* USER PROFILE */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-[#1e3a29] text-white flex items-center justify-center font-bold text-sm">
                {fullName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-xs font-bold text-[#1e3a29] truncate">
                  {fullName}
                </p>

                <p className="text-[10px] text-stone-500 truncate mt-0.5">
                  {contact}
                </p>

              </div>

            </div>

            <div className="mt-2 pt-2 border-t border-emerald-100">

              <p className="text-[9px] text-emerald-800 font-medium">
                ✓ Logged in account
              </p>

            </div>

          </div>

          {/* Menu Items */}
          <div className="space-y-1">

            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-2.5"
            >
              <span>🏠</span>
              Home Dashboard
            </button>

            <button
              onClick={() => handleNavClick('kisaan')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-2.5"
            >
              <span>🚜</span>
              Kisaan Khaata
            </button>

            <button
              onClick={() => handleNavClick('godaam')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-2.5"
            >
              <span>🏪</span>
              Godaam Stock
            </button>

            <button
              onClick={() => handleNavClick('tijori')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-2.5"
            >
              <span>🔒</span>
              Tijori Safe
            </button>

            <button
              onClick={() => handleNavClick('khatabook')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-2.5"
            >
              <span>📚</span>
              Khata Book (Roznamcha)
            </button>

            <button
              onClick={() => handleNavClick('zameendar')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-2.5"
            >
              <span>👤</span>
              Zameendar Dashboard
            </button>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t pt-3 space-y-2">

          <div className="flex justify-between items-center text-[10px] text-stone-500 px-1">

            <button
              onClick={() => handleNavClick('privacy')}
              className="hover:underline"
            >
              Privacy Policy
            </button>

            <span>•</span>

            <button
              onClick={() => handleNavClick('terms')}
              className="hover:underline"
            >
              Terms of Service
            </button>

          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 text-xs font-bold text-rose-700 bg-rose-50 rounded-xl hover:bg-rose-100 transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            Logout Account
          </button>

        </div>

      </div>

    </div>
  );
}
