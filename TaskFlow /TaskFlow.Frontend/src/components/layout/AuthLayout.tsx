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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full space-y-6 bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        {showLogo && (
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
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
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout; 