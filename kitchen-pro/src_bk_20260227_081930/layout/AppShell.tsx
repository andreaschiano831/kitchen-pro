import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TopBar />
      <main className="container" style={{ paddingBottom: 84 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
