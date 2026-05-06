import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token, prompt, model, aspectRatio } = await req.json();

    const payload = {
      clientContext: { 
        workflowId: "test_" + Math.random().toString(36).substring(7),
        tool: "BACKBONE" 
      },
      imageModelSettings: { 
        imageModel: model, 
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

    if (!response.ok) {
      // Jika error 400, kita langsung kembalikan status gagal agar tampilan web tahu model ini salah
      return NextResponse.json({ error: "Ditolak Google", model: model }, { status: 400 });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data, model: model });

  } catch (error) {
    return NextResponse.json({ error: "Gagal server", model: model }, { status: 500 });
  }
}
