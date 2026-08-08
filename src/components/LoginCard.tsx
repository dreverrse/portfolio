"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { DURATION, EASE } from "@/lib/motion";

export function LoginCard({
  error,
  loading,
  onSubmit,
}: {
  error: string;
  loading: boolean;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    await onSubmit(password);
    setPassword("");
  }

  return (
    <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 sm:px-6 py-24">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-highlight/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION, ease: EASE }}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card/50 p-8 shadow-lg backdrop-blur-md"
      >
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-accent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION, ease: EASE, delay: 0.1 }}
        >
          <div className="mb-1 flex items-center gap-2">
            <Lock className="h-5 w-5 text-highlight" />
            <h1 className="text-2xl font-bold">Login Admin</h1>
          </div>
          <p className="mb-6 text-sm text-muted">
            Masukkan password untuk mengelola artikel blog.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION, ease: EASE, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Masuk
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
