"use client";

import { useState, useEffect, useCallback } from "react";
import type { GeneratedImage } from "@/types";
import { getImageSrc } from "@/lib/utils";

interface ImageGridProps {
  images: GeneratedImage[];
  prompt?: string;
}

export function ImageGrid({ images, prompt }: ImageGridProps) {
  if (images.length === 0) return null;

  return (
    <div
      className={`grid gap-3 ${
        images.length === 1 ? "grid-cols-1 max-w-lg" : images.length === 2 ? "grid-cols-2" : "grid-cols-2"
      }`}
    >
      {images.map((image, index) => (
        <ImageCard key={index} image={image} index={index} prompt={prompt} />
      ))}
    </div>
  );
}

interface ImageCardProps {
  image: GeneratedImage;
  index: number;
  prompt?: string;
}

function ImageCard({ image, index, prompt }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const src = getImageSrc(image);

  if (!src) return null;

  return (
    <>
      <div className="group relative rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)]">
        {!loaded && !error && (
          <div className="aspect-square animate-pulse bg-[var(--color-bg-tertiary)]" />
        )}

        {error && (
          <div className="aspect-square flex items-center justify-center text-sm text-[var(--color-error)]">
            图片加载失败
          </div>
        )}

        <img
          src={src}
          alt={prompt ? `生成图像 ${index + 1}: ${prompt}` : `生成图像 ${index + 1}`}
          className={`w-full transition-opacity duration-300 cursor-pointer ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          onClick={() => loaded && setPreviewOpen(true)}
          loading="lazy"
        />
      </div>

      {previewOpen && (
        <ImagePreviewModal src={src} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  );
}

interface ImagePreviewModalProps {
  src: string;
  onClose: () => void;
}

function ImagePreviewModal({ src, onClose }: ImagePreviewModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
      style={{ animation: "fadeIn 150ms ease-out" }}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="预览大图"
          className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
        />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
