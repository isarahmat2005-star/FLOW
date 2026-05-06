"use client";

import React, { useState } from 'react';
import { Sparkles, Key, Image as ImageIcon, Layers, Download, Trash2, Loader2 } from 'lucide-react';

export default function Home() {
  const [token, setToken] = useState('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('NANO_BANANA_PRO');
  const [aspectRatio, setAspectRatio] = useState('IMAGE_ASPECT_RATIO_SQUARE');
  const [count, setCount] = useState(1);
  const [downloadRes, setDownloadRes] = useState('1K');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState({ msg: '', type: '' });

  const handleGenerate = async () => {
    if (!token.trim()) return setStatus({ msg: 'Token tidak boleh kosong!', type: 'error' });
    if (!prompt.trim()) return setStatus({ msg: 'Prompt tidak boleh kosong!', type: 'error' });

    setIsGenerating(true);
    setStatus({ msg: '', type: '' });

    try {
      // Mengirim data ke API lokal kita (app/api/generate/route.js)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          prompt: prompt.trim(),
          model: model,
          aspectRatio: aspectRatio,
          sampleCount: count
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal membuat gambar");

      // Mengekstrak gambar dari respons bersarang Google Labs
      if (data && data.imagePanels && data.imagePanels.length > 0) {
        const newImages = [];
        data.imagePanels.forEach(panel => {
          if (panel.generatedImages) {
            panel.generatedImages.forEach(img => {
              if (img.encodedImage) {
                newImages.push({
                  id: Date.now() + Math.random(),
                  base64: img.encodedImage,
                  prompt: prompt
                });
              }
            });
          }
        });

        if (newImages.length > 0) {
          setImages(prev => [...newImages, ...prev]);
          setStatus({ msg: 'Berhasil di-generate!', type: 'success' });
        } else {
          throw new Error("Tidak ada gambar di dalam respons balasan.");
        }
      } else {
         throw new Error("Format respons tidak sesuai atau token kadaluarsa.");
      }

    } catch (err) {
      setStatus({ msg: err.message, type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (base64Data, promptText) => {
    // Logika sederhana untuk simulasi resolusi 
    // (Resolusi asli tergantung output model, tapi ini menyiapkan nama file khusus)
    const resPrefix = downloadRes === '2K' ? 'HQ_2K_' : 'STD_1K_';
    const cleanName = promptText.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
    
    const a = document.createElement('a');
    a.href = `data:image/png;base64,${base64Data}`;
    a.download = `FLOW_${resPrefix}${cleanName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* SIDEBAR CONTROL PANEL */}
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 shadow-sm flex flex-col h-full z-10 flex-shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-20 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">FLOW</h1>
            <p className="text-xs font-semibold text-indigo-600 tracking-widest uppercase mt-0.5">by IRS</p>
          </div>
          <Sparkles className="text-indigo-500" size={24} />
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
          {/* API Configuration */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Key size={14} /> API Token
              </label>
              <a href="https://labs.google/fx/api/auth/session" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded transition-colors">
                Get Token
              </a>
            </div>
            <input 
              type="password" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste 'ya29...' token" 
              className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '16:9', val: 'IMAGE_ASPECT_RATIO_LANDSCAPE' },
                  { label: '1:1', val: 'IMAGE_ASPECT_RATIO_SQUARE' },
                  { label: '9:16', val: 'IMAGE_ASPECT_RATIO_PORTRAIT' }
                ].map((ratio) => (
                  <button 
                    key={ratio.label}
                    onClick={() => setAspectRatio(ratio.val)}
                    className={`py-2 rounded-md text-xs font-medium transition-all ${
                      aspectRatio === ratio.val 
                      ? 'border-2 border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' 
                      : 'border border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Size */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Batch Size (Per Prompt)</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button 
                    key={num}
                    onClick={() => setCount(num)}
                    className={`py-1.5 rounded-md text-xs transition-all ${
                      count === num 
                      ? 'border-2 border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' 
                      : 'border border-slate-200 bg-white hover:bg-slate-50 font-medium'
                    }`}
                  >
                    x{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">AI Model</label>
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="NANO_BANANA_PRO">🍌 Nano Banana Pro</option>
                <option value="NANO_BANANA_2">🍌 Nano Banana 2</option>
                <option value="IMAGEN_4">✨ Imagen 4</option>
              </select>
            </div>
            
            {/* Prompt Input */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Prompt Idea</label>
              <textarea 
                rows="4" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Deskripsikan gambar yang ingin Anda buat..." 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 sticky bottom-0 z-20">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <><Sparkles size={18} /> Generate Image</>}
          </button>
          
          {status.msg && (
            <div className={`mt-3 text-xs text-center font-medium p-2 rounded block ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              {status.msg}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN GALLERY AREA */}
      <main className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between flex-shrink-0 shadow-sm z-10">
          <h2 className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} /> Output Gallery <span className="text-slate-400 font-normal ml-1">({images.length})</span>
          </h2>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center bg-slate-100 rounded-md p-1 border border-slate-200">
              <label className="text-[10px] md:text-xs font-bold text-slate-500 px-2">Res:</label>
              <select value={downloadRes} onChange={(e) => setDownloadRes(e.target.value)} className="bg-white border border-slate-300 text-xs rounded px-1 md:px-2 py-1 outline-none font-medium cursor-pointer">
                <option value="1K">1K Standard</option>
                <option value="2K">2K High-Res</option>
              </select>
            </div>
            <button onClick={() => setImages([])} className="px-2 md:px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-all flex items-center gap-1">
              <Trash2 size={14} /> <span className="hidden sm:inline">Clear All</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {images.length === 0 && !isGenerating ? (
            <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
              <ImageIcon size={64} className="mb-4 text-slate-300" strokeWidth={1} />
              <p className="text-lg font-medium text-slate-500">The canvas is empty</p>
              <p className="text-sm">Configure your settings and hit generate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
              {images.map((img) => (
                <div key={img.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="relative aspect-square bg-slate-100 border-b border-slate-100">
                    <img src={`data:image/png;base64,${img.base64}`} alt="Generated" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button onClick={() => handleDownload(img.base64, img.prompt)} className="p-3 bg-white text-slate-800 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-lg active:scale-95" title="Download">
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{img.prompt}</p>
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
