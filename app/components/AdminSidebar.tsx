"use client";
import type { MenuItem } from "@/src/types";
import Sidebar from "./Sidebar";

export default function AdminSidebar({
  menuItems,
  currentRole,
}: {
  menuItems: MenuItem[];
  currentRole: string;
}) {
  return <Sidebar menuItems={menuItems} currentRole={currentRole} />;
}
