const analyzeImage = () => {
    if (!imageURL) {
      alert('Please enter an image URL.');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = imageData.data;

      let minColor = [255, 255, 255];
      let maxColor = [0, 0, 0];
      let totalColor = [0, 0, 0];

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        minColor = [
          Math.min(minColor[0], r),
          Math.min(minColor[1], g),
          Math.min(minColor[2], b),
        ];

        maxColor = [
          Math.max(maxColor[0], r),
          Math.max(maxColor[1], g),
          Math.max(maxColor[2], b),
        ];

        totalColor[0] += r;
        totalColor[1] += g;
        totalColor[2] += b;
      }

      const pixelCount = pixels.length / 4;
      const avgColor = [
        Math.round(totalColor[0] / pixelCount),
        Math.round(totalColor[1] / pixelCount),
        Math.round(totalColor[2] / pixelCount),
      ];

      setMinColor(minColor);
      setMaxColor(maxColor);
      setAvgColor(avgColor);
    };

    img.src = imageURL;
  };
