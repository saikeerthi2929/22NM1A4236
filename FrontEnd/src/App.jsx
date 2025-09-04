import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import ShortenerPage from "./pages/ShortenerPage";
import StatsPage from "src/pages/StatsPage";
import { resolveLocal, recordClick } from "./apiStub";

export default function App() {
  return (
    <Router>
      <div className="container">
        <header>
          <h1>URL Shortener (Frontend Only)</h1>
          <nav>
            <Link to="/">Shorten</Link> | <Link to="/stats">Statistics</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ShortenerPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/r/:code" element={<ClientRedirect />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Handles redirecting to original long URL
function ClientRedirect() {
  const params = useParams();

  useEffect(() => {
    let mounted = true;

    async function doRedirect() {
      const code = params.code;
      const res = await resolveLocal(code);
      if (res.error) {
        if (mounted) window.location.href = "/";
        return;
      }

      // prepare click metadata
      const at = new Date().toISOString();
      const source = document.referrer || navigator.userAgent || "unknown";

      function getCoarseLocation() {
        return new Promise((resolve) => {
          if (!navigator.geolocation) return resolve("Unknown");
          let settled = false;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (settled) return;
              settled = true;
              const lat = Math.round(pos.coords.latitude * 10) / 10;
              const lon = Math.round(pos.coords.longitude * 10) / 10;
              resolve({ lat, lon });
            },
            () => {
              if (settled) return;
              settled = true;
              resolve("Unknown");
            },
            { maximumAge: 60 * 1000, timeout: 2000 }
          );
        });
      }

      const location = await getCoarseLocation();
      const clickMeta = { at, source, location };
      await recordClick(code, clickMeta);

      if (mounted) window.location.href = res.url;
    }

    doRedirect();
    return () => {
      mounted = false;
    };
  }, [params.code]);

  return <div style={{ padding: 20 }}>Redirecting…</div>;
}
