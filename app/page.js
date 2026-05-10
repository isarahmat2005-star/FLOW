const handleGenerate = async () => {
    if (!token.trim()) return setStatus({ msg: 'Token dibutuhkan!', type: 'error' });
    if (!prompt.trim()) return setStatus({ msg: 'Prompt tidak boleh kosong!', type: 'error' });

    setIsGenerating(true);
    setStatus({ msg: 'Menjalankan pengujian model GEM_PIX_2...', type: 'process' });
    let successCount = 0;

    for (const testModel of modelsToTest) {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token.trim(),
            prompt: prompt.trim(),
            model: testModel,
            aspectRatio: aspectRatio
          })
        });

        if (response.ok) {
          const resData = await response.json();
          
          // PERUBAHAN: Ekstrak fifeUrl dari JSON baru Google
          if (resData.data && resData.data.media) {
            resData.data.media.forEach(mediaItem => {
              if (mediaItem.image && mediaItem.image.generatedImage && mediaItem.image.generatedImage.fifeUrl) {
                successCount++;
                setImages(prev => [{
                  id: Date.now() + Math.random(),
                  url: mediaItem.image.generatedImage.fifeUrl, // Kita simpan URL-nya, bukan Base64
                  prompt: prompt,
                  modelName: testModel
                }, ...prev]);
              }
            });
          }
        }
      } catch (err) {
        console.error(`Model ${testModel} gagal:`, err);
      }
    }

    setIsGenerating(false);
    if (successCount > 0) {
      setStatus({ msg: `Berhasil! Model merespon dengan ${successCount} gambar.`, type: 'success' });
    } else {
      setStatus({ msg: 'Gagal ekstrak gambar. Cek Console atau Token.', type: 'error' });
    }
  };

  const handleDownload = async (imageUrl, promptText) => {
    try {
      const cleanName = promptText.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '_');
      // Karena ini URL, kita harus fetch datanya dulu agar bisa didownload
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `FLOW_FX_${cleanName}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Gagal mendownload gambar:", error);
      alert("Gagal mendownload. Silakan klik kanan gambar dan 'Save As'.");
    }
  };
