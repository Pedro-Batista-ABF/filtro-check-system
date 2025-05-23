
import Header from './Header';
import { useState } from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  HeaderExtra?: React.ReactNode;
}

export default function PageLayout({ children, HeaderExtra }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {HeaderExtra && (
          <div className="mb-4 flex justify-end">
            {HeaderExtra}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
