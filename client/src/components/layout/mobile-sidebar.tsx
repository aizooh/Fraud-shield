import { useState } from "react";
import { useLocation, Link } from "wouter";

export default function MobileSidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
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
          <span className="ml-2 font-semibold text-lg">FraudShield</span>
        </div>
        <button onClick={toggleMenu} className="text-gray-300">
          <span className="material-icons">{isMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute z-10 top-16 left-0 right-0 bg-neutral-dark">
          <nav className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/">
              <a 
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  isActive("/") 
                    ? "text-white bg-gray-700" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons mr-3 text-lg">dashboard</span>
                Dashboard
              </a>
            </Link>
            <Link href="/fraud-detection">
              <a 
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  isActive("/fraud-detection") 
                    ? "text-white bg-gray-700" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons mr-3 text-lg">search</span>
                Fraud Detection
              </a>
            </Link>
            <Link href="/transactions">
              <a 
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  isActive("/transactions") 
                    ? "text-white bg-gray-700" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="material-icons mr-3 text-lg">history</span>
                Transaction History
              </a>
            </Link>
            <a className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
              <span className="material-icons mr-3 text-lg">bar_chart</span>
              Analytics
            </a>
            <a className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
              <span className="material-icons mr-3 text-lg">settings</span>
              Settings
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
