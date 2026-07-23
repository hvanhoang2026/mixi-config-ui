"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="route-state" role="alert">
      <span className="route-state__rail" aria-hidden="true" />
      <p className="route-state__eyebrow">Configuration workspace</p>
      <h1>Unable to load this view</h1>
      <p>Your changes were not submitted. Try loading the workspace again.</p>
      <button type="button" className="route-state__action" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
