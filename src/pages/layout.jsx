import Sidebar from "@/components/Sidebar";
import React from "react";

export default function RootLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">{children}</div>
    </div>
  );
}
