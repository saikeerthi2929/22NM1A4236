import React from "react";
import { createBrowserRouter, NavLink, Outlet } from "react-router-dom";
import ShortenerPage from "@pages/ShortenerPage";
import StatsPage from "@pages/StatsPage";
import RedirectPage from "@pages/RedirectPage";

function Layout() {
  return (
    <div className="container">
      <div className="nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Shortener</NavLink>
        <NavLink to="/stats" className={({ isActive }) => isActive ? "active" : ""}>Statistics</NavLink>
      </div>
      <Outlet />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <ShortenerPage /> },
      { path: "/stats", element: <StatsPage /> },
    ],
  },
  // This route handles visiting a shortcode directly and performs the redirect.
  { path: "/:code", element: <RedirectPage /> }
]);
