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
import manifest from "./deaths_manifest.json";
import { LikeSubscribeOutro } from "./components/LikeSubscribeOutro";

interface DeathItem {
  index: number;
  file: string;
  durationInFrames: number;
  killer: string;
  weapon: string;
  headshot: boolean;
  time_str: string;
  actionText: string;
  subText: string;
}

const DeathSlide: React.FC<{
  item: DeathItem;
  slideDuration: number;
}> = ({ item, slideDuration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Death impact frame at frame 88 (1.46s in slide)
  const deathFrame = 88;
  const framesSinceDeath = frame - deathFrame;

  // 1. Velocity Ramped Camera Dynamics:
  // Fast approach -> 0.3x slow-mo focus on crosshair -> violent punch on impact -> freeze
  const zoom = interpolate(
    frame,
    [0, deathFrame - 28, deathFrame, slideDuration],
    [1.0, 1.08, 1.28, 1.28],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 2. Screen Shake on Getting Dropped
  let shakeX = 0;
  let shakeY = 0;
  if (framesSinceDeath >= 0 && framesSinceDeath < 28) {
    const damp = 1 - framesSinceDeath / 28;
    shakeX = Math.sin(framesSinceDeath * 2.1) * 32 * damp;
    shakeY = Math.cos(framesSinceDeath * 2.4) * 24 * damp;
  }

  // 3. Desaturation / Red Tint on Death
  const isDead = frame >= deathFrame;
  const grayscale = interpolate(
    frame,
    [deathFrame - 2, deathFrame, deathFrame + 8],
    [0, 0.92, 0.92],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const redVignette = interpolate(
    frame,
    [deathFrame, deathFrame + 5, deathFrame + 25],
    [0, 0.75, 0.35],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 4. Red "X" Pop Scale
  const xSpring = spring({
    frame: Math.max(0, framesSinceDeath),
    fps,
    config: { damping: 9, mass: 0.35, stiffness: 200 },
  });

  // 5. Kinetic Badge Spring
  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.35, stiffness: 160 },
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#000",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        filter: `grayscale(${grayscale})`,
      }}
    >
      {/* FULL BLEED 9:16 GAMEPLAY WITH VELOCITY RAMP ZOOM */}
      <AbsoluteFill
        style={{
          overflow: "hidden",
          transform: `scale(${zoom})`,
          transformOrigin: "center 48%",
        }}
      >
        <OffthreadVideo
          src={staticFile(item.file)}
          volume={0.4}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Dark Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 90%), linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 20%, transparent 75%, rgba(0,0,0,0.85) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      {/* BLOOD RED VIGNETTE ON DEATH */}
      {redVignette > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(255, 30, 50, ${redVignette}) 100%)`,
            pointerEvents: "none",
            mixBlendMode: "multiply",
            zIndex: 15,
          }}
        />
      )}

      {/* GIANT RED X ON SCREEN CENTER WHEN DEAD */}
      {isDead && (
        <div
          style={{
            position: "absolute",
            top: "44%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${xSpring})`,
            fontSize: 150,
            fontWeight: 900,
            color: "#ff2a3b",
            textShadow:
              "0 0 50px rgba(255, 42, 59, 0.95), 0 10px 30px #000",
            pointerEvents: "none",
            zIndex: 22,
          }}
        >
          ❌
        </div>
      )}

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
          border: "2px solid #ff2a3b",
          boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 42, 59, 0.5)",
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
            color: "#ff2a3b",
            background: "rgba(0,0,0,0.8)",
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          FEED // {item.time_str}
        </div>
      </div>

      {/* LOWER-THIRD SARCASTIC CAPTIONS */}
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
            fontSize: 54,
            fontWeight: 900,
            letterSpacing: "0.03em",
            color: "#ff4655",
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
            background: "rgba(0, 0, 0, 0.88)",
            border: "1.5px solid rgba(255, 70, 85, 0.5)",
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
    </AbsoluteFill>
  );
};

const TragedySummaryCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.4, stiffness: 160 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d0f17",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 45,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transform: `scale(${cardSpring})`,
          width: 820,
          padding: "50px 40px",
          borderRadius: 24,
          background: "rgba(22, 26, 40, 0.95)",
          border: "2px solid #ff4655",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255, 70, 85, 0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 60 }}>💀🤡📉</div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#ff4655",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          MATCH SUMMARY: TRAGEDY
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#FFE600",
            letterSpacing: "0.1em",
            lineHeight: 1.6,
          }}
        >
          <div>8 PEEKS // 8 INSTANT TRADES // 0 EXCUSES</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 20 }}>
            &ldquo;I swear he was one bullet away&rdquo;
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 70, 85, 0.15)",
            border: "1.5px solid #ff4655",
            padding: "12px 30px",
            borderRadius: 12,
            fontSize: 22,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "0.1em",
            marginTop: 10,
          }}
        >
          VALORANT IS A MENTAL HEALTH TEST 💆
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DeathMontageShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progressPercent = (frame / durationInFrames) * 100;
  const items = manifest as DeathItem[];
  const slideDuration = 126; // ~2.1s per death (8 deaths = 1008 frames)

  const totalDeathFrames = items.length * slideDuration;
  const isOutro = frame >= totalDeathFrames + 80;

  const currentDeathIndex = Math.min(
    items.length - 1,
    Math.floor(frame / slideDuration)
  );
  const activeDeath = items[currentDeathIndex] || items[0];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 1. COMEDY / MEME PARODY MUSIC */}
      <Audio
        src={staticFile("music/The_Sudden_Trip_Downstairs.mp3")}
        volume={0.88}
      />

      {/* 2. SEQUENCED DEATH CLIPS */}
      <Series>
        {items.map((item, idx) => (
          <Series.Sequence key={idx} durationInFrames={slideDuration}>
            <DeathSlide item={item} slideDuration={slideDuration} />
          </Series.Sequence>
        ))}

        {/* 3. TRAGEDY SUMMARY MEME CARD (80 frames = 1.33s) */}
        <Series.Sequence durationInFrames={80}>
          <TragedySummaryCard />
        </Series.Sequence>

        {/* 4. EXTENDED LIKE & SUBSCRIBE OUTRO (270 frames = 4.5s) */}
        <Series.Sequence durationInFrames={270}>
          <LikeSubscribeOutro channelName="RadiCalzMad" reelType="fail" />
        </Series.Sequence>
      </Series>

      {/* 5. TOP HEADER & SARCASTIC DEATH COUNTER (hidden during outro) */}
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
            <span>💀</span>
            <span>CORRODE TRAGEDY: RADI&apos;S WORST MOMENTS</span>
          </div>

          {/* Dynamic Cumulative Death Badge */}
          <div
            style={{
              background: "#ff2a3b",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 10,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.08em",
              border: "2px solid #fff",
              boxShadow: "0 0 20px rgba(255, 42, 59, 0.8)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>DEATH</span>
            <span style={{ fontSize: 28, fontWeight: 900 }}>
              {activeDeath.index.toString().padStart(2, "0")}
            </span>
            <span style={{ fontSize: 16, opacity: 0.8 }}>/ {items.length}</span>
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
          zIndex: 35,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #ff2a3b, #ff8c00, #FFE600)",
            boxShadow: "0 0 12px #ff2a3b",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
