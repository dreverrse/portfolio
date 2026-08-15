"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IntegrationStatus {
  name: string;
  status: "up" | "down" | "disabled";
  latencyMs: number;
  error?: string;
}

const statusStyles: Record<
  IntegrationStatus["status"],
  { icon: typeof CheckCircle2; variant: "default" | "destructive" | "secondary"; label: string }
> = {
  up: { icon: CheckCircle2, variant: "default", label: "Up" },
  down: { icon: XCircle, variant: "destructive", label: "Down" },
  disabled: { icon: MinusCircle, variant: "secondary", label: "Disabled" },
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
        <Button onClick={load} disabled={loading} variant="outline" size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
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
              <Card key={item.name} className="border-border bg-card/50">
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Icon
                      className={
                        item.status === "up"
                          ? "h-5 w-5 shrink-0 text-emerald-500"
                          : item.status === "down"
                            ? "h-5 w-5 shrink-0 text-red-500"
                            : "h-5 w-5 shrink-0 text-muted"
                      }
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.error && (
                        <p className="text-xs text-muted">{item.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={style.variant}>{style.label}</Badge>
                    <p className="text-xs text-muted">
                      {item.status === "up" ? `${item.latencyMs} ms` : "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
