import {
  CalendarRange,
  ClockIcon,
  LinkIcon,
  LayoutGrid,
  CalendarDays,
  Menu,
  X
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { PROTECTED_ROUTES } from "@/routes/common/routePaths";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Event types",
    url: PROTECTED_ROUTES.EVENT_TYPES,
    icon: LinkIcon,
  },
  {
    title: "Meetings",
    url: PROTECTED_ROUTES.MEETINGS,
    icon: CalendarRange,
  },
  {
    title: "Integrations & apps",
    url: PROTECTED_ROUTES.INTEGRATIONS,
    icon: LayoutGrid,
    separator: true,
  },
  {
    title: "Availability",
    url: PROTECTED_ROUTES.AVAILBILITIY,
    icon: ClockIcon,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = location.pathname;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-full bg-white shadow-md border border-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        className={cn(
          `h-screen sticky top-0 bg-white border-r border-gray-200 shadow-lg 
          transition-all duration-300 lg:shadow-none
          ${state !== "collapsed" ? "w-[280px]" : "w-[80px]"}`,
          // Mobile styles
          "fixed lg:relative z-40",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarHeader
          className={cn(
            "py-4 px-5 border-b border-gray-100",
            state === "collapsed" ? "px-3" : ""
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center 
                size-10 rounded-lg bg-primary/10 text-primary"
              >
                <CalendarDays className="size-6" />
              </div>
              {state !== "collapsed" && (
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                  Shai-Calendar
                </h2>
              )}
            </div>

            <SidebarTrigger
              className={cn(
                "cursor-pointer text-gray-500 hover:text-primary hidden lg:block",
                state === "collapsed" ? "transform rotate-180" : ""
              )}
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  className={cn(
                    "group transition-all duration-300 hover:bg-primary/10",
                    item.url === pathname 
                      ? "bg-primary/10 text-primary" 
                      : "text-gray-600 hover:text-primary"
                  )}
                  isActive={item.url === pathname}
                  asChild
                >
                  <Link
                    to={item.url}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg w-full font-medium group-hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon 
                      className="w-5 h-5 stroke-[2] group-hover:text-primary transition-colors" 
                    />
                    {state !== "collapsed" && (
                      <span className="flex-1">{item.title}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
                {item.separator && (
                  <div className="my-2 border-t border-gray-100" />
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </>
  );
}