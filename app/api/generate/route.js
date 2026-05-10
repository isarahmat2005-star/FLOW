import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token, prompt, model, aspectRatio } = await req.json();

    // FORMAT PAYLOAD LAMA (WHISK) YANG TIDAK BUTUH RECAPTCHA!
    const payload = {
      clientContext: { 
        workflowId: "test_" + Math.random().toString(36).substring(7),
        tool: "BACKBONE" 
      },
      imageModelSettings: { 
        imageModel: model, // Di sini kita selipkan GEM_PIX_2
        aspectRatio: aspectRatio || "IMAGE_ASPECT_RATIO_SQUARE" 
      },
      mediaCategory: "MEDIA_CATEGORY_BOARD",
      prompt: prompt,
      seed: Math.floor(Math.random() * 9999999) + 1
    };

    // TEMBAK KE URL PINTU BELAKANG LAMA
    const endpointUrl = `https://aisandbox-pa.googleapis.com/v1/whisk:generateImage`;

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: "Ditolak Google", details: errorText, model: model }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data, model: model });

  } catch (error) {
    return NextResponse.json({ error: "Gagal server", model: model }, { status: 500 });
  }
}
