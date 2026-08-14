import React, { useEffect, useState } from "react";
import { UserCheck } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/AsyncState";

export default function GymCheckins() {
  const [members, setMembers] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });

  async function load() {
    setStatus((s) => ({ ...s, loading: true, error: "" }));
    try {
      const [membersRes, checkinsRes] = await Promise.all([apiRequest("/gym/members"), apiRequest("/gym/checkins?limit=100")]);
      setMembers(membersRes.data || []);
      setCheckins(checkinsRes.data || []);
      setStatus((s) => ({ ...s, loading: false }));
    } catch (error) { setStatus((s) => ({ ...s, loading: false, error: error.message })); }
  }
  useEffect(() => { load(); }, []);

  async function handleCheckin(e) {
    e.preventDefault();
    if (!memberId) return;
    setStatus((s) => ({ ...s, saving: true, error: "" }));
    try {
      await apiRequest("/gym/checkins", { method: "POST", body: JSON.stringify({ member_id: memberId }) });
      setMemberId("");
      await load();
    } catch (error) { setStatus((s) => ({ ...s, error: error.message })); }
    finally { setStatus((s) => ({ ...s, saving: false })); }
  }

  if (status.loading) return <LoadingState />;
  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <form onSubmit={handleCheckin} className="panel h-fit p-4">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-950"><UserCheck className="h-5 w-5 text-blue-600" /> Check a member in</h2>
        {status.error ? <ErrorState message={status.error} /> : null}
        <select className="field" value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
          <option value="">Choose member…</option>
          {members.filter((m) => !m.status || m.status === "active").map((m) => <option key={m.id} value={m.id}>{m.name}{m.gender ? ` (${m.gender === "female" ? "Women" : "Men"})` : ""}</option>)}
        </select>
        <button className="btn-primary mt-4 w-full" disabled={status.saving || !memberId}>{status.saving ? "Checking in…" : "Check in"}</button>
      </form>
      <div className="panel overflow-hidden">
        <div className="border-b border-slate-100 p-4"><h2 className="text-base font-bold text-slate-950">Who came, and when</h2></div>
        {checkins.length === 0 ? <div className="p-4"><EmptyState title="No check-ins yet" description="Check a member in above to see it appear here." /></div> : (
          <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Checked in</th></tr></thead><tbody className="divide-y divide-slate-100">
            {checkins.map((c) => <tr key={c.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-950">{c.gym_members?.name || "-"}</td><td className="px-4 py-3 text-slate-500">{c.checked_in_at ? new Date(c.checked_in_at).toLocaleString() : "-"}</td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}
