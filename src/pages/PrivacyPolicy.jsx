import React from 'react';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="p-4 max-w-md mx-auto space-y-4 bg-white min-h-screen text-xs text-stone-700">
      <button 
        onClick={onBack} 
        className="text-[#1e3a29] font-bold flex items-center gap-1 mb-2"
      >
        ← Wapas Jayein
      </button>

      <h1 className="text-xl font-serif font-bold text-[#1e3a29]">Privacy Policy</h1>
      <p className="text-[10px] text-stone-400">Aakhri Tarseem: August 2026</p>

      <div className="space-y-3 leading-relaxed">
        <section>
          <h2 className="font-bold text-stone-900 mb-1">1. Data Security (Aapka Data Mehfooz Hai)</h2>
          <p>Digital Munshi par aapka tamam zameendari data, Kisaan ke khate, Godaam stock, aur Tijori ka hisaab bilkul confidential rakha jata hai. Hum aapka data kisi teesray shakhs ko nahi bechte.</p>
        </section>

        <section>
          <h2 className="font-bold text-stone-900 mb-1">2. Data Collection (Konsa Data Savel Hota Hai)</h2>
          <p>Hum sirf wo maloomat save karte hain jo aap app me khud enter karte hain (jaise Kashtkaar ka naam, acreage, jama-kharch entries, aur login credentials).</p>
        </section>

        <section>
          <h2 className="font-bold text-stone-900 mb-1">3. Cloud Backup</h2>
          <p>Aapka record Supabase Cloud Database par encrypted form me save hota hai taake mobile ghum jaane ki sorat me bhi aapka data safe rahe.</p>
        </section>
      </div>
    </div>
  );
}
