"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

// Shared watch-only video modal (build doc §7/§8): one component for class
// recordings AND drill videos. Playback is a short-lived signed URL fetched
// from `endpoint` on open — no download. Closes the "protected replays but
// unprotected drill videos" leak by routing both through here.
export function MediaModal({
  title,
  subtitle,
  endpoint,
  onClose,
}: {
  title: string;
  subtitle: string;
  endpoint: string;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(endpoint)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("nope"))))
      .then((d) => active && setUrl(d.url))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [endpoint]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-card border border-hairline bg-surface shadow-glow-card">
        <div className="flex items-start justify-between gap-4 border-b border-hairline p-5">
          <div className="min-w-0">
            <h3 className="truncate font-bold text-ink">{title}</h3>
            <p className="text-xs text-muted">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-gold focus-gold">
            <Icon name="close" />
          </button>
        </div>
        <div className="flex aspect-video items-center justify-center bg-canvas">
          {url ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={url}
              controls
              autoPlay
              // Watch-only: hide the browser's Download button + remote-cast,
              // disable picture-in-picture, and block right-click "Save video as".
              // A deterrent, not DRM — access control is the signed, expiring URL.
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              className="h-full w-full"
            />
          ) : failed ? (
            <div className="flex flex-col items-center gap-2 text-muted">
              <Icon name="videocam_off" className="text-4xl" />
              <p className="text-sm">This video isn&apos;t ready to play yet.</p>
            </div>
          ) : (
            <Icon name="progress_activity" className="animate-spin text-4xl text-gold/50" />
          )}
        </div>
      </div>
    </div>
  );
}
