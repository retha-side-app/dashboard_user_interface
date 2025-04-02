import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen">
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;