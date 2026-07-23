import Link from "next/link";

export default function NotFound() {
  return (
    <main className="route-state">
      <span className="route-state__rail" aria-hidden="true" />
      <p className="route-state__eyebrow">404 · Route unavailable</p>
      <h1>Configuration page not found</h1>
      <p>
        The requested workspace route does not exist or is no longer available.
      </p>
      <Link className="route-state__action" href="/config-center">
        Return to Config Center
      </Link>
    </main>
  );
}
