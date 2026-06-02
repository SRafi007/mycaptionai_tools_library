"use client";

import React, { useActionState, useEffect, useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { useAuth } from "@/lib/auth/hooks";

export default function ContactForm() {
  const { user } = useAuth();
  const [state, formAction, isPending] = useActionState(submitContactForm, null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Pre-fill user info if authenticated
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      setName(displayName);
    }
  }, [user]);

  if (state?.success) {
    return (
      <div className="card contact-success-card">
        <div className="contact-success-icon">🎉</div>
        <h3 className="contact-success-title">Message Sent!</h3>
        <p className="contact-success-desc">
          {state.message || "Thank you for reaching out. We will get back to you as soon as possible."}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-outline btn-sm"
          style={{ marginTop: "16px" }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="contact-form">
      {state?.error && (
        <div className="contact-status-error">
          ⚠️ {state.error}
        </div>
      )}

      {/* Name Input */}
      <div className="contact-form-group">
        <label htmlFor="name" className="contact-form-label">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          disabled={isPending}
          className="contact-form-input"
        />
      </div>

      {/* Email Input */}
      <div className="contact-form-group">
        <label htmlFor="email" className="contact-form-label">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          disabled={isPending}
          className="contact-form-input"
        />
      </div>

      {/* Subject Type Dropdown */}
      <div className="contact-form-group">
        <label htmlFor="subject_type" className="contact-form-label">Subject</label>
        <div className="contact-select-wrapper">
          <select
            id="subject_type"
            name="subject_type"
            required
            disabled={isPending}
            className="contact-form-select"
            defaultValue="general"
          >
            <option value="general">General Conversation</option>
            <option value="sponsorship">Sponsorship / Advertising</option>
            <option value="collaboration">Partnership / Collaboration</option>
            <option value="issue">Report an Issue / Bug</option>
            <option value="other">Other Inquiry</option>
          </select>
        </div>
      </div>

      {/* Message Textarea */}
      <div className="contact-form-group">
        <label htmlFor="message" className="contact-form-label">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Write your message here..."
          required
          disabled={isPending}
          className="contact-form-textarea"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary contact-submit-btn"
        style={{ width: "100%", justifyContent: "center" }}
      >
        {isPending ? "Sending message..." : "Send Message"}
      </button>
    </form>
  );
}
