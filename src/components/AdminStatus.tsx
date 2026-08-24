"use client";

import { useCallback, useEffect, useState } from "react";
import { PiArrowsClockwiseBold as RefreshCw, PiCheckCircleBold as CheckCircle2, PiMinusCircleBold as MinusCircle, PiPulseBold as Activity, PiSpinnerBallBold as Loader2, PiXCircleBold as XCircle } from "react-icons/pi";

interface IntegrationStatus {
  name: string;
  status: "up" | "down" | "disabled";
  latencyMs: number;
  error?: string;
}

const statusStyles: Record<
  IntegrationStatus["status"],
  { icon: typeof CheckCircle2; ring: string; label: string }
> = {
  up: { icon: CheckCircle2, ring: "border-emerald-500/40 text-emerald-500", label: "Up" },
  down: { icon: XCircle, ring: "border-red-500/40 text-red-500", label: "Down" },
  disabled: { icon: MinusCircle, ring: "border-border text-muted", label: "Disabled" },
};

export function AdminStatus() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/status");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Gagal memuat status");
      }
      setIntegrations((data as { integrations: IntegrationStatus[] }).integrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-highlight" />
          <h2 className="text-lg font-semibold">Status Integrasi</h2>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(integrations || []).map((item) => {
            const style = statusStyles[item.status];
            const Icon = style.icon;
            return (
              <div
                key={item.name}
                className={`flex items-center justify-between gap-3 rounded-xl border bg-card/50 p-4 ${style.ring}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.error && (
                      <p className="text-xs text-muted">{item.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{style.label}</p>
                  <p className="text-xs text-muted">
                    {item.status === "up" ? `${item.latencyMs} ms` : "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
