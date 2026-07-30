import Sidebar from "../../components/Sidebar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* TOP HORIZONTAL NAVIGATION BAR */}
      <Sidebar />
      
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 bg-white">
        {children}
      </main>
    </div>
  );
}