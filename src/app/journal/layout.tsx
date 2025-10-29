import { AppHeader } from "@/components/layout/app-header";

export default function JournalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      {children}
    </div>
  );
}
