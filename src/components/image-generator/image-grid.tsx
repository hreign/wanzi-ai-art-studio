"use client";

import { useState } from "react";
import type { GeneratedImage } from "@/types";
import { getImageSrc } from "@/lib/utils";
import { Download, ZoomIn } from "lucide-react";

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
        {/* Skeleton */}
        {!loaded && !error && (
          <div className="aspect-square animate-pulse bg-[var(--color-bg-tertiary)]" />
        )}

        {/* Error */}
        {error && (
          <div className="aspect-square flex items-center justify-center text-sm text-[var(--color-error)]">
            图片加载失败
          </div>
        )}

        {/* Image */}
        <img
          src={src}
          alt={prompt ? `生成图像 ${index + 1}: ${prompt}` : `生成图像 ${index + 1}`}
          className={`w-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />

        {/* Overlay actions */}
        {loaded && (
          <div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200"
          >
            <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setPreviewOpen(true)}
                className="p-1.5 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                title="查看大图"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <a
                href={src}
                download={`ai-generated-${index + 1}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                title="下载图片"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: "fadeIn 150ms ease-out" }}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="预览大图"
          className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-black/50 text-white text-xs hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            按 ESC 或点击外部关闭
          </button>
        </div>
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
