import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token, prompt, model, aspectRatio } = await req.json();

    const projectId = "cd7643fb-9500-4973-a185-0350a90ad361"; 

    const payload = {
      clientContext: { 
        projectId: projectId,
        tool: "PINHOLE" 
      },
      mediaGenerationContext: {
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

    // PERBAIKAN URL: Kita arahkan tepat ke dalam jalur "flowWorkflows"
    const endpointUrl = `https://aisandbox-pa.googleapis.com/v1/flowWorkflows:flowMediaBatchGenerateImages`;

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
      console.error("Ditolak Google:", errorText);
      return NextResponse.json({ error: "Ditolak Google", details: errorText, model: model }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data, model: model });

  } catch (error) {
    console.error("Server Vercel Error:", error);
    return NextResponse.json({ error: "Gagal server", model: model }, { status: 500 });
  }
}
