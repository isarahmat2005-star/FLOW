import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, prompt, model, aspectRatio, sampleCount } = body;

    const payload = {
      clientContext: { tool: "BACKBONE" },
      imageModelSettings: { imageModel: model, aspectRatio: aspectRatio },
      mediaCategory: "MEDIA_CATEGORY_BOARD",
      prompt: prompt,
      sampleCount: sampleCount
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
      return NextResponse.json({ error: `Akses ditolak: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Gagal terhubung ke server." }, { status: 500 });
  }
      }
