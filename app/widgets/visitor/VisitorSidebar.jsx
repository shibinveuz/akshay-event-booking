"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, LogOut, Menu, User } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { logoutVisitorAction } from "@/app/lib/api/visitor";
import { useAuthState } from "@/app/context/AuthStateContext";

export default function VisitorSidebar({ activeTab, onTabChange }) {
  const router = useRouter();
  const { setAuthenticated } = useAuthState();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setLoggingOut(true);
      const result = await logoutVisitorAction();

      if (!result?.success) {
        throw new Error("Unable to end your session.");
      }

      setAuthenticated(false);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
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
            <button type="button" onClick={handleLogoutClick}>
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

      <LogoutConfirmModal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        onClick={confirmLogout}
        isLoading={loggingOut}
      />
    </>
  );
}
