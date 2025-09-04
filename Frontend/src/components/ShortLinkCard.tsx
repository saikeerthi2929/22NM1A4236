import React from "react";
import { ShortUrl } from "@store/slices/urlsSlice";
import { fmt, remainingStr } from "@utils/time";
import CopyButton from "./CopyButton";
import { Link } from "react-router-dom";

export default function ShortLinkCard({ item, baseUrl }: { item: ShortUrl; baseUrl: string }) {
  const short = `${baseUrl}/${item.code}`;
  const expired = Date.now() > item.expiresAt;
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="h2">Short link</div>
          <div><a className="link" href={short} target="_blank" rel="noreferrer">{short}</a></div>
          <div className="small">Created: {fmt(item.createdAt)} &nbsp;•&nbsp; Expires: {fmt(item.expiresAt)} ({remainingStr(item.expiresAt)})</div>
          {expired && <div className="error">This link has expired and won’t redirect.</div>}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <CopyButton text={short} />
          <Link to={`/stats`} className="btn" style={{ textDecoration: "none", display: "inline-block", paddingTop: 10, paddingBottom: 10 }}>View stats</Link>
        </div>
      </div>
      <div className="small" style={{ marginTop: 8, wordBreak: "break-all" }}>
        Original: <a className="link" href={item.longUrl} target="_blank" rel="noreferrer">{item.longUrl}</a>
      </div>
    </div>
  );
}
