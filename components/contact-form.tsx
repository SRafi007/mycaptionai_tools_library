"use client";

import React, { useActionState, useEffect, useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { useAuth } from "@/lib/auth/hooks";

export default function ContactForm() {
  const { user } = useAuth();
  const [state, formAction, isPending] = useActionState(submitContactForm, null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      setName(displayName);
    }
  }, [user]);

  if (state?.success) {
    return (
      <div className="inspired-form-card">
        <div className="inspired-form-inner" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px", marginTop: 0 }}>Message Sent</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 24px" }}>
            {state.message || "Thank you for reaching out. We will get back to you as soon as possible."}
          </p>
          <button onClick={() => window.location.reload()} className="btn-tag-style btn-secondary-tag">
            <span className="btn-tag-icon-box">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
            </span>
            <span>Send another message</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inspired-form-card">
      <form action={formAction} className="inspired-form-inner">

        {state?.error && (
          <p className="form-status form-status-error" style={{ marginBottom: "8px" }}>{state.error}</p>
        )}

        {/* GROUP: your details */}
        <div className="inspired-group">
          <p className="inspired-group-label">your details</p>

          <div className="inspired-two-col">
            <div className="inspired-field">
              <label htmlFor="name" className="inspired-label">
                Name<span className="inspired-req">*</span>
              </label>
              <div className="inspired-input-wrap">
                <svg className="inspired-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"/></svg>
                <input
                  type="text" id="name" name="name"
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" required disabled={isPending}
                  className="inspired-input"
                />
              </div>
            </div>

            <div className="inspired-field">
              <label htmlFor="email" className="inspired-label">
                Email<span className="inspired-req">*</span>
              </label>
              <div className="inspired-input-wrap">
                <svg className="inspired-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                <input
                  type="email" id="email" name="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" required disabled={isPending}
                  className="inspired-input"
                />
              </div>
            </div>
          </div>

          <div className="inspired-field">
            <label htmlFor="subject_type" className="inspired-label">
              Subject<span className="inspired-req">*</span>
            </label>
            <div className="inspired-select-wrap">
              <svg className="inspired-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <svg className="inspired-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              <select id="subject_type" name="subject_type" required disabled={isPending} defaultValue="general" className="inspired-select">
                <option value="general">General Conversation</option>
                <option value="sponsorship">Sponsorship / Advertising</option>
                <option value="collaboration">Partnership / Collaboration</option>
                <option value="issue">Report an Issue / Bug</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>
          </div>
        </div>

        {/* GROUP: your message */}
        <div className="inspired-group">
          <p className="inspired-group-label">your message</p>

          <div className="inspired-field">
            <label htmlFor="message" className="inspired-label">
              Message<span className="inspired-req">*</span>
            </label>
            <textarea
              id="message" name="message" rows={6}
              placeholder="Write your message here..."
              required disabled={isPending}
              className="inspired-textarea"
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isPending} className="btn-tag-style btn-primary-tag inspired-submit-btn">
          <span className="btn-tag-icon-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
          </span>
          <span>{isPending ? "Sending..." : "Send Message"}</span>
        </button>

        <p className="inspired-fineprint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          We reply within 24–48 hours
        </p>
      </form>
    </div>
  );
}
