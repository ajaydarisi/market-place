// Disintermediation guard (B2): mask emails and phone numbers in user-authored
// text so contact details can't be traded to move a deal off-platform. This is
// "redact and warn" — the masked placeholder is itself the signal to users.
//
// URLs are intentionally left alone: developers legitimately share GitHub,
// portfolio, and design links. Phone detection requires a separator or a
// leading '+' so plain budget figures (e.g. 80000) are not masked.

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_CANDIDATE_RE = /\+?\d[\d\s().-]{5,}\d/g;

// Shapes that look like a phone-number run but are legitimate content we must
// not mask: ISO dates (2026-07-10), an IPv4 address (192.168.1.100), and
// version-like dotted numbers (1.2.3). Checked against the trimmed match.
const ISO_DATE_RE = /^\d{4}-\d{1,2}-\d{1,2}$/;
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;
const DOTTED_VERSION_RE = /^\d+(\.\d+){2,}$/;

export const REDACTION_PLACEHOLDER = "[contact hidden]";

function looksLikePhone(match: string): boolean {
  const trimmed = match.trim();
  if (ISO_DATE_RE.test(trimmed) || IPV4_RE.test(trimmed) || DOTTED_VERSION_RE.test(trimmed)) {
    return false;
  }
  const digitCount = trimmed.replace(/\D/g, "").length;
  // Phone numbers run 7–15 digits; longer runs are IDs/reference numbers, not
  // phones. Require a separator or a leading '+' so plain figures (e.g. 80000)
  // and long digit strings are left alone.
  if (digitCount < 7 || digitCount > 15) return false;
  return /[\s().-]/.test(trimmed) || trimmed.startsWith("+");
}

export function redactContactInfo(input: string): { text: string; redacted: boolean } {
  if (!input) return { text: input, redacted: false };

  let redacted = false;

  let text = input.replace(EMAIL_RE, () => {
    redacted = true;
    return REDACTION_PLACEHOLDER;
  });

  text = text.replace(PHONE_CANDIDATE_RE, (match) => {
    if (looksLikePhone(match)) {
      redacted = true;
      return REDACTION_PLACEHOLDER;
    }
    return match;
  });

  return { text, redacted };
}
