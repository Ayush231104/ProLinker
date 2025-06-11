import React from "react";
import NavBarComponent from "@/Components/Navbar";

function UserLayout({ children }) {
  return (
    <div className="fixed inset-0 overflow-y-scroll hide-scrollbar">
      <NavBarComponent />
      {children}
    </div>
  );
}

export default UserLayout;
