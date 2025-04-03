import { useStore } from "@/store/store";
import { signOut } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { AUTH_ROUTES } from "@/routes/common/routePaths";
import { LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Header = () => {
  const { user, clearUser, clearAccessToken, clearExpiresAt } = useStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      clearUser();
      clearAccessToken();
      clearExpiresAt();
      navigate(AUTH_ROUTES.SIGN_IN);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="w-full py-4 px-4 lg:px-0 mt-14 lg:mt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </div>
              </div>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;