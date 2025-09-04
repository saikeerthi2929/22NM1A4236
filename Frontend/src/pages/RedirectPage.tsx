import React from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@store/configureStore";
import { recordClick } from "@store/slices/urlsSlice";
import { isExpired } from "@utils/time";

export default function RedirectPage() {
  const { code } = useParams<{ code: string }>();
  const dispatch = useDispatch();
  const item = useSelector((s: RootState) => s.urls.items.find(i => i.code === code));

  React.useEffect(() => {
    if (!item) return;

    const source = document.referrer
      ? (new URL(document.referrer).origin === window.location.origin ? "internal" : "external")
      : "direct";

    // Attempt coarse location via Geolocation (optional; may be denied)
    const logAndGo = (location?: string) => {
      (dispatch as any)(recordClick({
        code: item.code,
        event: { timestamp: Date.now(), source, location }
      }));
      if (!isExpired(item.expiresAt)) {
        window.location.replace(item.longUrl);
      }
    };

    if (navigator.geolocation) {
      const t = setTimeout(() => logAndGo(undefined), 1200); // don’t block too long
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(t);
          const { latitude, longitude } = pos.coords;
          const coarse = `lat ${latitude.toFixed(2)}, lon ${longitude.toFixed(2)}`;
          logAndGo(coarse);
        },
        () => {
          clearTimeout(t);
          logAndGo(undefined);
        },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 1000 }
      );
    } else {
      logAndGo(undefined);
    }
  }, [item, dispatch]);

  if (!item) {
    return (
      <div className="container">
        <div className="card">
          <div className="h1">Link not found</div>
          <div className="small">We couldn’t find a short link with code “{code}”.</div>
        </div>
      </div>
    );
  }

  const expired = isExpired(item.expiresAt);

  return (
    <div className="container">
      <div className="card">
        <div className="h1">{expired ? "Link expired" : "Redirecting..."}</div>
        <div className="small" style={{ wordBreak: "break-all" }}>
          {expired
            ? "This short link has expired, so it won't redirect automatically."
            : "Hang tight—taking you to the original address:"}
          <br />
          <a className="link" href={item.longUrl}>{item.longUrl}</a>
        </div>
      </div>
    </div>
  );
}
