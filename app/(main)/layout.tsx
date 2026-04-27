import { Suspense } from "react";
import { cookies } from "next/headers";
import MainShell from "@/components/layout/MainShell";
import { SidebarStoreProvider } from "@/stores/sidebar";

async function SidebarBoot({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialIsOpen = cookieStore.get("sidebar-open")?.value !== "0";
  return (
    <SidebarStoreProvider initialIsOpen={initialIsOpen}>
      {children}
    </SidebarStoreProvider>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <SidebarBoot>
        <MainShell>{children}</MainShell>
      </SidebarBoot>
    </Suspense>
  );
}
