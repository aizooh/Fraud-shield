import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MobileSidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth"; // Redirect to auth page after logout
  };

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-neutral-dark text-white p-4">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ml-2 font-semibold text-lg">Fraud Shield</span>
        </div>
        <div className="flex items-center">
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout} 
              className="text-gray-400 hover:text-white hover:bg-gray-700 mr-2"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
          <button onClick={toggleMenu} className="text-gray-300">
            <span className="material-icons">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute z-10 top-16 left-0 right-0 bg-neutral-dark">
          <nav className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/">
              <div 
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md cursor-pointer ${
                  isActive("/") 
                    ? "text-white bg-gray-700" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons mr-3 text-lg">dashboard</span>
                Dashboard
              </div>
            </Link>
            <Link href="/fraud-detection">
              <div 
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md cursor-pointer ${
                  isActive("/fraud-detection") 
                    ? "text-white bg-gray-700" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons mr-3 text-lg">search</span>
                Fraud Detection
              </div>
            </Link>
            <Link href="/transactions">
              <div 
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md cursor-pointer ${
                  isActive("/transactions") 
                    ? "text-white bg-gray-700" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons mr-3 text-lg">history</span>
                Transaction History
              </div>
            </Link>
            <a className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
              <span className="material-icons mr-3 text-lg">bar_chart</span>
              Analytics
            </a>
            <Link href="/profile">
              <div 
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md cursor-pointer ${
                  isActive("/profile") 
                    ? "text-white bg-gray-700" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons mr-3 text-lg">settings</span>
                Account Settings
              </div>
            </Link>
          </nav>
          
          {/* User profile section */}
          {user && (
            <div className="px-5 py-3 border-t border-gray-700">
              <Link href="/profile">
                <div 
                  className="flex items-center text-gray-300 hover:text-white cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Avatar className="h-8 w-8">
                    {user?.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.username} />
                    ) : null}
                    <AvatarFallback className="bg-gray-700 text-white">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-400">{isAdmin ? 'Admin' : 'User'}</p>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
