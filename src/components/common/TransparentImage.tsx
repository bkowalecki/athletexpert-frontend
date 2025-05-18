import React, { useEffect, useRef, useState } from "react";

interface TransparentImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

const TransparentImage: React.FC<TransparentImageProps> = ({
  src,
  alt = "",
  width = 300,
  height = 300,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Required for external URLs
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const threshold = 240;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        if (r > threshold && g > threshold && b > threshold) {
          const fade = 255 - ((brightness - threshold) / (255 - threshold)) * 255;
          data[i + 3] = Math.max(0, Math.min(fade, 255));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const finalImg = canvas.toDataURL("image/png");
      setProcessedSrc(finalImg);
    };
  }, [src]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <img
        src={processedSrc || src}
        alt={alt}
        width={width}
        height={height}
        className={`transparent-img ${className}`}
      />
    </>
  );
};

export default TransparentImage;
