"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { DURATION, EASE } from "@/lib/motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        className="relative w-full max-w-md"
      >
        <Card className="border-border bg-card/50 shadow-lg backdrop-blur-md">
          <CardHeader>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION, ease: EASE, delay: 0.1 }}
            >
              <div className="mb-1 flex items-center gap-2">
                <Lock className="h-5 w-5 text-highlight" />
                <CardTitle className="text-2xl">Login Admin</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Masukkan password untuk mengelola artikel blog.
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION, ease: EASE, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={loading || !password}
                className="w-full"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Masuk
              </Button>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
