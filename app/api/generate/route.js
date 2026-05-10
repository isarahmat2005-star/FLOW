import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token, prompt, model, aspectRatio } = await req.json();

    // Project ID rahasia yang kita dapatkan dari Inspect Element
    const projectId = "cd7643fb-9500-4973-a185-0350a90ad361"; 

    // Merakit Payload Baru menyesuaikan sistem "PINHOLE"
    const payload = {
      clientContext: { 
        projectId: projectId,
        tool: "PINHOLE" 
      },
      mediaGenerationContext: {
        // Membuat Batch ID acak agar tidak dicurigai server
        batchId: "batch_" + Math.random().toString(36).substring(2, 15)
      },
      requests: [
        {
          clientContext: {
            projectId: projectId,
            tool: "PINHOLE"
          },
          imageAspectRatio: aspectRatio || "IMAGE_ASPECT_RATIO_SQUARE",
          imageInputs: [],
          imageModelName: model,
          seed: Math.floor(Math.random() * 9999999) + 1,
          structuredPrompt: {
            parts: [
              { text: prompt }
            ]
          },
          useNewMedia: true
        }
      ]
    };

    // Menembak ke URL Endpoint yang baru
    const response = await fetch(`https://aisandbox-pa.googleapis.com/v1/projects/${projectId}/flowMediaBatchGenerateImages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Menangkap pesan error dari Google agar kita tahu kalau gagal alasannya apa
      const errorText = await response.text();
      console.error("Ditolak Google:", errorText);
      return NextResponse.json({ error: "Ditolak Google", details: errorText, model: model }, { status: 400 });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data, model: model });

  } catch (error) {
    console.error("Server Vercel Error:", error);
    return NextResponse.json({ error: "Gagal server", model: model }, { status: 500 });
  }
}
