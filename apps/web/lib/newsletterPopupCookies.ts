const NEWSLETTER_SUBSCRIBED_COOKIE = "newsletter_subscribed";
const NEWSLETTER_MODAL_CLOSE_COUNT_COOKIE = "newsletter_modal_close_count";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  const parts = document.cookie.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(prefix));
  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(prefix.length));
}

function setCookie(name: string, value: string, maxAgeSeconds = ONE_YEAR_SECONDS) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function hasNewsletterSubscribedCookie(): boolean {
  return getCookieValue(NEWSLETTER_SUBSCRIBED_COOKIE) === "1";
}

export function markNewsletterSubscribed() {
  setCookie(NEWSLETTER_SUBSCRIBED_COOKIE, "1");
}

export function getNewsletterModalCloseCount(): number {
  const raw = getCookieValue(NEWSLETTER_MODAL_CLOSE_COUNT_COOKIE);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

export function incrementNewsletterModalCloseCount(): number {
  const nextCount = getNewsletterModalCloseCount() + 1;
  setCookie(NEWSLETTER_MODAL_CLOSE_COUNT_COOKIE, String(nextCount));
  return nextCount;
}
