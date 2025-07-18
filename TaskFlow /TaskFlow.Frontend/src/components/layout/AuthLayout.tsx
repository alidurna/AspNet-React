import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showLogo?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, description, showLogo = true }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 lg:p-8">
      <Card className="max-w-md w-full space-y-6 p-8 border-0 rounded-3xl shadow-xl bg-white/95 backdrop-blur-xl">
        {showLogo && (
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
        )}
        <div>
          <h2 className="mt-6 text-center text-2xl font-light tracking-wide text-neutral-800 leading-relaxed">
            {title}
          </h2>
          <p className="mt-3 text-center text-sm text-neutral-500 font-light leading-relaxed">
            {description}
          </p>
        </div>
        {children}
      </Card>
    </div>
  );
};

export default AuthLayout; 