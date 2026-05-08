import { createFileRoute } from "@tanstack/react-router";
import { CogwheelOverlay } from "@/components/CogwheelOverlay";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Cogwheel Overlay" },
      { name: "description", content: "Wuthering Waves themed cogwheel overlay UI" },
    ],
  }),
});

function Index() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Faint stage so the overlay reads as an overlay over something */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, oklch(0.30 0.02 80 / 0.5), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.25 0.02 80 / 0.4), transparent 45%)",
        }}
      />
      <h1 className="sr-only">Cogwheel overlay</h1>
      <CogwheelOverlay />
    </div>
  );
}
