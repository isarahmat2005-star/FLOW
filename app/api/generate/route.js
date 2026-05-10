import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token, prompt, model, aspectRatio } = await req.json();

    const projectId = "cd7643fb-9500-4973-a185-0350a90ad361"; 

    // PASTE TOKEN RECAPTCHA FRESH DARI INSPECT ELEMENT KE SINI
    const recaptchaToken = "PASTE_TOKEN_RECAPTCHA_YANG_PANJANG_BANGET_DISINI";
    const sessionId = ";1778390754464"; // Sesuaikan dengan yang ada di Inspect Element

    const payload = {
      clientContext: { 
        projectId: projectId,
        tool: "PINHOLE",
        // KITA SOGOK SATPAMNYA DENGAN RECAPTCHA FRESH
        recaptchaContext: {
          applicationType: "RECAPTCHA_APPLICATION_TYPE_WEB",
          token: recaptchaToken,
          sessionId: sessionId
        }
      },
      mediaGenerationContext: {
        batchId: "batch_" + Math.random().toString(36).substring(2, 15)
      },
      requests: [
        {
          clientContext: {
            projectId: projectId,
            tool: "PINHOLE",
            recaptchaContext: {
              applicationType: "RECAPTCHA_APPLICATION_TYPE_WEB",
              token: recaptchaToken,
              sessionId: sessionId
            }
          },
          imageAspectRatio: aspectRatio || "IMAGE_ASPECT_RATIO_SQUARE",
          imageModelName: model,
          seed: Math.floor(Math.random() * 9999999) + 1,
          structuredPrompt: {
            parts: [{ text: prompt }]
          }
        }
      ],
      useNewMedia: true 
    };

    const endpointUrl = `https://aisandbox-pa.googleapis.com/v1/projects/${projectId}/flowMedia:batchGenerateImages`;

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
