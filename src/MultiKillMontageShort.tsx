import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface ClipConfig {
  file: string;
  durationInFrames: number; // e.g. 270 = 4.5s @ 60fps
  roundText: string;
  actionText: string;
  subText: string;
  weapon: string;
  impactFrame: number;
}

const CLIPS: ClipConfig[] = [
  {
    file: "montage/clip1.mp4",
    durationInFrames: 270, // 4.5s
    roundText: "ROUND 03",
    actionText: "FIRST BLOOD 🎯",
    subText: "AERIS VANDAL 1-TAP // ASHBORN",
    weapon: "AERIS VANDAL",
    impactFrame: 175,
  },
  {
    file: "montage/clip2.mp4",
    durationInFrames: 270, // 4.5s
    roundText: "ROUND 15",
    actionText: "SITE HOLD ⚡",
    subText: "CLEAN 1-TAP // CHAMBER DELETED",
    weapon: "AERIS VANDAL",
    impactFrame: 180,
  },
  {
    file: "montage/clip3.mp4",
    durationInFrames: 270, // 4.5s
    roundText: "ROUND 18",
    actionText: "MID ENTRY 💀",
    subText: "VANDAL HEADSHOT // BREACH DOWN",
    weapon: "AERIS VANDAL",
    impactFrame: 170,
  },
  {
    file: "montage/clip4.mp4",
    durationInFrames: 330, // 5.5s
    roundText: "ROUND 05",
    actionText: "1v5 ACE CLUTCH 👑",
    subText: "\"AISE LETE HAIN ACE, THEEK HAI?!\"",
    weapon: "AERIS VANDAL",
    impactFrame: 90,
  },
];

const ClipSlide: React.FC<{
  clip: ClipConfig;
  overallIndex: number;
}> = ({ clip, overallIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Screen Shake on Kill Impact
  const framesSinceImpact = frame - clip.impactFrame;
  let shakeX = 0;
  let shakeY = 0;
  if (framesSinceImpact >= 0 && framesSinceImpact < 25) {
    const damp = 1 - framesSinceImpact / 25;
    shakeX = Math.sin(framesSinceImpact * 1.8) * 22 * damp;
    shakeY = Math.cos(framesSinceImpact * 2.1) * 16 * damp;
  }

  // 2. Kill Flash on impact
  const flashOpacity = interpolate(
    frame,
    [clip.impactFrame - 2, clip.impactFrame, clip.impactFrame + 18],
    [0, 0.45, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 3. Entrance Whip / Zoom on clip transition
  const entranceZoom = interpolate(frame, [0, 8], [1.12, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const entranceFlash = interpolate(frame, [0, 5], [0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 4. Kinetic Badge Spring
  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.35, stiffness: 160 },
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#000",
        transform: `translate(${shakeX}px, ${shakeY}px) scale(${entranceZoom})`,
      }}
    >
      {/* FULL BLEED 9:16 GAMEPLAY */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile(clip.file)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.02)",
          }}
        />
        {/* Cinematic Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 90%), linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.7) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      {/* KILLFEED PIP (Top Right) */}
      <div
        style={{
          position: "absolute",
          top: 130,
          right: 30,
          width: 480,
          height: 140,
          borderRadius: 14,
          overflow: "hidden",
          border: "2px solid rgba(255, 70, 85, 0.9)",
          boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 70, 85, 0.4)",
          zIndex: 10,
          backgroundColor: "rgba(0,0,0,0.85)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 1920,
            height: 1080,
            transform: "translate(-1420px, -45px) scale(1.05)",
            transformOrigin: "top left",
          }}
        >
          <OffthreadVideo src={staticFile(clip.file)} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 8,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: "#ff4655",
            background: "rgba(0,0,0,0.8)",
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          FEED // {clip.roundText}
        </div>
      </div>

      {/* LOWER-THIRD KINETIC CAPTIONS OVER GAMEPLAY */}
      <div
        style={{
          position: "absolute",
          bottom: 330,
          left: "50%",
          transform: `translateX(-50%) scale(${Math.max(0, badgeScale)})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          zIndex: 20,
          width: "92%",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 58,
            fontWeight: 900,
            letterSpacing: "0.03em",
            color: "#FFE600",
            textTransform: "uppercase",
            WebkitTextStroke: "5px #000000",
            textShadow: "0 6px 0 #000, 0 8px 30px rgba(0,0,0,0.9)",
            lineHeight: 1.15,
          }}
        >
          {clip.actionText}
        </div>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.85)",
            border: "1.5px solid rgba(255, 255, 255, 0.3)",
            borderRadius: 8,
            padding: "8px 24px",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: "#fff",
            textTransform: "uppercase",
            boxShadow: "0 4px 15px rgba(0,0,0,0.8)",
          }}
        >
          {clip.subText}
        </div>
      </div>

      {/* KILL FLASH */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(255, 70, 85, ${flashOpacity})`,
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 25,
          }}
        />
      )}

      {/* TRANSITION ENTRANCE FLASH */}
      {entranceFlash > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(255, 255, 255, ${entranceFlash})`,
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 26,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const MultiKillMontageShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progressPercent = (frame / durationInFrames) * 100;

  // Track which round is active
  let runningFrames = 0;
  let activeIndex = 0;
  for (let i = 0; i < CLIPS.length; i++) {
    if (frame >= runningFrames && frame < runningFrames + CLIPS[i].durationInFrames) {
      activeIndex = i;
      break;
    }
    runningFrames += CLIPS[i].durationInFrames;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. SEQUENCED CLIPS */}
      <Series>
        {CLIPS.map((clip, idx) => (
          <Series.Sequence
            key={idx}
            durationInFrames={clip.durationInFrames}
          >
            <ClipSlide clip={clip} overallIndex={idx} />
          </Series.Sequence>
        ))}
      </Series>

      {/* 2. PERSISTENT TOP HEADER & ROUND TRACKER */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 30,
          right: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 12,
          zIndex: 30,
        }}
      >
        {/* Match Header Tag */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            border: "1.5px solid #ff4655",
            borderRadius: 10,
            padding: "8px 20px",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#fff",
            textTransform: "uppercase",
            boxShadow: "0 4px 15px rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>🔥</span>
          <span>CORRODE COMP: RADI&apos;S BEST ROUNDS</span>
        </div>

        {/* Dynamic Round Tracker */}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {CLIPS.map((c, i) => {
            const isCompleted = i < activeIndex;
            const isCurrent = i === activeIndex;
            return (
              <div
                key={i}
                style={{
                  background: isCurrent
                    ? "#FFE600"
                    : isCompleted
                      ? "#ff4655"
                      : "rgba(255, 255, 255, 0.2)",
                  color: isCurrent ? "#000" : "#fff",
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  border: isCurrent
                    ? "2px solid #fff"
                    : "1px solid rgba(255,255,255,0.2)",
                  boxShadow: isCurrent
                    ? "0 0 15px rgba(255, 230, 0, 0.85)"
                    : "none",
                  transform: isCurrent ? "scale(1.08)" : "scale(1.0)",
                  transition: "transform 0.15s ease",
                }}
              >
                {c.roundText} {i === 3 ? "🏆" : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM PROGRESS RETENTION BAR */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          zIndex: 35,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #ff4655, #FFE600, #00f0ff)",
            boxShadow: "0 0 12px #FFE600",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
