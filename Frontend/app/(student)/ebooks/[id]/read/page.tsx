"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import Book from "epubjs";
import type { Rendition } from "epubjs";
import { useEbooks } from "@/features/loans/hooks";
import { EmptyState } from "@/components/shared/empty-state";
import { ROUTES } from "@/constants/routes";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function EbookReaderPage({ params }: PageProps<"/ebooks/[id]/read">) {
  const { id } = use(params);
  const { data: ebooks, isLoading } = useEbooks();
  const ebook = ebooks?.find((e) => e.id === id);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  };

  if (isLoading) {
    return <div className="fixed inset-0 z-[60] bg-surface" />;
  }

  if (!ebook?.fileUrl || !ebook.fileFormat) {
    return (
      <div ref={containerRef} className="fixed inset-0 z-[60] bg-surface flex flex-col">
        <ReaderHeader title={ebook?.bookTitle} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon="menu_book"
            title="This title has no file yet"
            description="A librarian hasn't uploaded a readable file for this ebook edition yet. Check back later."
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[60] bg-surface-container-lowest flex flex-col">
      <ReaderHeader title={ebook.bookTitle} isFullscreen={isFullscreen} onToggleFullscreen={toggleFullscreen} />
      <div className="flex-1 min-h-0">
        {ebook.fileFormat === "pdf" ? (
          <PdfViewer fileUrl={ebook.fileUrl} />
        ) : (
          <EpubViewer fileUrl={ebook.fileUrl} />
        )}
      </div>
    </div>
  );
}

function ReaderHeader({
  title,
  isFullscreen,
  onToggleFullscreen,
}: {
  title?: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-outline-variant px-4 py-3 shrink-0 bg-surface">
      <Link href={ROUTES.ebookLibrary} className="flex items-center gap-1 text-on-surface-variant hover:text-primary">
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="text-label-md font-label-md hidden sm:inline">Library</span>
      </Link>
      <p className="font-headline-md text-body-md text-on-surface truncate px-2">{title}</p>
      <button
        onClick={onToggleFullscreen}
        className="size-9 flex items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        <span className="material-symbols-outlined">{isFullscreen ? "fullscreen_exit" : "fullscreen"}</span>
      </button>
    </header>
  );
}

// A typical book page is roughly this tall relative to its width -- used only as a
// placeholder guess before a page has actually loaded, never derived from a sibling
// page (scanned/pirated PDFs often have a badly-cropped outlier page -- e.g. a sliver
// of a spine -- and that page's aspect ratio must never be reused as the estimate for
// every other page in the book, which is what caused huge blank gaps and a stretched
// black bar to appear).
const DEFAULT_PAGE_RATIO = 1.5;
// No real book page should render dramatically taller than it is wide; a page that
// reports a ratio beyond this is almost certainly a scan artifact, so its rendered
// width is shrunk until its height falls back in line rather than blowing up the layout.
const MAX_PAGE_RATIO = 2.2;

function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setPageWidth(Math.min(width - 32, 860));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <EmptyState icon="error" title="Couldn't load this ebook" description="The file may be corrupted or unreachable." />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full h-full overflow-y-auto">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={() => setError(true)}
        loading={<div className="py-16 text-center text-body-md text-on-surface-variant">Loading book…</div>}
        className="flex flex-col items-center gap-4 py-6"
      >
        {numPages &&
          pageWidth > 0 &&
          Array.from({ length: numPages }, (_, i) => (
            <LazyPage key={i + 1} pageNumber={i + 1} containerWidth={pageWidth} scrollRoot={wrapperRef} />
          ))}
      </Document>
    </div>
  );
}

/** Only mounts the (expensive, canvas-rendering) <Page> once it's scrolled near the
 * viewport -- rendering every page of a long book up front is what made this screen slow.
 * Sizes itself independently of every other page, so one badly-scanned page can't distort
 * the layout of the rest of the book. */
function LazyPage({
  pageNumber,
  containerWidth,
  scrollRoot,
}: {
  pageNumber: number;
  containerWidth: number;
  scrollRoot: React.RefObject<HTMLDivElement | null>;
}) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [renderWidth, setRenderWidth] = useState(containerWidth);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  useEffect(() => {
    if (shouldRender || !placeholderRef.current || !scrollRoot.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShouldRender(true);
      },
      { root: scrollRoot.current, rootMargin: "1200px 0px" }
    );
    observer.observe(placeholderRef.current);
    return () => observer.disconnect();
  }, [shouldRender, scrollRoot]);

  const estimatedHeight = measuredHeight ?? containerWidth * DEFAULT_PAGE_RATIO;

  return (
    <div ref={placeholderRef} style={{ width: renderWidth, minHeight: estimatedHeight }} className="shadow-md">
      {shouldRender ? (
        <Page
          pageNumber={pageNumber}
          width={renderWidth}
          loading=""
          onLoadSuccess={(page) => {
            const ratio = page.height / page.width;
            if (ratio > MAX_PAGE_RATIO && renderWidth === containerWidth) {
              // This page is an outlier (e.g. a cropped scan artifact) -- shrink it
              // until its height falls back within a normal book page's proportions,
              // instead of letting it blow up into a huge mostly-blank/stretched page.
              setRenderWidth(containerWidth * (MAX_PAGE_RATIO / ratio));
            } else {
              setMeasuredHeight(page.height);
            }
          }}
        />
      ) : (
        <div style={{ width: renderWidth, height: estimatedHeight }} className="bg-surface-container-low" />
      )}
    </div>
  );
}

function EpubViewer({ fileUrl }: { fileUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const book = Book(fileUrl);
    const rendition = book.renderTo(containerRef.current, {
      width: "100%",
      height: "100%",
    });
    renditionRef.current = rendition;
    rendition.display().catch(() => setError(true));

    return () => {
      rendition.destroy();
      book.destroy();
    };
  }, [fileUrl]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <EmptyState icon="error" title="Couldn't load this ebook" description="The file may be corrupted or unreachable." />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div ref={containerRef} className="flex-1 min-h-0" />
      <div className="flex items-center justify-between border-t border-outline-variant px-4 py-3 shrink-0 bg-surface">
        <button
          onClick={() => renditionRef.current?.prev()}
          className="text-label-md font-label-md text-primary"
        >
          Previous
        </button>
        <button
          onClick={() => renditionRef.current?.next()}
          className="text-label-md font-label-md text-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
}
