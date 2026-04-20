'use client';

export function BackgroundVideo() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* ── Atmospheric Overlays ── */}
      <div className="absolute inset-0 bg-linear-to-b from-amber-950/20 via-transparent to-black/40 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay z-10 pointer-events-none" />

      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] brightness-[1.1]"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
