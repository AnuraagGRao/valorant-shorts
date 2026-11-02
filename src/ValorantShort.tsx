import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const valorantShortSchema = z.object({
  videoSrc: z.string(),
  startFrame: z.number(),
  killFrameOffset: z.number(),
  title: z.string(),
  playerTag: z.string(),
  weapon: z.string(),
  killType: z.string(),
});

type ValorantShortProps = z.infer<typeof valorantShortSchema>;

export const ValorantShort: React.FC<ValorantShortProps> = ({
  videoSrc,
  startFrame,
  killFrameOffset,
  title,
  playerTag,
  weapon,
  killType,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 1. Screen Shake on Kill Impact
  const framesSinceKill = frame - killFrameOffset;
  let shakeX = 0;
  let shakeY = 0;
  if (framesSinceKill >= 0 && framesSinceKill < 25) {
    const shakeDamp = Math.max(0, 1 - framesSinceKill / 25);
    shakeX = Math.sin(framesSinceKill * 1.5) * 16 * shakeDamp;
    shakeY = Math.cos(framesSinceKill * 1.8) * 14 * shakeDamp;
  }

  // 2. Kill Flash Intensity
  const flashOpacity = interpolate(
    frame,
    [killFrameOffset - 1, killFrameOffset, killFrameOffset + 12],
    [0, 0.45, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 3. Kinetic Pop Animation for Kill Badge
  const badgeScale = spring({
    frame: framesSinceKill,
    fps,
    config: {
      damping: 10,
      mass: 0.5,
      stiffness: 120,
    },
  });

  // 4. Progress bar along bottom
  const progressPercent = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f1923",
        color: "#ece8e1",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* ============================================================ */}
      {/* LAYER 1: BLURRED AMBIENT BACKGROUND                         */}
      {/* ============================================================ */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile(videoSrc)}
          startFrom={startFrame}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(32px) brightness(0.65) saturate(1.2)",
            transform: "scale(1.25)",
          }}
        />
        {/* Subtle dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, transparent 30%, rgba(15, 25, 35, 0.85) 90%)",
          }}
        />
      </AbsoluteFill>

      {/* ============================================================ */}
      {/* LAYER 2: TOP HUD & TITLE BAR                                 */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "rgba(255, 70, 85, 0.15)",
            border: "1px solid #ff4655",
            borderRadius: 20,
            padding: "6px 20px",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: "#ff4655",
            textTransform: "uppercase",
            boxShadow: "0 0 15px rgba(255, 70, 85, 0.3)",
          }}
        >
          {playerTag}
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textAlign: "center",
            textTransform: "uppercase",
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {title}
        </div>
      </div>

      {/* ============================================================ */}
      {/* LAYER 3: KILLFEED MAGNIFIER PIP (Picture-In-Picture)        */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: "50%",
          transform: "translateX(-50%)",
          width: 620,
          height: 180,
          borderRadius: 16,
          overflow: "hidden",
          border: "2px solid rgba(255, 70, 85, 0.8)",
          boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 70, 85, 0.35)",
          zIndex: 10,
          backgroundColor: "#000",
        }}
      >
        {/* We zoom in and translate to the top-right killfeed of the 1920x1080 video */}
        <div
          style={{
            position: "absolute",
            width: 1920,
            height: 1080,
            transform: "translate(-1360px, -40px) scale(1.15)",
            transformOrigin: "top left",
          }}
        >
          <OffthreadVideo src={staticFile(videoSrc)} startFrom={startFrame} />
        </div>
        {/* HUD label for the PIP */}
        <div
          style={{
            position: "absolute",
            bottom: 6,
            right: 12,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#ff4655",
            background: "rgba(0,0,0,0.6)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          KILLFEED ZOOM //
        </div>
      </div>

      {/* ============================================================ */}
      {/* LAYER 4: CENTER GAMEPLAY WINDOW (16:9 Focus)                 */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 610,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1080,
          height: 608,
          borderRadius: 20,
          overflow: "hidden",
          border: "2px solid rgba(255, 255, 255, 0.15)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(255, 70, 85, 0.25)",
          zIndex: 8,
          backgroundColor: "#000",
        }}
      >
        <OffthreadVideo
          src={staticFile(videoSrc)}
          startFrom={startFrame}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* LAYER 5: KINETIC KILL POPUP BANNER (Triggers on Kill)        */}
      {/* ============================================================ */}
      {framesSinceKill >= 0 && (
        <div
          style={{
            position: "absolute",
            top: 1280,
            left: "50%",
            transform: `translateX(-50%) scale(${Math.max(0, badgeScale)})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            zIndex: 12,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #ff4655 0%, #b81c2b 100%)",
              color: "#fff",
              padding: "16px 44px",
              borderRadius: 14,
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              boxShadow:
                "0 15px 40px rgba(255, 70, 85, 0.5), inset 0 2px 0 rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 40 }}>🎯</span>
            <span>{killType}</span>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.25em",
              color: "rgba(255, 255, 255, 0.8)",
              textTransform: "uppercase",
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            {weapon} // CONFIRMED ELIMINATION
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LAYER 6: RED KILL IMPACT FLASH                               */}
      {/* ============================================================ */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(255, 70, 85, ${flashOpacity})`,
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      )}

      {/* ============================================================ */}
      {/* LAYER 7: BOTTOM RETENTION PROGRESS BAR                       */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 10,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          zIndex: 30,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #ff4655, #00f0ff)",
            boxShadow: "0 0 10px #ff4655",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

