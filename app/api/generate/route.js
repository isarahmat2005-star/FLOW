import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, prompt, aspectRatio } = body;

    // DAFTAR TEBAKAN NAMA SANDI (Biar Vercel yang ngetes satu-satu dengan super cepat)
    const possibleModels = [
      "NANO_BANANA_PRO", "NANO_BANANA_2", "NANO_BANANA",
      "NANO_BANANA_PRO_V1", "NANO_BANANA_2_V1", "NANO_BANANA_V1",
      "NANO_BANANA_PRO_ALPHA", "NANO_BANANA_2_ALPHA",
      "IMAGEN_4", "IMAGEN_4_PRO", "IMAGEN_4_ALPHA", "IMAGEN_4_V1",
      "IMAGE_MODEL_NANO_BANANA_PRO", "MODEL_NANO_BANANA_2",
      "IMAGEN_3_5" // Kita taruh ini di akhir sebagai cadangan terakhir
    ];

    let foundModel = null;
    let lastError = null;

    // Vercel akan mencoba mengirim pesanan dengan nama model yang berbeda-beda
    for (const testModel of possibleModels) {
      console.log(`Sedang mencoba menembus dengan model: ${testModel}...`);
      
      const payload = {
        clientContext: { 
          workflowId: "scanner_" + Math.random().toString(36).substring(7),
          tool: "BACKBONE" 
        },
        imageModelSettings: { 
          imageModel: testModel, 
          aspectRatio: aspectRatio || "IMAGE_ASPECT_RATIO_SQUARE" 
        },
        mediaCategory: "MEDIA_CATEGORY_BOARD",
        prompt: prompt,
        seed: Math.floor(Math.random() * 9999999) + 1
      };

      const response = await fetch('https://aisandbox-pa.googleapis.com/v1/whisk:generateImage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // JACKPOT! Tidak Error 400!
        foundModel = testModel;
        const data = await response.json();
        
        // Kembalikan gambar plus NAMA MODEL YANG BERHASIL agar muncul di layarmu
        return NextResponse.json({
          success: true,
          message: `🔥 BERHASIL TEMBUS! Nama sandinya adalah: ${testModel}`,
          data: data
        });
      } else {
        // Jika gagal, simpan errornya dan lanjut tebak nama berikutnya
        lastError = await response.text();
      }
    }

    // Jika semua tebakan habis dan gagal semua
    return NextResponse.json({ 
      error: `Gagal menembus semua tebakan. Error terakhir: ${lastError}` 
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: "Gagal terhubung ke server." }, { status: 500 });
  }
  }
