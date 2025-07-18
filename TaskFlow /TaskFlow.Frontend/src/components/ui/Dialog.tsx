import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, className }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto" onClick={() => onOpenChange(false)}>
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-auto transform transition-all duration-300 ${className || ''}`}
        onClick={(e) => e.stopPropagation()} // Modalı kapatmak için tıklamaların yayılmasını engelle
      >
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return <div className={`relative ${className || ''}`}>{children}</div>;
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div className="text-center sm:text-left mb-4">{children}</div>;
};

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return <h3 className="text-lg font-semibold text-gray-900">{children}</h3>;
};

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return <div className="mt-6 flex justify-end space-x-3">{children}</div>;
}; 