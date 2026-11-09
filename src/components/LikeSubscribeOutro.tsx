import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const LikeSubscribeOutro: React.FC<{
  channelName?: string;
  reelType?: "ace" | "fail";
}> = ({ channelName = "RadiCalzMad", reelType = "ace" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Entrance spring for the main glass showcase
  const cardScale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.45, stiffness: 130 },
  });

  // 2. Cursor Timeline:
  // 0 -> 60: Cursor floats in from bottom right to Like button
  // 70: Cursor clicks LIKE
  // 85 -> 135: Cursor moves to SUBSCRIBE button
  // 145: Cursor clicks SUBSCRIBE
  // 165+: Cursor rests with subtle breathing
  const cursorX = interpolate(
    frame,
    [0, 50, 70, 75, 90, 135, 145, 150, 180],
    [750, 390, 390, 390, 420, 690, 690, 690, 720],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cursorY = interpolate(
    frame,
    [0, 50, 70, 75, 90, 135, 145, 150, 180],
    [1400, 1070, 1070, 1070, 1080, 1070, 1070, 1070, 1140],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const isClickingLike = frame >= 68 && frame <= 76;
  const isClickingSub = frame >= 142 && frame <= 150;
  const cursorPress = isClickingLike || isClickingSub;

  // 3. Like State & Explosion
  const isLiked = frame >= 72;
  const likeSpring = spring({
    frame: Math.max(0, frame - 72),
    fps,
    config: { damping: 9, mass: 0.3, stiffness: 220 },
  });

  // 4. Subscribe State & Bell Ring
  const isSubscribed = frame >= 146;
  const subSpring = spring({
    frame: Math.max(0, frame - 146),
    fps,
    config: { damping: 9, mass: 0.3, stiffness: 220 },
  });
  const bellWiggle = isSubscribed
    ? Math.sin((frame - 146) * 0.8) * Math.max(0, 18 - (frame - 146) * 0.5)
    : 0;

  // 5. Question / Engagement Banner Entrance at frame 160
  const questionSpring = spring({
    frame: Math.max(0, frame - 160),
    fps,
    config: { damping: 11, mass: 0.4, stiffness: 150 },
  });

  // Background glow breathing
  const glowPulse = Math.sin(frame * 0.08) * 0.15 + 0.85;

  const accentColor = reelType === "ace" ? "#00f0ff" : "#ff4655";
  const primaryGlow = reelType === "ace" ? "rgba(0, 240, 255, 0.4)" : "rgba(255, 70, 85, 0.4)";

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(8, 10, 18, 0.94)",
        zIndex: 50,
      }}
    >
      {/* Dynamic Background Neon Aura */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryGlow} 0%, rgba(255, 230, 0, 0.15) 50%, transparent 75%)`,
          filter: "blur(50px)",
          transform: `scale(${glowPulse})`,
        }}
      />

      {/* Main Glass Showcase Card */}
      <div
        style={{
          transform: `scale(${cardScale})`,
          width: 860,
          padding: "55px 45px",
          borderRadius: 32,
          background: "linear-gradient(180deg, rgba(22, 26, 42, 0.92) 0%, rgba(12, 14, 24, 0.96) 100%)",
          border: `2px solid rgba(255, 255, 255, 0.18)`,
          boxShadow: `0 30px 80px rgba(0, 0, 0, 0.95), 0 0 40px ${primaryGlow}`,
          backdropFilter: "blur(24px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          textAlign: "center",
        }}
      >
        {/* Creator Avatar with Radiant Crown */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}, #FFE600)`,
              padding: 4,
              boxShadow: `0 0 30px ${accentColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "#0d111a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 54,
                fontWeight: 900,
                color: "#fff",
              }}
            >
              {reelType === "ace" ? "👑" : "🤡"}
            </div>
          </div>
          {/* Verified Badge */}
          <div
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#00f0ff",
              color: "#000",
              fontSize: 18,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #000",
            }}
          >
            ✓
          </div>
        </div>

        {/* Channel Details */}
        <div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textShadow: "0 4px 15px rgba(0,0,0,0.8)",
            }}
          >
            {channelName}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: accentColor,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            {reelType === "ace"
              ? "⚡ RADIANT 1v5 ACE // DAILY CLUTCHES ⚡"
              : "📉 CORRODE TRAGEDY // DAILY LOWLIGHTS 💀"}
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 10,
            width: "100%",
            justifyContent: "center",
          }}
        >
          {/* Like Button */}
          <div
            style={{
              transform: isLiked ? `scale(${1 + likeSpring * 0.16})` : "scale(1)",
              background: isLiked
                ? "linear-gradient(135deg, #ff4655, #ff2a3b)"
                : "rgba(255, 255, 255, 0.08)",
              border: isLiked
                ? "2.5px solid #ff4655"
                : "1.5px solid rgba(255, 255, 255, 0.25)",
              color: "#fff",
              padding: "18px 40px",
              borderRadius: 50,
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: isLiked
                ? "0 0 35px rgba(255, 70, 85, 0.9)"
                : "0 6px 20px rgba(0,0,0,0.5)",
              transition: "background 0.2s ease",
            }}
          >
            <span style={{ fontSize: 30 }}>{isLiked ? "❤️" : "🤍"}</span>
            <span>{isLiked ? "LIKED!" : "LIKE"}</span>
          </div>

          {/* Subscribe Button */}
          <div
            style={{
              transform: isSubscribed
                ? `scale(${1 + subSpring * 0.14})`
                : "scale(1)",
              background: isSubscribed
                ? "rgba(255, 255, 255, 0.12)"
                : "linear-gradient(135deg, #FFE600, #ff8c00)",
              border: isSubscribed
                ? "2px solid rgba(255, 255, 255, 0.35)"
                : "2.5px solid #FFE600",
              color: isSubscribed ? "#fff" : "#000",
              padding: "18px 44px",
              borderRadius: 50,
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: isSubscribed
                ? "none"
                : "0 0 40px rgba(255, 230, 0, 0.8)",
              transition: "background 0.2s ease",
            }}
          >
            <span
              style={{
                fontSize: 30,
                display: "inline-block",
                transform: `rotate(${bellWiggle}deg)`,
              }}
            >
              {isSubscribed ? "🔔" : "➕"}
            </span>
            <span>{isSubscribed ? "SUBSCRIBED" : "SUBSCRIBE"}</span>
          </div>
        </div>

        {/* Engagement Call-To-Action Box */}
        {frame >= 160 && (
          <div
            style={{
              transform: `scale(${questionSpring})`,
              background: "rgba(0, 240, 255, 0.12)",
              border: `1.5px solid ${accentColor}`,
              borderRadius: 16,
              padding: "16px 32px",
              marginTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              boxShadow: `0 0 25px ${primaryGlow}`,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#FFE600",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {reelType === "ace"
                ? "RATE THIS 1v5 CLUTCH (1 - 10) 👇"
                : "WHICH DEATH WAS THE WORST? 👇"}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.8)",
                letterSpacing: "0.04em",
              }}
            >
              New gameplay drops every day • Tap Like if you enjoyed!
            </div>
          </div>
        )}
      </div>

      {/* Floating Animated Like Heart Particles */}
      {isLiked && frame < 120 && (
        <div style={{ position: "absolute", pointerEvents: "none", zIndex: 55 }}>
          {[-40, -20, 0, 20, 40].map((offset, i) => {
            const life = (frame - 72) / 40;
            const yOffset = -life * 180;
            const xOffset = offset * 2 + Math.sin(life * 5 + i) * 30;
            const particleOpacity = Math.max(0, 1 - life);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 390 + xOffset,
                  top: 1050 + yOffset,
                  fontSize: 24,
                  opacity: particleOpacity,
                  transform: `scale(${1 - life * 0.4})`,
                }}
              >
                ❤️
              </div>
            );
          })}
        </div>
      )}

      {/* Animated Realistic Hand Pointer */}
      <div
        style={{
          position: "absolute",
          left: cursorX,
          top: cursorY,
          transform: `translate(-4px, -4px) scale(${cursorPress ? 0.8 : 1.05})`,
          fontSize: 38,
          pointerEvents: "none",
          filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.9))",
          transition: "transform 0.08s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          zIndex: 60,
        }}
      >
        👆
      </div>
    </AbsoluteFill>
  );
};
