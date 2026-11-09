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
import manifest from "./all_kills_manifest.json";

interface KillItem {
  index: number;
  file: string;
  durationInFrames: number;
  weapon: string;
  victim: string;
  headshot: boolean;
  time_str: string;
  actionText: string;
  subText: string;
}

const KillSlide: React.FC<{ item: KillItem }> = ({ item }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Impact frame is roughly at frame 108 (1.8s in 2.6s clip)
  const impactFrame = 108;
  const framesSinceImpact = frame - impactFrame;

  // 1. Screen Shake on Kill Impact
  let shakeX = 0;
  let shakeY = 0;
  if (framesSinceImpact >= 0 && framesSinceImpact < 20) {
    const damp = 1 - framesSinceImpact / 20;
    shakeX = Math.sin(framesSinceImpact * 1.8) * (item.headshot ? 24 : 15) * damp;
    shakeY = Math.cos(framesSinceImpact * 2.2) * (item.headshot ? 18 : 10) * damp;
  }

  // 2. Kill Flash on impact
  const flashOpacity = interpolate(
    frame,
    [impactFrame - 2, impactFrame, impactFrame + 14],
    [0, item.headshot ? 0.5 : 0.3, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 3. Entrance transition whip zoom
  const entranceZoom = interpolate(frame, [0, 8], [1.14, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const entranceFlash = interpolate(frame, [0, 5], [0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 4. Kinetic Badge Spring
  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.35, stiffness: 160 },
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
          src={staticFile(item.file)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.02)",
          }}
        />
        {/* Subtle Vignette */}
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
          border: item.headshot
            ? "2px solid rgba(255, 70, 85, 0.95)"
            : "2px solid rgba(0, 240, 255, 0.8)",
          boxShadow: item.headshot
            ? "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 70, 85, 0.4)"
            : "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.3)",
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
          <OffthreadVideo src={staticFile(item.file)} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 8,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: item.headshot ? "#ff4655" : "#00f0ff",
            background: "rgba(0,0,0,0.8)",
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          FEED // {item.time_str}
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
          gap: 10,
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
            color: item.headshot ? "#FFE600" : "#00f0ff",
            textTransform: "uppercase",
            WebkitTextStroke: "5px #000000",
            textShadow: "0 6px 0 #000, 0 8px 30px rgba(0,0,0,0.9)",
            lineHeight: 1.15,
          }}
        >
          {item.actionText}
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
          {item.subText}
        </div>
      </div>

      {/* KILL FLASH */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: item.headshot
              ? `rgba(255, 70, 85, ${flashOpacity})`
              : `rgba(0, 240, 255, ${flashOpacity})`,
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 25,
          }}
        />
      )}

      {/* ENTRANCE FLASH */}
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

export const AllKillsMontageShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progressPercent = (frame / durationInFrames) * 100;

  // Track active kill index
  const items = manifest as KillItem[];
  let runningFrames = 0;
  let activeIndex = 0;
  for (let i = 0; i < items.length; i++) {
    if (frame >= runningFrames && frame < runningFrames + items[i].durationInFrames) {
      activeIndex = i;
      break;
    }
    runningFrames += items[i].durationInFrames;
  }

  const activeKill = items[activeIndex] || items[0];

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
        {items.map((item, idx) => (
          <Series.Sequence
            key={idx}
            durationInFrames={item.durationInFrames}
          >
            <KillSlide item={item} />
          </Series.Sequence>
        ))}
      </Series>

      {/* 2. TOP HEADER & ESCALATING KILL COUNTER */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 30,
          right: 30,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
            gap: 10,
          }}
        >
          <span>🔥</span>
          <span>CORRODE: ALL RADI&apos;S KILLS</span>
        </div>

        {/* Dynamic Cumulative Kill Badge */}
        <div
          style={{
            background: "#FFE600",
            color: "#000",
            padding: "8px 20px",
            borderRadius: 10,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "0.08em",
            border: "2px solid #fff",
            boxShadow: "0 0 20px rgba(255, 230, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>KILL</span>
          <span style={{ fontSize: 28, fontWeight: 900 }}>
            {activeKill.index.toString().padStart(2, "0")}
          </span>
          <span style={{ fontSize: 16, opacity: 0.8 }}>/ {items.length}</span>
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

