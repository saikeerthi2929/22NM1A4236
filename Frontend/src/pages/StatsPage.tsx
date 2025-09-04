import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@store/configureStore";
import { fmt } from "@utils/time";
import { purgeExpired } from "@store/slices/urlsSlice";

export default function StatsPage() {
  const dispatch = useDispatch();
  const items = useSelector((s: RootState) => s.urls.items);

  React.useEffect(() => {
    // Clean up expired entries from view (does not delete history of clicks, just removes expired links)
    (dispatch as any)(purgeExpired());
  }, [dispatch]);

  return (
    <div>
      <h1 className="h1">📊 Shortener Statistics</h1>
      {items.length === 0 ? (
        <div className="small">No shortened URLs yet.</div>
      ) : (
        items.map(item => (
          <div className="card" key={item.id} style={{ marginBottom: 14 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="h2">/{item.code}</div>
                <div className="small">
                  Created: {fmt(item.createdAt)} &nbsp;•&nbsp; Expires: {fmt(item.expiresAt)}
                </div>
                <div className="small" style={{ wordBreak: "break-all" }}>
                  Original: <a className="link" href={item.longUrl} target="_blank" rel="noreferrer">{item.longUrl}</a>
                </div>
              </div>
              <div className="tag">Total clicks: {item.clicks}</div>
            </div>

            <div className="h2" style={{ marginTop: 12 }}>Click details</div>
            {item.events.length === 0 ? (
              <div className="small">No clicks yet.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Source</th>
                    <th>Location (coarse)</th>
                  </tr>
                </thead>
                <tbody>
                  {item.events.map(ev => (
                    <tr key={ev.id}>
                      <td>{fmt(ev.timestamp)}</td>
                      <td><span className="kbd">{ev.source}</span></td>
                      <td>{ev.location ?? "Unknown"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
}
