"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Lock } from "lucide-react";
import { ApiError, post } from "@/lib/api";
import { Container } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await post<{ token: string; expires_in: number }>("/api/v1/admin/login", {
        username,
        password,
      });
      localStorage.setItem("edurise_admin_token", res.token);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-16 sm:py-24 max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900">
            <GraduationCap className="h-6 w-6 text-accent-400" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-navy-900">Admin Dashboard</h1>
            <p className="text-xs text-slate-500">EduRise Academy · restricted area</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="au" className="mb-1.5 block text-sm font-semibold text-navy-900">Username</label>
            <input id="au" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              autoComplete="username" />
          </div>
          <div>
            <label htmlFor="ap" className="mb-1.5 block text-sm font-semibold text-navy-900">Password</label>
            <input id="ap" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              autoComplete="current-password" />
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
          Demo build: mock authentication. Default credentials are <span className="font-bold">admin / edurise123</span> —
          change them via ADMIN_USERNAME / ADMIN_PASSWORD in <span className="font-mono">.env</span> before any shared deployment.
        </p>
      </div>
    </Container>
  );
}
