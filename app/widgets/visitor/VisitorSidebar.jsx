"use client";

import Image from "next/image";
import Link from "next/link";

import { History, LogOut, Menu, User } from "lucide-react";

export default function VisitorSidebar({ activeTab, onTabChange }) {
  const handleLogout = () => {
    // Later call your logout Server Action here.
    window.location.href = "/";
  };

  return (
    <aside className="sidebar">
      <div className="menu-header">VISITOR PORTAL</div>

      <ul>
        <li className={activeTab === "visitor" ? "active" : ""}>
          <button type="button" onClick={() => onTabChange("visitor")}>
            <User size={17} />
            Visitor Details
          </button>
        </li>

        <li className={activeTab === "user-history" ? "active" : ""}>
          <button type="button" onClick={() => onTabChange("user-history")}>
            <History size={17} />
            User History
          </button>
        </li>

        <li>
          <button type="button" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </li>
      </ul>

      <div className="side-bar-main-head" id="mobileSidebarNav">
        <div className="badge-dtl-head">
          <button
            type="button"
            className="sidebar-toggle"
            aria-label="Toggle Menu"
          >
            <Menu size={22} />
          </button>

          <Link href="/">
            <Image
              src="/assets/img/main_logo.png"
              width={180}
              height={60}
              alt="GITEX Nigeria"
            />
          </Link>
        </div>
      </div>
    </aside>
  );
}
