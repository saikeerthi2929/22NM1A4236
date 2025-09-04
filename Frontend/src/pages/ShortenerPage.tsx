import { useState } from "react";
import UrlRow, { UrlRowData } from "@components/UrlRow";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@store/configureStore";
import { createMany } from "@store/slices/urlsSlice";
import { urlApi } from "@api/urlApi";
import ShortLinkCard from "@components/ShortLinkCard";

export default function ShortenerPage() {
  const dispatch = useDispatch();
  const items = useSelector((s: RootState) => s.urls.items);

  const [rows, setRows] = useState<UrlRowData[]>([
    { longUrl: "", validityMinutes: "", preferredCode: "" }
  ]);
  const [errors, setErrors] = useState<string | null>(null);

  function addRow() {
    if (rows.length >= 5) return;
    setRows([...rows, { longUrl: "", validityMinutes: "", preferredCode: "" }]);
  }

  function removeRow(i: number) {
    const next = rows.slice();
    next.splice(i, 1);
    setRows(next);
  }

  function canSubmit() {
    if (rows.length === 0) return false;
    return rows.every(r => r.longUrl.trim().length > 0);
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    // Client-side validation before "API" call
    const invalid = rows.find(r => {
      const urlOk = (() => {
        try { const u = new URL(r.longUrl); return ["http:", "https:"].includes(u.protocol); } catch { return false; }
      })();
      const validOk = !r.validityMinutes || (/^[0-9]+$/.test(r.validityMinutes) && Number(r.validityMinutes) > 0);
      const codeOk = !r.preferredCode || /^[A-Za-z0-9]{4,20}$/.test(r.preferredCode);
      return !urlOk || !validOk || !codeOk;
    });

    if (invalid) {
      setErrors("Please fix validation errors in the form.");
      return;
    }

    const payload = rows.map(r => ({
      longUrl: r.longUrl.trim(),
      validityMinutes: r.validityMinutes ? parseInt(r.validityMinutes, 10) : undefined,
      preferredCode: r.preferredCode?.trim() || undefined
    }));

    const prepared = urlApi.createShortUrls(payload);
    // Dispatch synchronously; reducer enforces constraints and uniqueness
    const action: any = createMany(prepared);
    (dispatch as any)(action);

    // If any failures, show aggregated error count
    const results = action.results as Array<{ ok: boolean; error?: string }>;
    const failed = results.filter(r => !r.ok);
    if (failed.length > 0) {
      setErrors(`${failed.length} of ${results.length} failed: ${failed.map(f => f.error).join("; ")}`);
    } else {
      // Reset form to a single empty row for convenience
      setRows([{ longUrl: "", validityMinutes: "", preferredCode: "" }]);
    }
  };

  const baseUrl = window.location.origin;

  return (
    <div>
      <h1 className="h1">🔗 URL Shortener</h1>
      <form onSubmit={onSubmit}>
        {rows.map((r, i) => (
          <UrlRow
            key={i}
            index={i}
            data={r}
            onChange={(d) => {
              const next = rows.slice();
              next[i] = d;
              setRows(next);
            }}
            onRemove={() => removeRow(i)}
            disableRemove={rows.length === 1}
          />
        ))}

        <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          <button type="button" className="btn-ghost" onClick={addRow} disabled={rows.length >= 5}>
            + Add URL (max 5)
          </button>
          <button type="submit" className="btn" disabled={!canSubmit()}>
            Create Short Links
          </button>
        </div>
        {errors && <div className="error" style={{ marginTop: 8 }}>{errors}</div>}
      </form>

      <div className="h2" style={{ marginTop: 18 }}>Recently created</div>
      {items.length === 0 && <div className="small">No links yet. Create some above.</div>}
      {items.slice(0, 5).map(item => (
        <ShortLinkCard key={item.id} item={item} baseUrl={baseUrl} />
      ))}
    </div>
  );
}
