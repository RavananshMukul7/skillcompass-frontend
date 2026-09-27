import '../../styles-background-live.css';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAppPath } from '../../router/appRouter';

export default function AppLayout({ children }: { children: ReactNode }) {
  const path = useAppPath();

  return (
    <div className="app-shell">
      <div className="ambient" aria-hidden="true">
        <div className="ambient-orbital orbital-a" />
        <div className="ambient-orbital orbital-b" />
        <div className="ambient-orbital orbital-c" />
        <div className="ambient-shape ambient-purple" />
        <div className="ambient-shape ambient-blue-small" />
        <div className="ambient-shape ambient-blue-big" />
        <div className="ambient-shape ambient-lilac" />
        <div className="ambient-particle p1" />
        <div className="ambient-particle p2" />
        <div className="ambient-particle p3" />
        <div className="ambient-particle p4" />
        <div className="ambient-particle p5" />
      </div>

      <Sidebar path={path} />

      <div className="sc-content-column">
        <div className="sc-page-content">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}
