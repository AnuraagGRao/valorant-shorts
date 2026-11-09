import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const WonBannerFreeze: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({
  title = "CLUTCH WON",
  subtitle = "ENEMY TEAM ELIMINATED // ACE",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.4, stiffness: 180 },
  });

  const glowPulse = Math.sin(frame * 0.15) * 0.2 + 0.8;
  const rayRotation = frame * 1.2;

  const bgFlash = interpolate(frame, [0, 8], [0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      {/* Golden Ray Burst */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          background:
            "conic-gradient(from 0deg, rgba(255, 230, 0, 0.2) 0deg, transparent 30deg, rgba(0, 240, 255, 0.2) 60deg, transparent 90deg, rgba(255, 230, 0, 0.2) 120deg, transparent 150deg, rgba(0, 240, 255, 0.2) 180deg, transparent 210deg, rgba(255, 230, 0, 0.2) 240deg, transparent 270deg, rgba(0, 240, 255, 0.2) 300deg, transparent 330deg, rgba(255, 230, 0, 0.2) 360deg)",
          transform: `rotate(${rayRotation}deg)`,
          opacity: 0.85,
        }}
      />

      {/* Main Banner Box */}
      <div
        style={{
          transform: `scale(${scale})`,
          padding: "24px 60px",
          background:
            "linear-gradient(180deg, rgba(20, 24, 38, 0.95) 0%, rgba(10, 12, 20, 0.98) 100%)",
          borderTop: "3px solid #FFE600",
          borderBottom: "3px solid #00f0ff",
          borderRadius: 16,
          boxShadow: `0 0 50px rgba(255, 230, 0, ${0.4 * glowPulse}), 0 20px 60px rgba(0,0,0,0.9)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: "#FFE600",
            textTransform: "uppercase",
            textShadow: "0 0 30px rgba(255, 230, 0, 0.9), 0 4px 10px #000",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "0.22em",
            color: "#00f0ff",
            textTransform: "uppercase",
            textShadow: "0 0 15px rgba(0, 240, 255, 0.8)",
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Flash */}
      {bgFlash > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(255, 230, 0, ${bgFlash})`,
            mixBlendMode: "screen",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

