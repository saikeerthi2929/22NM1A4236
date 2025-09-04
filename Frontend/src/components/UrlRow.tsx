import React from "react";
import { isPositiveIntegerString, isValidUrl } from "@utils/validators";

export interface UrlRowData {
  longUrl: string;
  validityMinutes?: string;
  preferredCode?: string;
}
export default function UrlRow({
  index,
  data,
  onChange,
  onRemove,
  disableRemove
}: {
  index: number;
  data: UrlRowData;
  onChange: (d: UrlRowData) => void;
  onRemove: () => void;
  disableRemove?: boolean;
}) {
  const urlOk = data.longUrl ? isValidUrl(data.longUrl) : true;
  const validOk = isPositiveIntegerString(data.validityMinutes);
  const codeOk = data.preferredCode ? /^[A-Za-z0-9]{4,20}$/.test(data.preferredCode) : true;

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div className="col">
          <label className="small">Original URL</label>
          <input
            placeholder="https://example.com/some/long/path"
            value={data.longUrl}
            onChange={(e) => onChange({ ...data, longUrl: e.target.value })}
            aria-invalid={!urlOk}
          />
          {!urlOk && <div className="error">Enter a valid http(s) URL</div>}
        </div>
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <div className="col">
          <label className="small">Validity (minutes, optional — defaults to 30)</label>
          <input
            placeholder="30"
            value={data.validityMinutes ?? ""}
            onChange={(e) => onChange({ ...data, validityMinutes: e.target.value })}
            aria-invalid={!validOk}
          />
          {!validOk && <div className="error">Must be a positive integer</div>}
        </div>
        <div className="col">
          <label className="small">Preferred shortcode (optional, 4–20 alphanumeric)</label>
          <input
            placeholder="e.g. MyLink9"
            value={data.preferredCode ?? ""}
            onChange={(e) => onChange({ ...data, preferredCode: e.target.value })}
            aria-invalid={!codeOk}
          />
          {!codeOk && <div className="error">Only A–Z, a–z, 0–9; length 4–20</div>}
        </div>
        <div>
          <label className="small">&nbsp;</label>
          <button className="btn-ghost" disabled={!!disableRemove} onClick={onRemove} title="Remove row">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
