import { Link, useLocation } from "wouter";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();
  const user = useSelector((state: RootState) => state.app.user);
  
  return (
    <div className={`hidden md:flex md:flex-shrink-0 ${className}`}>
      <div className="flex flex-col w-64 bg-neutral-dark">
        <div className="flex items-center justify-center h-16 px-4 bg-neutral-dark border-b border-gray-700">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ml-2 text-white font-semibold text-lg">
              FraudShield
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link href="/">
              <a className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${location === "/" ? "text-white bg-gray-700" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
                <span className="material-icons mr-3 text-lg">dashboard</span>
                Dashboard
              </a>
            </Link>
            <Link href="/fraud-detection">
              <a className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${location === "/fraud-detection" ? "text-white bg-gray-700" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
                <span className="material-icons mr-3 text-lg">search</span>
                Fraud Detection
              </a>
            </Link>
            <Link href="/transactions">
              <a className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${location === "/transactions" ? "text-white bg-gray-700" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
                <span className="material-icons mr-3 text-lg">history</span>
                Transaction History
              </a>
            </Link>
            <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
              <span className="material-icons mr-3 text-lg">bar_chart</span>
              Analytics
            </a>
            <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
              <span className="material-icons mr-3 text-lg">settings</span>
              Settings
            </a>
          </nav>
          <div className="p-4 border-t border-gray-700">
            <a href="#" className="flex items-center text-gray-300 hover:text-white">
              <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                {user ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user ? user.username : "User"}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
