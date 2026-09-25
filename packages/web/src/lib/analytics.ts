"use client";

import type { BandKey } from "@enem-quiz/shared/domain";
import posthog from "posthog-js";

/**
 * Product analytics for the quiz funnel. The event catalog is typed so every call site agrees
 * on names and properties. No PII is ever sent: leads are identified by their result id only.
 * Without NEXT_PUBLIC_POSTHOG_KEY every call is a no-op.
 */
export type AnalyticsEvents = {
  quiz_viewed: { resumed: boolean; answered: number };
  question_answered: {
    position: number;
    question_id: number;
    option_position: number;
    changed: boolean;
  };
  question_back: { from_position: number };
  contact_viewed: Record<string, never>;
  lead_submitted: { score: number; band: BandKey };
  lead_submit_failed: { code: string };
  result_viewed: { score: number; band: BandKey };
};

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
let started = false;

export function initAnalytics() {
  if (!KEY || started || typeof window === "undefined") return;
  started = true;
  posthog.init(KEY, {
    // Same-origin reverse proxy (next.config rewrites) so ad blockers don't drop the funnel.
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    autocapture: false,
    disable_session_recording: true,
    // The internal team's usage is not part of the acquisition funnel.
    before_send: (event) => (window.location.pathname.startsWith("/admin") ? null : event),
  });
}

export function track<E extends keyof AnalyticsEvents>(event: E, properties: AnalyticsEvents[E]) {
  if (!started) return;
  posthog.capture(event, properties);
}

/** Ties the anonymous funnel to the lead, keyed by result id (no e-mail or phone). */
export function identifyLead(resultId: string, props: { score: number; band: BandKey }) {
  if (!started) return;
  posthog.identify(resultId, props);
}
