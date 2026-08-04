"use client";

import { useEffect, useState } from "react";
import { Music, ExternalLink } from "lucide-react";

interface Track {
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
  is_playing: boolean;
}

export function MusicWidget() {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrack() {
      try {
        const res = await fetch("/api/lastfm");
        if (res.ok) {
          const data = await res.json();
          if (data.track) {
            setTrack(data.track);
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchTrack();
    const interval = setInterval(fetchTrack, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50 animate-pulse">
        <div className="h-12 w-12 rounded-lg bg-surface" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-surface" />
          <div className="h-3 w-24 rounded bg-surface" />
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50">
        <div className="h-12 w-12 rounded-lg bg-surface flex items-center justify-center">
          <Music className="h-5 w-5 text-muted" />
        </div>
        <div>
          <p className="text-sm text-muted">Belum ada lagu yang diputar</p>
          <p className="text-xs text-muted/60">Nanti muncul di sini lewat Last.fm</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-surface/50 transition-all duration-300 glow-hover"
    >
      <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={track.image}
          alt={track.album || track.name}
          className="h-full w-full object-cover"
        />
        {track.is_playing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="flex gap-0.5 items-end h-3">
              <div className="w-0.5 bg-accent animate-pulse-glow" style={{ height: "60%", animationDelay: "0ms" }} />
              <div className="w-0.5 bg-accent animate-pulse-glow" style={{ height: "100%", animationDelay: "150ms" }} />
              <div className="w-0.5 bg-accent animate-pulse-glow" style={{ height: "40%", animationDelay: "300ms" }} />
              <div className="w-0.5 bg-accent animate-pulse-glow" style={{ height: "80%", animationDelay: "450ms" }} />
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {track.is_playing && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
          )}
          <p className="text-sm font-medium truncate text-foreground group-hover:text-highlight transition-colors">
            {track.name}
          </p>
        </div>
        <p className="text-xs text-muted truncate">{track.artist}</p>
        <p className="mt-0.5 text-xs text-muted/60 truncate">{track.album}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted group-hover:text-highlight transition-colors flex-shrink-0" />
    </a>
  );
}
