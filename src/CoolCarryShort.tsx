import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import manifest from "./all_kills_manifest.json";
import { TargetLockReticle } from "./components/TargetLockReticle";
import { LikeSubscribeOutro } from "./components/LikeSubscribeOutro";
import { WonBannerFreeze } from "./components/WonBannerFreeze";

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

const CoolKillSlide: React.FC<{
  item: KillItem;
  slideDuration: number;
}> = ({ item, slideDuration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The impact in our 2.6s (156f) raw clips is at frame 108.
  // When mapped to slideDuration (e.g. 130 frames), impact lands at frame 88.
  const impactFrame = 88;
  const framesSinceImpact = frame - impactFrame;

  // 1. Velocity Ramping / Zoom Dynamics
  // Zoom in slow-mo as we approach the headshot, punch on impact, snap out
  const cameraZoom = interpolate(
    frame,
    [0, impactFrame - 24, impactFrame, impactFrame + 8, slideDuration],
    [1.0, 1.08, 1.22, 1.05, 1.02],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 2. Gunfire Screen Shake
  let shakeX = 0;
  let shakeY = 0;
  if (framesSinceImpact >= 0 && framesSinceImpact < 22) {
    const damp = 1 - framesSinceImpact / 22;
    shakeX = Math.sin(framesSinceImpact * 1.9) * (item.headshot ? 28 : 16) * damp;
    shakeY = Math.cos(framesSinceImpact * 2.3) * (item.headshot ? 20 : 12) * damp;
  }

  // 3. Chromatic Aberration / Flash Pulse on Impact
  const flashOpacity = interpolate(
    frame,
    [impactFrame - 2, impactFrame, impactFrame + 14],
    [0, item.headshot ? 0.6 : 0.35, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 4. Kinetic Badge Spring
  const badgeSpring = spring({
    frame: Math.max(0, framesSinceImpact),
    fps,
    config: { damping: 10, mass: 0.3, stiffness: 220 },
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#000",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* 9:16 Full Bleed Gameplay with Velocity Ramped Zoom */}
      <AbsoluteFill
        style={{
          overflow: "hidden",
          transform: `scale(${cameraZoom})`,
          transformOrigin: "center 48%",
        }}
      >
        <OffthreadVideo
          src={staticFile(item.file)}
          volume={0.35}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Ambient Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 90%), linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 22%, transparent 75%, rgba(0,0,0,0.75) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      {/* TARGET LOCK RETICLE (locks onto head right before firing) */}
      <TargetLockReticle impactFrame={impactFrame} x={50} y={48} />

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
            ? "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 70, 85, 0.5)"
            : "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)",
          zIndex: 20,
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
          <OffthreadVideo src={staticFile(item.file)} volume={0} />
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

      {/* LOWER-THIRD KINETIC KILL IMPACT BANNER */}
      {framesSinceImpact >= 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 330,
            left: "50%",
            transform: `translateX(-50%) scale(${badgeSpring})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            zIndex: 25,
            width: "92%",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              letterSpacing: "0.04em",
              color: item.headshot ? "#FFE600" : "#00f0ff",
              textTransform: "uppercase",
              WebkitTextStroke: "5px #000000",
              textShadow: "0 6px 0 #000, 0 8px 30px rgba(0,0,0,0.9)",
              lineHeight: 1.1,
            }}
          >
            {item.actionText}
          </div>

          <div
            style={{
              background: "rgba(0, 0, 0, 0.88)",
              border: item.headshot
                ? "1.5px solid rgba(255, 230, 0, 0.6)"
                : "1.5px solid rgba(0, 240, 255, 0.6)",
              borderRadius: 8,
              padding: "8px 26px",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#fff",
              textTransform: "uppercase",
              boxShadow: "0 4px 15px rgba(0,0,0,0.8)",
            }}
          >
            {item.subText}
          </div>
        </div>
      )}

      {/* FLASH ON IMPACT */}
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
            zIndex: 30,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const CoolCarryShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progressPercent = (frame / durationInFrames) * 100;
  const items = manifest as KillItem[];
  const slideDuration = 126; // ~2.1s per kill (10 kills = 1260 frames = 21s)

  // Track active kill index during the kill sequence
  const totalKillFrames = items.length * slideDuration;
  const isOutro = frame >= totalKillFrames;
  const isWonBanner = frame >= totalKillFrames - 60 && frame < totalKillFrames + 60;

  const currentKillIndex = Math.min(
    items.length - 1,
    Math.floor(frame / slideDuration)
  );
  const activeKill = items[currentKillIndex] || items[0];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. BRAZILIAN PHONK BACKGROUND MUSIC */}
      <Audio
        src={staticFile("music/Asfalto_Quente.mp3")}
        volume={0.88}
      />

      {/* 2. SEQUENCED KILL CLIPS */}
      <Series>
        {items.map((item, idx) => (
          <Series.Sequence key={idx} durationInFrames={slideDuration}>
            <CoolKillSlide item={item} slideDuration={slideDuration} />
          </Series.Sequence>
        ))}

        {/* 3. WON CLUTCH BANNER (Freeze Frame Bridge) */}
        <Series.Sequence durationInFrames={75}>
          <WonBannerFreeze
            title="MATCH MVP // WON"
            subtitle="RADI DELETED CORRODE // 10 KILLS"
          />
        </Series.Sequence>

        {/* 4. VIRAL LIKE & SUBSCRIBE OUTRO */}
        <Series.Sequence durationInFrames={120}>
          <LikeSubscribeOutro channelName="RadiCalzMad" />
        </Series.Sequence>
      </Series>

      {/* 5. TOP HEADER & ESCALATING KILL COUNTER (hidden during outro) */}
      {!isOutro && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 30,
            right: 30,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 35,
          }}
        >
          {/* Channel / Vibe Tag */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.82)",
              border: "1.5px solid #00f0ff",
              borderRadius: 10,
              padding: "8px 20px",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.1em",
              color: "#fff",
              textTransform: "uppercase",
              boxShadow: "0 0 20px rgba(0, 240, 255, 0.35)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>⚡</span>
            <span>HE&apos;S SO COOL: RADI ON CORRODE</span>
          </div>

          {/* Dynamic Cumulative Kill Badge */}
          <div
            style={{
              background: "linear-gradient(135deg, #00f0ff, #0077ff)",
              color: "#000",
              padding: "8px 20px",
              borderRadius: 10,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.08em",
              border: "2px solid #fff",
              boxShadow: "0 0 25px rgba(0, 240, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>KILL</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
              {activeKill.index.toString().padStart(2, "0")}
            </span>
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }}>
              / {items.length}
            </span>
          </div>
        </div>
      )}

      {/* 6. BOTTOM PROGRESS RETENTION BAR */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          zIndex: 40,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #00f0ff, #FFE600, #ff4655)",
            boxShadow: "0 0 15px #00f0ff",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

