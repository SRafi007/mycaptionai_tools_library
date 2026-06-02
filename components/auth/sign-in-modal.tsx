"use client";

import React, { useState, useEffect, useRef } from "react";
import { signInWithOAuth } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Check your email! We've sent a confirmation link to your inbox.",
        });
        setEmail("");
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: `Failed to initiate login with ${provider}.` });
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div 
        className="auth-modal-card" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Close dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">Welcome to MyCaptionAI</h2>
          <p className="auth-modal-subtitle">
            Sign in to unlock future personalized features like saved playbooks, pinned tools, and social posts.
          </p>
        </div>

        {/* OAuth Providers (Commented out until enabled) */}
        {/*
        <div className="auth-oauth-group">
          <button 
            type="button" 
            className="auth-oauth-btn auth-google-btn" 
            onClick={() => handleOAuthLogin("google")}
            disabled={loading}
          >
            <svg className="auth-oauth-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.84-2.45 2.4v2c2.31-2.13 3.5-5.26 3.5-8.25Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.13-2.42c-.87.59-1.99.94-3.19.94-3.23 0-5.96-2.18-6.94-5.12H3.515v2.5C5.505 20.93 8.575 24 12 24Z" />
              <path fill="#FBBC05" d="M5.06 14.49a7.17 7.17 0 0 1 0-4.99v-2.5H3.515a11.94 11.94 0 0 0 0 9.99l1.545-2.5Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 8.57 0 5.51 3.07 3.515 7.08l1.545 2.5c.98-2.94 3.71-5.12 6.94-5.12Z" />
            </svg>
            Continue with Google
          </button>

          <button 
            type="button" 
            className="auth-oauth-btn auth-github-btn" 
            onClick={() => handleOAuthLogin("github")}
            disabled={loading}
          >
            <svg className="auth-oauth-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>
        */}

        {/* Magic Link Email Form */}
        <form onSubmit={handleMagicLinkSubmit} className="auth-email-form">
          <div className="auth-form-group">
            <input
              type="email"
              className="auth-form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || (message?.type === "success")}
              required
            />
          </div>

          {message && (
            <div className={`auth-status-message msg-${message.type}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary auth-submit-btn" 
            disabled={loading || !email || (message?.type === "success")}
          >
            {loading ? (
              <span className="auth-btn-spinner">Sending...</span>
            ) : (
              "Send Confirmation Link"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-modal-footer">
          <p>We'll email you a secure link to log in instantly. No password required.</p>
        </div>
      </div>
    </div>
  );
}
