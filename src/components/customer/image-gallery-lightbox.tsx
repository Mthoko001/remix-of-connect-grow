import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ImageGalleryLightboxProps = {
  images: string[];
  supplierName: string;
  selectedIndex: number | null;
  onSelectedIndexChange: (index: number | null) => void;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export function ImageGalleryLightbox({
  images,
  supplierName,
  selectedIndex,
  onSelectedIndexChange,
}: ImageGalleryLightboxProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const viewerRef = useRef<HTMLDivElement>(null);
  const isOpen = selectedIndex !== null;
  const activeIndex = selectedIndex ?? 0;

  function selectImage(index: number) {
    const wrappedIndex = (index + images.length) % images.length;
    setZoom(MIN_ZOOM);
    onSelectedIndexChange(wrappedIndex);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" && images.length > 1) selectImage(activeIndex - 1);
      if (event.key === "ArrowRight" && images.length > 1) selectImage(activeIndex + 1);
      if (event.key === "Escape") onSelectedIndexChange(null);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length, isOpen, onSelectedIndexChange]);

  async function enterFullscreen() {
    const viewer = viewerRef.current;
    if (!viewer?.requestFullscreen) return;
    await viewer.requestFullscreen();
  }

  if (images.length === 0) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setZoom(MIN_ZOOM);
          onSelectedIndexChange(null);
        }
      }}
    >
      <DialogContent
        ref={viewerRef}
        className="inset-0 left-0 top-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-0 bg-gallery p-0 text-gallery-foreground shadow-none duration-0 data-[state=closed]:animate-none data-[state=open]:animate-none [&>button]:hidden sm:rounded-none"
      >
        <DialogTitle className="sr-only">{supplierName} image gallery</DialogTitle>

        <header className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-gallery-foreground/15 px-3 sm:px-5">
          <p className="min-w-0 truncate text-sm font-medium">
            {supplierName} <span className="text-gallery-foreground/60">· {activeIndex + 1} of {images.length}</span>
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
              disabled={zoom === MIN_ZOOM}
              aria-label="Zoom out"
              title="Zoom out"
              className="text-gallery-foreground hover:bg-gallery-foreground/10 hover:text-gallery-foreground"
            >
              <Minus />
            </Button>
            <span className="w-11 text-center text-xs tabular-nums text-gallery-foreground/70">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
              disabled={zoom === MAX_ZOOM}
              aria-label="Zoom in"
              title="Zoom in"
              className="text-gallery-foreground hover:bg-gallery-foreground/10 hover:text-gallery-foreground"
            >
              <Plus />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setZoom(MIN_ZOOM)}
              disabled={zoom === MIN_ZOOM}
              aria-label="Reset zoom"
              title="Reset zoom"
              className="hidden text-gallery-foreground hover:bg-gallery-foreground/10 hover:text-gallery-foreground sm:inline-flex"
            >
              <RotateCcw />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => void enterFullscreen()}
              aria-label="View full screen"
              title="View full screen"
              className="hidden text-gallery-foreground hover:bg-gallery-foreground/10 hover:text-gallery-foreground sm:inline-flex"
            >
              <Maximize2 />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => onSelectedIndexChange(null)}
              aria-label="Close gallery"
              title="Close gallery"
              className="ml-1 text-gallery-foreground hover:bg-gallery-foreground/10 hover:text-gallery-foreground"
            >
              <X />
            </Button>
          </div>
        </header>

        <div className="relative min-h-0 overflow-auto bg-gallery">
          <div className="flex h-full min-h-0 items-center justify-center p-14 sm:p-16">
            <img
              src={images[activeIndex]}
              alt={`${supplierName} work sample ${activeIndex + 1}`}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>

          {images.length > 1 && (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => selectImage(activeIndex - 1)}
                aria-label="Previous image"
                className="fixed left-2 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full shadow-lg sm:left-5"
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => selectImage(activeIndex + 1)}
                aria-label="Next image"
                className="fixed right-2 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full shadow-lg sm:right-5"
              >
                <ChevronRight />
              </Button>
            </>
          )}
        </div>

        <div className="h-28 border-t border-gallery-foreground/15 bg-gallery px-3 py-3 sm:px-5">
          <div className="mx-auto flex h-full max-w-4xl justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
            {images.map((src, index) => (
              <Button
                key={`${src}-${index}`}
                type="button"
                variant="ghost"
                onClick={() => selectImage(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-gallery-foreground/5 p-1 hover:bg-gallery-foreground/10 ${
                  index === activeIndex
                    ? "border-brand ring-2 ring-brand/40"
                    : "border-gallery-foreground/20 opacity-65 hover:opacity-100"
                }`}
              >
                <img
                  src={src}
                  alt={`${supplierName} thumbnail ${index + 1}`}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}