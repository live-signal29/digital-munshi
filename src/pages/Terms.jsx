import React from 'react';

export default function Terms({ onBack }) {
  return (
    <div className="p-4 max-w-md mx-auto space-y-4 bg-white min-h-screen text-xs text-stone-700">
      <button 
        onClick={onBack} 
        className="text-[#1e3a29] font-bold flex items-center gap-1 mb-2"
      >
        ← Wapas Jayein
      </button>

      <h1 className="text-xl font-serif font-bold text-[#1e3a29]">Terms & Conditions</h1>
      <p className="text-[10px] text-stone-400">Aakhri Tarseem: August 2026</p>

      <div className="space-y-3 leading-relaxed">
        <section>
          <h2 className="font-bold text-stone-900 mb-1">1. Istemaal Ke Sharaait</h2>
          <p>Digital Munshi app sirf Zameendar, Munshi, aur Kashtkaaron ke roznamcha hisaab kitaab ke liye banayi gayi hai. Is app ko kisi gair-qanooni kaam ke liye istemaal karne ki ijazat nahi hai.</p>
        </section>

        <section>
          <h2 className="font-bold text-stone-900 mb-1">2. Accounts Aur Security</h2>
          <p>Aap apne account password aur login detail ki hifazat ke khud zimmedar hain. Apna password kisi ghair mutaliqa shakhs ko na dein.</p>
        </section>

        <section>
          <h2 className="font-bold text-stone-900 mb-1">3. Record Ki Sahi Entries</h2>
          <p>App me darj kiye gaye hisaab kitaab ki sahih hona user par munhasir hai. Digital Munshi ghalti se ki gayi entries par kisi maali nuqsan ka zimmedar nahi hoga.</p>
        </section>
      </div>
    </div>
  );
}
