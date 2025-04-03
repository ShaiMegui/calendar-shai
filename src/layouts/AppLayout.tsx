import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen h-screen overflow-hidden bg-[#fafafa]">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="container mx-auto px-4 lg:px-8 py-4 max-w-[1300px]">
            <Header />
            <div className="mt-4 pb-20 lg:pb-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;