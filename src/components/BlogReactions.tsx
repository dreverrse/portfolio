"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { REACTION_OPTIONS } from "@/lib/blog-engagement";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const USER_KEY = "blog_user_id";

function getUserId(): string {
  try {
    let id = window.localStorage.getItem(USER_KEY);
    if (!id) {
      id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(USER_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function BlogReactions({ slug }: { slug: string }) {
  const { t } = useI18n();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/blog/${slug}/reactions?userId=${encodeURIComponent(getUserId())}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setCounts(data.counts || {});
          setMine(data.mine || []);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const refresh = async () => {
    try {
      const res = await fetch(
        `/api/blog/${slug}/reactions?userId=${encodeURIComponent(getUserId())}`
      );
      const data = await res.json();
      setCounts(data.counts || {});
      setMine(data.mine || []);
    } catch {
      // ignore
    }
  };

  const handleClick = async (reaction: string) => {
    if (busy) return;
    setBusy(reaction);
    const wasActive = mine.includes(reaction);
    setMine((prev) =>
      wasActive ? prev.filter((r) => r !== reaction) : [...prev, reaction]
    );
    setCounts((prev) => ({
      ...prev,
      [reaction]: Math.max(0, (prev[reaction] || 0) + (wasActive ? -1 : 1)),
    }));
    try {
      const res = await fetch(`/api/blog/${slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getUserId(),
          reaction,
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 text-sm text-muted mb-3">
        <Smile className="h-4 w-4" />
        {t("blog.reactions")}
      </div>
      <div className="flex flex-wrap gap-2">
        {REACTION_OPTIONS.map((reaction) => {
          const active = mine.includes(reaction);
          return (
            <Button
              key={reaction}
              onClick={() => handleClick(reaction)}
              disabled={!!busy}
              aria-pressed={active}
              variant={active ? "default" : "outline"}
              className={cn(
                "rounded-full",
                active && "bg-accent text-white hover:bg-accent/80 border-accent"
              )}
            >
              <span className="text-base leading-none">{reaction}</span>
              <span className="text-xs font-medium">{counts[reaction] || 0}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
