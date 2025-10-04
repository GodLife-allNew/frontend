import React from 'react';
import TopNav from '@/shared/components/common/navigation/TopNav'
import SideNav from '@/shared/components/common/navigation/SideNav'

const Header = ({ categories }) => {
  return (
    <>
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto">
          <TopNav categories={categories} />
        </div>
      </header>
      <SideNav categories={categories} />
    </>
  );
};

export default Header;