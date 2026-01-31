import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const Layout = () => {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: 'linear-gradient(180deg, hsl(142 60% 96%) 0%, hsl(120 40% 98%) 100%)'
      }}
    >
      <Header />
      <main className="pb-safe-area-inset-bottom">
        <Outlet />
      </main>
    </div>
  );
};