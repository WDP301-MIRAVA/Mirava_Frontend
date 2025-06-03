import React, { type ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // ...your layout code here
  return (
    <div>
      {/* Layout header, sidebar, etc. */}
      {children}
    </div>
  );
};

export default AdminLayout;