/** Format Sanity datetime / date string as `MM.DD.YYYY` (UTC calendar date). */
export function formatPublishDateMmDdYyyy(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }

  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00.000Z` : iso);
  if (Number.isNaN(d.getTime())) {
    return null;
  }

  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = String(d.getUTCFullYear());

  return `${mm}.${dd}.${yyyy}`;
}

/** Format Sanity datetime / date string as `MM.YYYY` (UTC calendar month + year). */
export function formatReleaseDateMmYyyy(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }

  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00.000Z` : iso);
  if (Number.isNaN(d.getTime())) {
    return null;
  }

  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getUTCFullYear());

  return `${mm}.${yyyy}`;
}
