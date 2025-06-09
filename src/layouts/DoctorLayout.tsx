import React, { type ReactNode } from "react";

interface DoctorLayoutProps {
  children: ReactNode;
}

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
  // ...your layout code here
  return (
    <div>
      {/* Layout header, sidebar, etc. */}
      {children}
    </div>
  );
};

export default DoctorLayout;