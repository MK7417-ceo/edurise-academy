"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download, Eye, Inbox, Loader2, LogOut, Phone, Mail,
  Search, Trash2, TrendingUp, UserCheck, Users, X,
} from "lucide-react";
import { API_URL, STATUS_LABELS, STATUSES, type AdminStats, type EnquiryRecord } from "@/lib/api";
import { Container, EmptyState, Spinner } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  follow_up: "bg-purple-100 text-purple-800",
  converted: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700",
};

function useAdminApi() {
  const router = useRouter();
  const call = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const token = localStorage.getItem("edurise_admin_token");
      if (!token) {
        router.push("/admin/login");
        throw new Error("Not logged in");
      }
      const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init?.headers || {}),
        },
      });
      if (res.status === 401) {
        localStorage.removeItem("edurise_admin_token");
        router.push("/admin/login");
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Request failed");
      return res.json();
    },
    [router]
  );
  return call;
}

export default function AdminDashboard() {
  const router = useRouter();
  const api = useAdminApi();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [items, setItems] = useState<EnquiryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [course, setCourse] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<EnquiryRecord | null>(null);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, list] = await Promise.all([
        api<AdminStats>("/api/v1/admin/stats"),
        api<{ total: number; items: EnquiryRecord[] }>(
          `/api/v1/admin/enquiries?q=${encodeURIComponent(q)}&status=${status}&course=${encodeURIComponent(course)}&page=${page}&page_size=15`
        ),
      ]);
      setStats(s);
      setItems(list.items);
      setTotal(list.total);
    } catch {
      /* redirect handled in api() */
    } finally {
      setLoading(false);
    }
  }, [api, q, status, course, page]);

  useEffect(() => {
    if (!localStorage.getItem("edurise_admin_token")) {
      router.push("/admin/login");
      return;
    }
    load();
  }, [load, router]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const updateStatus = async (enquiry_id: string, newStatus: string) => {
    setUpdating(true);
    try {
      await api(`/api/v1/admin/enquiries/${enquiry_id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setSelected((s) => (s ? { ...s, status: newStatus } : s));
      load();
    } finally {
      setUpdating(false);
    }
  };

  const remove = async (enquiry_id: string) => {
    if (!confirm(`Delete enquiry ${enquiry_id}? This cannot be undone.`)) return;
    await api(`/api/v1/admin/enquiries/${enquiry_id}`, { method: "DELETE" });
    setSelected(null);
    load();
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("edurise_admin_token");
      const res = await fetch(`${API_URL}/api/v1/admin/enquiries/export.csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edurise-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("edurise_admin_token");
    router.push("/admin/login");
  };

  const pages = Math.max(1, Math.ceil(total / 15));

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">Enquiry Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Manage admission enquiries from the website.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={exportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-navy-900 px-4 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total enquiries", value: stats.total, icon: Users, tint: "bg-brand-50 text-brand-600" },
            { label: "New (unread)", value: stats.new, icon: Inbox, tint: "bg-blue-50 text-blue-600" },
            { label: "Converted", value: stats.by_status.converted ?? 0, icon: UserCheck, tint: "bg-emerald-50 text-emerald-600" },
            {
              label: "Conversion rate",
              value: stats.total ? `${Math.round(((stats.by_status.converted ?? 0) / stats.total) * 100)}%` : "—",
              icon: TrendingUp, tint: "bg-orange-50 text-accent-600",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}>
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-3xl font-extrabold text-navy-900">{s.value}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Course-wise */}
      {stats && Object.keys(stats.by_course).length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="font-bold text-navy-900">Enquiries by course</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.by_course).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-44 shrink-0 truncate text-sm font-medium text-slate-700">{name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${Math.max(4, (count / Math.max(...Object.values(stats.by_course))) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-bold text-navy-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, phone, city or enquiry ID…"
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); load(); }}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={course} onChange={(e) => { setCourse(e.target.value); setPage(1); load(); }}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
          <option value="">All courses</option>
          {stats && Object.keys(stats.by_course).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <Spinner label="Loading enquiries…" />
        ) : items.length === 0 ? (
          <div className="p-8"><EmptyState title="No enquiries found" description="Try clearing the search or filters — or check back after someone submits the enquiry form." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3.5 font-semibold">Enquiry ID</th>
                  <th className="px-5 py-3.5 font-semibold">Student</th>
                  <th className="px-5 py-3.5 font-semibold">Course</th>
                  <th className="px-5 py-3.5 font-semibold">City</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Received</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((e) => (
                  <tr key={e.enquiry_id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-navy-900">{e.enquiry_id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-navy-900">{e.name}</p>
                      <p className="text-xs text-slate-500">{e.student_class} · {e.mode}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{e.course}</td>
                    <td className="px-5 py-3.5 text-slate-700">{e.city}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[e.status]}`}>
                        {STATUS_LABELS[e.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setSelected(e)} aria-label="View details"
                          className="rounded-lg p-2 text-brand-700 hover:bg-brand-50">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(e.enquiry_id)} aria-label="Delete enquiry"
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-slate-500">Page {page} of {pages} · {total} enquiries</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => { setPage(page - 1); load(); }}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40 hover:bg-slate-50">Previous</button>
            <button disabled={page >= pages} onClick={() => { setPage(page + 1); load(); }}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-950/60 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Enquiry details">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-navy-900">{selected.name}</h2>
                <p className="font-mono text-xs text-slate-500">{selected.enquiry_id}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-slate-400" /><span className="text-slate-700 break-all">{selected.email}</span></div>
              <div className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-slate-400" /><span className="text-slate-700">{selected.phone}</span></div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div><dt className="text-xs text-slate-500">Class</dt><dd className="font-semibold text-navy-900">{selected.student_class}</dd></div>
                <div><dt className="text-xs text-slate-500">Mode</dt><dd className="font-semibold text-navy-900">{selected.mode}</dd></div>
                <div><dt className="text-xs text-slate-500">Course</dt><dd className="font-semibold text-navy-900">{selected.course}</dd></div>
                <div><dt className="text-xs text-slate-500">City</dt><dd className="font-semibold text-navy-900">{selected.city}</dd></div>
              </div>
              <div><dt className="text-xs text-slate-500">Message</dt><dd className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-700">{selected.message}</dd></div>
            </dl>
            <div className="mt-5">
              <label htmlFor="st" className="mb-1.5 block text-sm font-semibold text-navy-900">Status</label>
              <select id="st" value={selected.status} disabled={updating}
                onChange={(e) => updateStatus(selected.enquiry_id, e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button onClick={() => remove(selected.enquiry_id)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <button onClick={() => setSelected(null)}
                className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
