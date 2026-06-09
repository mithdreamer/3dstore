(function () {
  const resizeImage = (file, maxSize = 1200, quality = 0.84) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const filesToImages = async (files) => {
    const imageFiles = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
    return Promise.all(imageFiles.slice(0, 6).map((file) => resizeImage(file)));
  };

  const renderPreview = (container, images) => {
    if (!container) return;
    container.innerHTML = images.length
      ? images.map((src) => `<img src="${src}" alt="Ürün görseli önizleme">`).join("")
      : `<p class="muted">Henüz görsel seçilmedi.</p>`;
  };

  window.ImageUpload = {
    filesToImages,
    renderPreview
  };
})();
