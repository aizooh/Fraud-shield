import { useState } from 'react';
import { Link, useLocation } from 'wouter';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-neutral-dark text-white p-4">
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
          <span className="ml-2 font-semibold text-lg">FraudShield</span>
        </div>
        <button
          onClick={toggleMenu}
          className="text-gray-300"
          aria-label="Toggle menu"
        >
          <span className="material-icons">
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-neutral-dark z-10">
          <nav className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/">
              <a
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  location === '/'
                    ? 'text-white bg-gray-700'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="material-icons mr-3 text-lg">dashboard</span>
                Dashboard
              </a>
            </Link>
            <Link href="/fraud-detection">
              <a
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  location === '/fraud-detection'
                    ? 'text-white bg-gray-700'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="material-icons mr-3 text-lg">search</span>
                Fraud Detection
              </a>
            </Link>
            <Link href="/transactions">
              <a
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  location === '/transactions'
                    ? 'text-white bg-gray-700'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="material-icons mr-3 text-lg">history</span>
                Transaction History
              </a>
            </Link>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span className="material-icons mr-3 text-lg">bar_chart</span>
              Analytics
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span className="material-icons mr-3 text-lg">settings</span>
              Settings
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
