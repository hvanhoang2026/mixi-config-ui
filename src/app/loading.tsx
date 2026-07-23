export default function Loading() {
  return (
    <main className="route-state" role="status" aria-live="polite">
      <span
        className="route-state__rail route-state__rail--loading"
        aria-hidden="true"
      />
      <p className="route-state__eyebrow">Configuration workspace</p>
      <h1>Loading workspace</h1>
      <p>Preparing projects, environments, and service configuration.</p>
    </main>
  );
}
