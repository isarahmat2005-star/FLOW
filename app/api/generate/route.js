import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    // Kita hapus penerimaan sampleCount
    const { token, prompt, aspectRatio } = body;

    const payload = {
      clientContext: { 
        workflowId: "flow_irs_" + Math.random().toString(36).substring(7),
        tool: "BACKBONE" 
      },
      imageModelSettings: { 
        // KITA PAKSA PAKAI INI DULU AGAR TEMBUS
        imageModel: "NANO_BANANA_PRO", 
        aspectRatio: aspectRatio 
      },
      mediaCategory: "MEDIA_CATEGORY_BOARD",
      prompt: prompt,
      seed: Math.floor(Math.random() * 9999999) + 1 // Wajib ada
    };

    const response = await fetch('https://aisandbox-pa.googleapis.com/v1/whisk:generateImage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Gagal (400): ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Gagal terhubung ke jembatan API." }, { status: 500 });
  }
}
