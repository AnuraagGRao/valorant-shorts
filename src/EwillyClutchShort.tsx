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

export const EwillyClutchShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // The composition starts at 0:15 in the original video (frame 900 at 60fps)
  // Total duration: 37 seconds = 2220 frames at 60fps
  const startFromFrame = 900; // 00:15 in original clip

  // Event timings relative to this composition (in seconds -> frames at 60fps):
  // Kill 2 & 3: 00:17 - 00:20 in orig -> ~2.0s - 4.5s in comp (frames 120 - 270)
  // "Arrey yaar mera aim...": 00:21 - 00:24 in orig -> ~5.5s - 9.5s in comp (frames 330 - 570)
  // Kill 4: 00:26 - 00:28 in orig -> ~11.0s in comp (frame 660)
  // 1v1 Tension: 00:30 - 00:46 in orig -> 15.0s - 31.0s in comp (frames 900 - 1860)
  // Kill 5 (ACE!): 00:47 - 00:48 in orig -> ~32.0s in comp (frame 1920)
  // "Aise lete hain Ace!": 00:49 - 00:52 in orig -> ~33.5s - 37.0s in comp (frames 2010 - 2220)

  const timeSec = frame / fps;

  // 1. Screen Shake on Ace Kill (around frame 1920)
  let shakeX = 0;
  let shakeY = 0;
  const framesSinceAce = frame - 1920;
  if (framesSinceAce >= 0 && framesSinceAce < 35) {
    const damp = 1 - framesSinceAce / 35;
    shakeX = Math.sin(framesSinceAce * 1.6) * 22 * damp;
    shakeY = Math.cos(framesSinceAce * 1.9) * 18 * damp;
  }

  // 2. Kill Flash on Ace
  const aceFlashOpacity = interpolate(
    frame,
    [1918, 1920, 1935],
    [0, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 3. Caption definitions in the iconic Ewilly / TikTok style
  const captions = [
    { start: 1.0, end: 4.5, text: "KURONAMI VANDAL 2K 💀", sub: "Double Kill Mid" },
    { start: 5.5, end: 7.2, text: "ARREY YAAR...", sub: "Wait for it..." },
    { start: 7.2, end: 10.5, text: "MERA AIM KYA HO GAYA BAKWAAS SA 😭", sub: "\"My aim is so trash\"" },
    { start: 11.0, end: 14.5, text: "KILL #4: CYPHER DOWN 🎯", sub: "4K! 1 ENEMY REMAINING" },
    { start: 15.5, end: 20.0, text: "1v1 CLUTCH FOR THE ACE ⏳", sub: "Searching B site..." },
    { start: 20.5, end: 27.0, text: "CHAMBER IS HOLDING ANGLE 👁️", sub: "High stakes" },
    { start: 27.5, end: 31.5, text: "CLEAN CROSSHAIR PLACEMENT...", sub: "Here it comes" },
    { start: 32.0, end: 33.5, text: "🎯 1-TAP! ACE CONFIRMED! 🏆", sub: "CHAMBER DELETED" },
    { start: 33.5, end: 37.0, text: "AISE LETE HAIN ACE, THEEK HAI?! 🔥", sub: "\"THAT'S HOW YOU TAKE AN ACE!\"" },
  ];

  const currentCaption = captions.find((c) => timeSec >= c.start && timeSec < c.end);
  const captionScale = currentCaption
    ? spring({
        frame: frame - currentCaption.start * fps,
        fps,
        config: { damping: 9, mass: 0.4, stiffness: 140 },
      })
    : 1;

  // 4. AI Commentary cards (Kei style)
  const aiRoasts = [
    { start: 0.0, end: 5.0, text: "🤖 KEI: Radi rotates B site with Kuronami Vandal..." },
    { start: 6.0, end: 10.8, text: "💀 KEI: \"My aim is trash\" - literally already has 3 kills" },
    { start: 11.0, end: 15.0, text: "🤖 KEI: Proceeded to get Kill 4 anyway. Absolutely shameless." },
    { start: 15.5, end: 31.5, text: "🎯 KEI: 1v1 Clutch vs Chamber. Time to lock in." },
    { start: 32.0, end: 37.0, text: "👑 KEI: 1v5 ACE DELIVERED. The aim was definitely NOT trash." },
  ];
  const currentAiRoast = aiRoasts.find((r) => timeSec >= r.start && timeSec < r.end);

  const progressPercent = (frame / durationInFrames) * 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#080c10",
        color: "#fff",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* ============================================================ */}
      {/* 1. AMBIENT BLURRED GAMEPLAY BACKGROUND                       */}
      {/* ============================================================ */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile("ace_clip.mp4")}
          startFrom={startFromFrame}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(36px) brightness(0.55) saturate(1.3)",
            transform: "scale(1.3)",
          }}
        />
        {/* Dark vignette gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 95%)",
          }}
        />
      </AbsoluteFill>

      {/* ============================================================ */}
      {/* 2. TOP HEADER: VIRAL HOOK & AI CARD                         */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 90,
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
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: "0.06em",
            textAlign: "center",
            textTransform: "uppercase",
            color: "#fff",
            textShadow: "0 4px 18px rgba(0,0,0,0.9)",
            padding: "0 30px",
            lineHeight: 1.15,
          }}
        >
          I SAID MY AIM WAS TRASH... 💀
        </div>

        {/* AI Sarcastic Commentary Badge */}
        {currentAiRoast && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.88)",
              border: "1.5px solid #00f0ff",
              borderRadius: 12,
              padding: "10px 24px",
              fontSize: 21,
              fontWeight: 800,
              color: "#00f0ff",
              boxShadow: "0 8px 25px rgba(0, 240, 255, 0.25)",
              maxWidth: 960,
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
          >
            {currentAiRoast.text}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. TOP KILLFEED PIP (MAGNIFIED LIVE KILL BANNER)             */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: "50%",
          transform: "translateX(-50%)",
          width: 640,
          height: 180,
          borderRadius: 16,
          overflow: "hidden",
          border: "2px solid rgba(255, 70, 85, 0.85)",
          boxShadow:
            "0 15px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 70, 85, 0.4)",
          zIndex: 10,
          backgroundColor: "#000",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 1920,
            height: 1080,
            transform: "translate(-1360px, -40px) scale(1.15)",
            transformOrigin: "top left",
          }}
        >
          <OffthreadVideo src={staticFile("ace_clip.mp4")} startFrom={startFromFrame} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 6,
            right: 12,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.15em",
            color: "#ff4655",
            background: "rgba(0,0,0,0.7)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          KILLFEED //
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN GAMEPLAY WINDOW (FOCUSED 16:9 VIEW)                  */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          top: 590,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1080,
          height: 608,
          borderRadius: 20,
          overflow: "hidden",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          boxShadow:
            "0 30px 70px rgba(0,0,0,0.9), 0 0 40px rgba(255, 70, 85, 0.2)",
          zIndex: 8,
          backgroundColor: "#000",
        }}
      >
        <OffthreadVideo
          src={staticFile("ace_clip.mp4")}
          startFrom={startFromFrame}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* 5. THE ICONIC EWILLY / VIRAL CAPTIONS (GOLD + BLACK STROKE)  */}
      {/* ============================================================ */}
      {currentCaption && (
        <div
          style={{
            position: "absolute",
            top: 1270,
            left: "50%",
            transform: `translateX(-50%) scale(${Math.max(0, captionScale)})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            zIndex: 15,
            width: "90%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: "0.04em",
              color: "#FFE600", // The iconic Ewilly / CapCut golden yellow
              textTransform: "uppercase",
              WebkitTextStroke: "4px #000000",
              textShadow: "0 6px 0 #000, 0 10px 30px rgba(0,0,0,0.9)",
              lineHeight: 1.15,
            }}
          >
            {currentCaption.text}
          </div>

          <div
            style={{
              background: "rgba(0, 0, 0, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 8,
              padding: "6px 20px",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            {currentCaption.sub}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. RED FLASH ON ACE IMPACT                                   */}
      {/* ============================================================ */}
      {aceFlashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(255, 70, 85, ${aceFlashOpacity})`,
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 25,
          }}
        />
      )}

      {/* ============================================================ */}
      {/* 7. BOTTOM PROGRESS RETENTION BAR                             */}
      {/* ============================================================ */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 12,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          zIndex: 30,
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

