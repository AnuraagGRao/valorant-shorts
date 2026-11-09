import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface TargetLockReticleProps {
  impactFrame: number;
  x?: number; // % from left, default 50
  y?: number; // % from top, default 48 (crosshair position)
}

export const TargetLockReticle: React.FC<TargetLockReticleProps> = ({
  impactFrame,
  x = 50,
  y = 48,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Reticle active from (impactFrame - 30) to (impactFrame + 18)
  const startFrame = impactFrame - 26;
  const endFrame = impactFrame + 18;

  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  const framesSinceLock = frame - startFrame;
  const framesSinceImpact = frame - impactFrame;
  const isPostImpact = framesSinceImpact >= 0;

  // Expanding ring spring on appearance
  const enterScale = spring({
    frame: framesSinceLock,
    fps,
    config: { damping: 12, mass: 0.4, stiffness: 180 },
  });

  // Snap shrink on impact
  const impactSnap = isPostImpact
    ? interpolate(framesSinceImpact, [0, 4, 18], [0.85, 1.3, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const currentScale = enterScale * impactSnap;

  // Rotation of outer radar tick marks
  const rotation = framesSinceLock * 4.5;

  // Color turns from neon cyan to intense gold/red on impact
  const mainColor = isPostImpact ? "#FFE600" : "#00f0ff";
  const glowColor = isPostImpact
    ? "rgba(255, 230, 0, 0.9)"
    : "rgba(0, 240, 255, 0.85)";

  const opacity = isPostImpact
    ? interpolate(framesSinceImpact, [0, 18], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : interpolate(framesSinceLock, [0, 8], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${currentScale})`,
        opacity,
        pointerEvents: "none",
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 180,
        height: 180,
      }}
    >
      {/* Outer Rotating Radar Ring */}
      <div
        style={{
          position: "absolute",
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: `2px dashed ${mainColor}`,
          boxShadow: `0 0 25px ${glowColor}, inset 0 0 15px ${glowColor}`,
          transform: `rotate(${rotation}deg)`,
        }}
      />

      {/* Inner Precision Crosshair Circle */}
      <div
        style={{
          position: "absolute",
          width: 70,
          height: 70,
          borderRadius: "50%",
          border: `2.5px solid ${mainColor}`,
          boxShadow: `0 0 15px ${glowColor}`,
        }}
      />

      {/* Crosshair Corner Brackets */}
      {/* Top Left */}
      <div
        style={{
          position: "absolute",
          top: 15,
          left: 15,
          width: 20,
          height: 20,
          borderTop: `3px solid ${mainColor}`,
          borderLeft: `3px solid ${mainColor}`,
        }}
      />
      {/* Top Right */}
      <div
        style={{
          position: "absolute",
          top: 15,
          right: 15,
          width: 20,
          height: 20,
          borderTop: `3px solid ${mainColor}`,
          borderRight: `3px solid ${mainColor}`,
        }}
      />
      {/* Bottom Left */}
      <div
        style={{
          position: "absolute",
          bottom: 15,
          left: 15,
          width: 20,
          height: 20,
          borderBottom: `3px solid ${mainColor}`,
          borderLeft: `3px solid ${mainColor}`,
        }}
      />
      {/* Bottom Right */}
      <div
        style={{
          position: "absolute",
          bottom: 15,
          right: 15,
          width: 20,
          height: 20,
          borderBottom: `3px solid ${mainColor}`,
          borderRight: `3px solid ${mainColor}`,
        }}
      />

      {/* Center Target Dot */}
      <div
        style={{
          position: "absolute",
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: mainColor,
          boxShadow: `0 0 10px ${glowColor}`,
        }}
      />

      {/* Target Locked Label */}
      <div
        style={{
          position: "absolute",
          bottom: -32,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: "0.2em",
          color: mainColor,
          backgroundColor: "rgba(0,0,0,0.85)",
          padding: "3px 10px",
          borderRadius: 4,
          border: `1px solid ${mainColor}`,
          textShadow: `0 0 10px ${glowColor}`,
          whiteSpace: "nowrap",
        }}
      >
        {isPostImpact ? "CONFIRMED // 🎯 1-TAP" : "LOCK-ON // ACQUIRED"}
      </div>
    </div>
  );
};

