import { Outlet } from 'react-router-dom';

// MarketingShell — dark background wrapper for the landing page.
// Nav + footer are rendered inside Landing.tsx itself for full control.
// Background is controlled by each marketing page itself (Landing handles dark/light)
export function MarketingShell() {
  return <Outlet />;
}
