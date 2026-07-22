"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const IDLE_LIMIT_MS = 30 * 60 * 1000;
const WARNING_WINDOW_MS = 5 * 60 * 1000;
const ACTIVITY_WRITE_INTERVAL_MS = 60 * 1000;
const ACTIVITY_KEY = "investo:last-activity";

function readLastActivity() {
  const stored = window.localStorage.getItem(ACTIVITY_KEY);
  const parsed = stored ? Number(stored) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : Date.now();
}

function formatRemaining(milliseconds: number) {
  const minutes = Math.max(1, Math.ceil(milliseconds / 60000));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function InvestoSessionTimeout() {
  const [remainingMs, setRemainingMs] = useState(IDLE_LIMIT_MS);
  const [showWarning, setShowWarning] = useState(false);
  const lastWriteRef = useRef(0);
  const signingOutRef = useRef(false);

  const signOutForInactivity = useCallback(async () => {
    if (signingOutRef.current) {
      return;
    }

    signingOutRef.current = true;

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      window.localStorage.removeItem(ACTIVITY_KEY);
      window.location.assign("/v2/login?reason=inactive");
    }
  }, []);

  const recordActivity = useCallback((force = false) => {
    const now = Date.now();

    if (!force && now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) {
      return;
    }

    lastWriteRef.current = now;
    window.localStorage.setItem(ACTIVITY_KEY, String(now));
    setRemainingMs(IDLE_LIMIT_MS);
    setShowWarning(false);
  }, []);

  useEffect(() => {
    if (!window.localStorage.getItem(ACTIVITY_KEY)) {
      recordActivity(true);
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => recordActivity(false);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        recordActivity(false);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ACTIVITY_KEY && event.newValue) {
        const latest = Number(event.newValue);

        if (Number.isFinite(latest)) {
          const remaining = IDLE_LIMIT_MS - (Date.now() - latest);
          setRemainingMs(Math.max(0, remaining));
          setShowWarning(
            remaining > 0 && remaining <= WARNING_WINDOW_MS,
          );
        }
      }
    };

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, handleActivity, {
        passive: true,
      });
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - readLastActivity();
      const remaining = IDLE_LIMIT_MS - elapsed;

      if (remaining <= 0) {
        void signOutForInactivity();
        return;
      }

      setRemainingMs(remaining);
      setShowWarning(remaining <= WARNING_WINDOW_MS);
    }, 15000);

    return () => {
      window.clearInterval(timer);

      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, handleActivity);
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [recordActivity, signOutForInactivity]);

  if (!showWarning) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      className="investo-session-warning"
      role="status"
    >
      <div>
        <strong>Your Investo session is about to close.</strong>
        <span>
          For your security, inactivity will sign you out in{" "}
          {formatRemaining(remainingMs)}.
        </span>
      </div>

      <button onClick={() => recordActivity(true)} type="button">
        Continue session
      </button>
    </aside>
  );
}
