/** First letter of each whitespace-separated word, uppercased (e.g. contributor name → initials). */
export function initialsFromContributorName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "";
  }

  return parts.map((part) => (part[0] ?? "").toUpperCase()).join("");
}

/**
 * Initials for the Reclus index first column: one set per contributor, joined with ` · `.
 * Falls back to the interview’s `authorInitials` when no contributor names produce initials.
 */
export function formatInterviewLeadInitials(
  contributors: Array<{ name: string | null } | null> | null | undefined,
  authorInitials: string | null | undefined
): string {
  const fromContributors = (contributors ?? [])
    .map((c) => c?.name)
    .filter((n): n is string => Boolean(n?.trim()))
    .map((n) => initialsFromContributorName(n))
    .filter(Boolean);

  if (fromContributors.length) {
    return fromContributors.join(" · ");
  }

  return (authorInitials ?? "").trim();
}
