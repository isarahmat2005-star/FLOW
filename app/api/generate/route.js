import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, prompt, model, aspectRatio, sampleCount } = body;

    // Mapping nama model sesuai kemungkinan besar di endpoint whisk
    // Kita coba konversi nama di dropdown ke kode mesin yang umum di Google Labs
    let internalModelName = model;
    if (model === "NANO_BANANA_PRO") internalModelName = "NANO_BANANA_PRO_V1";
    if (model === "NANO_BANANA_2") internalModelName = "NANO_BANANA_2_V1";
    if (model === "IMAGEN_4") internalModelName = "IMAGEN_4_ALPHA"; 

    const payload = {
      clientContext: { 
        workflowId: "irs_flow_" + Math.random().toString(36).substring(7), // Wajib ada
        tool: "BACKBONE" 
      },
      imageModelSettings: { 
        imageModel: internalModelName, 
        aspectRatio: aspectRatio 
      },
      mediaCategory: "MEDIA_CATEGORY_BOARD",
      prompt: prompt,
      seed: Math.floor(Math.random() * 9999999) + 1, // Wajib agar tidak Error 400[cite: 1]
      sampleCount: sampleCount
    };

    const response = await fetch('https://aisandbox-pa.googleapis.com/v1/whisk:generateImage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Format Bearer sangat krusial[cite: 1]
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Server Google Menolak (400): ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Gagal terhubung ke jembatan API." }, { status: 500 });
  }
        }
