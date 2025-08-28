import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import ChatBot from "./ChatBot";
export const Layout = () => {
  return (
      <div className="min-h-screen bg-gradient-eco">
        <Header />
        <main className="pb-safe-area-inset-bottom">
          <Outlet />
        </main>
        <ChatBot />
      </div>
  );
};