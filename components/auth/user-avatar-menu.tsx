"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/hooks";
import Image from "next/image";

export default function UserAvatarMenu() {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const userEmail = user.email || "";
  const avatarUrl = profile?.avatar_url || "";
  
  // Initials fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="user-menu-container" ref={dropdownRef}>
      {/* Avatar Button */}
      <button 
        className="user-menu-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={34}
            height={34}
            className="user-menu-avatar"
          />
        ) : (
          <div className="user-menu-avatar-fallback">{initials}</div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="user-menu-dropdown" role="menu">
          {/* User Info */}
          <div className="user-menu-header">
            <p className="user-menu-name">{displayName}</p>
            <p className="user-menu-email">{userEmail}</p>
          </div>
          
          <div className="user-menu-divider" />

          {/* Menu Items */}
          <div className="user-menu-items">
            {/* Future/Scale Features */}
            <div className="user-menu-item item-disabled" role="menuitem">
              <span className="menu-item-icon">🔖</span>
              <span className="menu-item-label">Saved Tools</span>
              <span className="menu-item-badge">Soon</span>
            </div>

            <div className="user-menu-item item-disabled" role="menuitem">
              <span className="menu-item-icon">📚</span>
              <span className="menu-item-label">My Playbooks</span>
              <span className="menu-item-badge">Soon</span>
            </div>

            <div className="user-menu-item item-disabled" role="menuitem">
              <span className="menu-item-icon">📝</span>
              <span className="menu-item-label">Saved Posts</span>
              <span className="menu-item-badge">Soon</span>
            </div>

            <div className="user-menu-divider" />

            {/* Sign Out Action */}
            <button 
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="user-menu-item item-action"
              role="menuitem"
            >
              <svg className="menu-item-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
