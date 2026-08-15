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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={toggleDrawer}
      />

      {/* Drawer */}
      <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 transition-transform duration-300">

        <div className="space-y-4">

          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3">

            <div className="flex items-center gap-2">

              <span className="text-2xl">🌾</span>

              <div>
                <h2 className="font-serif font-bold text-[#1e3a29] text-base leading-tight">
                  Digital Munshi
                </h2>

                <p className="text-[10px] text-stone-500 font-medium">
                  Menu & Settings
                </p>
              </div>

            </div>

            <button
              onClick={toggleDrawer}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition"
            >
              ✕
            </button>

          </div>

          {/* PROFESSIONAL USER PROFILE CARD */}
          <div className="bg-gradient-to-br from-[#1e3a29] to-[#122419] text-white rounded-2xl p-3.5 shadow-md border border-emerald-800/40 relative overflow-hidden">
            
            {/* Subtle background glow circle */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center gap-3 relative z-10">

              {/* Avatar with Status Dot */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-emerald-700/80 border-2 border-emerald-400/40 flex items-center justify-center font-bold text-base text-white shadow-inner">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#1e3a29] rounded-full"></span>
              </div>

              {/* User Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-white truncate">
                    {fullName}
                  </p>
                </div>

                <p className="text-[11px] text-emerald-200/80 truncate mt-0.5">
                  {contact}
                </p>
              </div>

            </div>

            {/* Account Status Badge & Link */}
            <div className="mt-3 pt-2.5 border-t border-emerald-700/40 flex items-center justify-between text-[10px] relative z-10">
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Account
              </span>

              <span className="text-emerald-300/80 font-medium">
                Zameendar
              </span>
            </div>

          </div>

          {/* Menu Items */}
          <div className="space-y-1 pt-1">

            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-3 transition"
            >
              <span className="text-base">🏠</span>
              Home Dashboard
            </button>

            <button
              onClick={() => handleNavClick('kisaan')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-3 transition"
            >
              <span className="text-base">🚜</span>
              Kisaan Khaata
            </button>

            <button
              onClick={() => handleNavClick('godaam')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-3 transition"
            >
              <span className="text-base">🏪</span>
              Godaam Stock
            </button>

            <button
              onClick={() => handleNavClick('tijori')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-3 transition"
            >
              <span className="text-base">🔒</span>
              Tijori Safe
            </button>

            <button
              onClick={() => handleNavClick('khatabook')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-3 transition"
            >
              <span className="text-base">📚</span>
              Khata Book (Roznamcha)
            </button>

            <button
              onClick={() => handleNavClick('zameendar')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] flex items-center gap-3 transition"
            >
              <span className="text-base">👤</span>
              Zameendar Dashboard
            </button>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t pt-3 space-y-2.5">

          <div className="flex justify-between items-center text-[10px] text-stone-500 px-2 font-medium">

            <button
              onClick={() => handleNavClick('privacy')}
              className="hover:text-stone-800 transition"
            >
              Privacy Policy
            </button>

            <span>•</span>

            <button
              onClick={() => handleNavClick('terms')}
              className="hover:text-stone-800 transition"
            >
              Terms of Service
            </button>

          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 text-xs font-bold text-rose-700 bg-rose-50 rounded-xl hover:bg-rose-100 transition flex items-center justify-center gap-2 border border-rose-100"
          >
            <span>🚪</span>
            Logout Account
          </button>

        </div>

      </div>

    </div>
  );
}
