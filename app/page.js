"use client";

import React, { useState } from 'react';
import { Sparkles, Key, Image as ImageIcon, Layers, Download, Trash2, Loader2, Target } from 'lucide-react';

export default function Home() {
  const [token, setToken] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('IMAGE_ASPECT_RATIO_SQUARE');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState({ msg: '', type: '' });

  // DAFTAR MODEL YANG AKAN DITES SECARA BERSAMAAN
  // Kita tambahkan GEM_PIX_2 yang baru saja ditemukan dari Inspect Element!
  const modelsToTest = [
    "GEM_PIX_2", // Nama sandi asli internal Google (Wajib Tes Pertama)
    "NANO_BANANA_PRO", 
    "NANO_BANANA_2", 
    "NANO_BANANA",
    "IMAGEN_4",
    "IMAGEN_3_5"
  ];

  const handleGenerate = async () => {
    if (!token.trim()) return setStatus({ msg: 'Token dibutuhkan!', type: 'error' });
    if (!prompt.trim()) return setStatus({ msg: 'Prompt tidak boleh kosong!', type: 'error' });

    setIsGenerating(true);
    setStatus({ msg: 'Sedang menembak API ke berbagai sandi model...', type: 'process' });
    let successCount = 0;

    // Kita jalankan semua tes model satu per satu
    for (const testModel of modelsToTest) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token.trim(),
            prompt: prompt.trim(),
            model: testModel,
            aspectRatio: aspectRatio
          })
        });

        if (response.ok) {
          const resData = await response.json();
          
          // Ekstrak gambar jika berhasil
          if (resData.data && resData.data.imagePanels) {
            resData.data.imagePanels.forEach(panel => {
              if (panel.generatedImages) {
                panel.generatedImages.forEach(img => {
                  if (img.encodedImage) {
                    successCount++;
                    setImages(prev => [{
                      id: Date.now() + Math.random(),
                      base64: img.encodedImage,
                      prompt: prompt,
                      modelName: testModel // SIMPAN NAMA MODEL YANG BERHASIL
                    }, ...prev]);
                  }
                });
              }
            });
          }
        }
      } catch (err) {
        console.error(`Model ${testModel} gagal:`, err);
      }
    }

    setIsGenerating(false);
    if (successCount > 0) {
      setStatus({ msg: `Jackpot! ${successCount} gambar berhasil tembus dari model yang valid.`, type: 'success' });
    } else {
      setStatus({ msg: 'Semua tebakan model gagal. Cek kembali token atau API Backend.', type: 'error' });
    }
  };

  const handleDownload = (base64Data, promptText) => {
    const cleanName = promptText.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '_');
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${base64Data}`;
    a.download = `FLOW_QC_${cleanName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 shadow-sm flex flex-col h-full z-10 flex-shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-20 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">FLOW</h1>
            <p className="text-xs font-semibold text-indigo-600 tracking-widest uppercase mt-0.5">by IRS</p>
          </div>
          <Target className="text-indigo-500" size={24} />
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5"><Key size={14} /> API Token</label>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste token ya29..." className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-mono" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Aspect Ratio (Resolusi)</label>
              <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm outline-none font-medium">
                <option value="IMAGE_ASPECT_RATIO_SQUARE">1:1 (Square)</option>
                <option value="IMAGE_ASPECT_RATIO_LANDSCAPE">16:9 (Landscape)</option>
                <option value="IMAGE_ASPECT_RATIO_PORTRAIT">9:16 (Portrait)</option>
              </select>
            </div>
            
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Prompt Uji Coba</label>
              <textarea rows="3" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Misal: mockup green screen" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm" />
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                <strong>Mode Radar:</strong> Saat klik Generate, sistem akan menembak prompt ini ke semua daftar nama model (termasuk GEM_PIX_2) untuk mencari mana yang masih aktif di server Flow.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 sticky bottom-0 z-20">
          <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2">
            {isGenerating ? <><Loader2 className="animate-spin" size={18} /> Menembus Server...</> : <><Sparkles size={18} /> Mulai Tes Resolusi & Model</>}
          </button>
          
          {status.msg && (
            <div className={`mt-3 text-xs text-center font-medium p-2 rounded block ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
              {status.msg}
            </div>
          )}
        </div>
      </aside>

      {/* GALLERY */}
      <main className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
          <h2 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
            <Layers size={16} /> Hasil Eksekusi <span className="text-slate-400 font-normal">({images.length})</span>
          </h2>
          <button onClick={() => setImages([])} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md flex items-center gap-1 transition-colors">
            <Trash2 size={14} /> Bersihkan Layar
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ImageIcon size={48} className="mb-4 text-slate-300" />
              <p className="font-medium text-slate-500">Menunggu tembakan pertama...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 content-start">
              {images.map((img) => (
                <div key={img.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative group">
                  {/* LABEL NAMA MODEL (Lebih mencolok agar gampang dianalisis) */}
                  <div className="absolute top-3 left-3 z-10 bg-slate-900/80 text-emerald-400 text-[11px] font-black tracking-widest px-2.5 py-1.5 rounded shadow border border-slate-700 backdrop-blur-md">
                    {img.modelName}
                  </div>
                  
                  {/* Container yang dimodifikasi agar support Landscape/Portrait */}
                  <div className="relative h-72 w-full bg-slate-100 flex items-center justify-center overflow-hidden p-2">
                    <img src={`data:image/png;base64,${img.base64}`} alt="Generated" className="max-w-full max-h-full object-contain rounded drop-shadow-sm" />
                    
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <button onClick={() => handleDownload(img.base64, img.prompt)} className="p-4 bg-white text-slate-900 rounded-full hover:bg-indigo-500 hover:text-white shadow-xl transform scale-90 group-hover:scale-100 transition-all">
                        <Download size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
