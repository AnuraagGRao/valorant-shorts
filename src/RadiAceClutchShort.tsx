import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TargetLockReticle } from "./components/TargetLockReticle";
import { WonBannerFreeze } from "./components/WonBannerFreeze";
import { LikeSubscribeOutro } from "./components/LikeSubscribeOutro";

export const RadiAceClutchShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const timeSec = frame / fps;

  // The 1-tap Ace impact in ace_ramped.mp4 is at frame 1833 (~30.55s)
  const aceImpactFrame = 1833;
  const framesSinceAce = frame - aceImpactFrame;

  // 1. Dynamic Background Music Volume Automation
  // Ducked during knight's voice & the 1v1 standoff defuse ticking, explodes on Ace 1-tap!
  const musicVolume = interpolate(
    frame,
    [0, 270, 570, 840, 1020, 1810, 1833, 2390],
    [0.35, 0.25, 0.5, 0.35, 0.07, 0.07, 0.88, 0.88],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 2. Screen Shake on Ace Kill
  let shakeX = 0;
  let shakeY = 0;
  if (framesSinceAce >= 0 && framesSinceAce < 38) {
    const damp = 1 - framesSinceAce / 38;
    shakeX = Math.sin(framesSinceAce * 1.6) * 32 * damp;
    shakeY = Math.cos(framesSinceAce * 1.9) * 26 * damp;
  }

  // 3. Kill Flash on Ace Impact
  const aceFlashOpacity = interpolate(
    frame,
    [aceImpactFrame - 2, aceImpactFrame, aceImpactFrame + 18],
    [0, 0.7, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 4. Tension Punch-In Zoom during 1v1 Standoff vs Chamber (frame 1020 to 1825)
  const tensionZoom = interpolate(
    frame,
    [1020, 1750, 1833, 1860],
    [1.02, 1.18, 1.02, 1.02],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 5. Kinetic Pop-in Captions (Frame-Accurate to Real Comms & Gameplay)
  const captions = [
    {
      start: 0.5,
      end: 4.5,
      titleNodes: (
        <span>
          AERIS VANDAL <span style={{ color: "#ff4655" }}>2K</span> 💀
        </span>
      ),
      sub: "DOUBLE KILL MID // 2 DOWN",
    },
    {
      start: 5.5,
      end: 9.5,
      titleNodes: (
        <span>
          KNIGHT: &ldquo;MERA <span style={{ color: "#ff4655" }}>AIM</span> KYA HO GAYA...&rdquo; 😭
        </span>
      ),
      sub: "WHIFFED HIS SHOTS & DIED IN MID 😂",
    },
    {
      start: 10.2,
      end: 13.8,
      titleNodes: (
        <span>
          KILL #3 & #4 //{" "}
          <span style={{ color: "#00f0ff" }}>4K CONFIRMED</span> 🎯
        </span>
      ),
      sub: "CYPHER & REYNA DOWN // 1 ENEMY REMAINING",
    },
    {
      start: 14.0,
      end: 16.8,
      titleNodes: (
        <span>
          ⚡ <span style={{ color: "#00f0ff" }}>FAST REPOSITION</span> // B SITE
        </span>
      ),
      sub: "2.5x VELOCITY SPEED RAMP",
    },
    {
      start: 17.0,
      end: 25.5,
      titleNodes: (
        <span>
          1v1 CLUTCH FOR THE <span style={{ color: "#FFE600" }}>ACE</span> ⏳
        </span>
      ),
      sub: "ASCENT B SITE VS CHAMBER",
    },
    {
      start: 25.5,
      end: 26.5,
      titleNodes: (
        <span>
          HE&apos;S <span style={{ color: "#ff4655" }}>DEFUSING</span>... 👂
        </span>
      ),
      sub: "HOLD CROSSHAIR AT HEAD HEIGHT 👁️",
    },
    {
      start: 26.5,
      end: 30.55,
      titleNodes: (
        <span>
          🎯 <span style={{ color: "#00f0ff" }}>SLOW-MO LOCK-ON</span>... 👁️
        </span>
      ),
      sub: "HE PEEKS... HE DIES",
    },
    {
      start: 30.8,
      end: 32.8,
      titleNodes: (
        <span>
          🎯 ONE-TAP! <span style={{ color: "#FFE600" }}>1v5 ACE!</span> 🏆
        </span>
      ),
      sub: "CHAMBER DELETED // ROUND WON",
    },
    {
      start: 32.8,
      end: 35.34,
      titleNodes: (
        <span>
          AISE LETE HAIN <span style={{ color: "#FFE600" }}>ACE</span>, THEEK
          HAI?! 🔥
        </span>
      ),
      sub: '"THAT\'S HOW YOU TAKE AN ACE!"',
    },
  ];

  const currentCaption = captions.find(
    (c) => timeSec >= c.start && timeSec < c.end
  );
  const captionScale = currentCaption
    ? spring({
        frame: frame - currentCaption.start * fps,
        fps,
        config: { damping: 10, mass: 0.38, stiffness: 150 },
      })
    : 1;

  // 6. Valorant 5-Skull Ace Tracker Logic
  const skullStates = [
    { active: frame >= 30, color: "#ff4655" }, // Kill 1 (Mid)
    { active: frame >= 60, color: "#ff4655" }, // Kill 2 (Mid)
    { active: frame >= 680, color: "#ff8c00" }, // Kill 3 (B Site)
    { active: frame >= 760, color: "#ff8c00" }, // Kill 4 (B Site)
    { active: frame >= 1833, color: "#FFE600" }, // Kill 5 ACE! (Chamber 1-Tap)
  ];

  // Ace shockwave ring on frame 1833
  const aceShockwaveScale = interpolate(
    frame,
    [1833, 1870],
    [0.8, 2.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const aceShockwaveOpacity = interpolate(
    frame,
    [1833, 1845, 1870],
    [0, 0.95, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const progressPercent = (frame / durationInFrames) * 100;

  // Outro & Won Banner triggers
  const showWonBanner = frame >= 2020 && frame < 2120;
  const showOutro = frame >= 2120;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* ============================================================ */}
      {/* 0. BRAZILIAN PHONK BACKGROUND MUSIC                          */}
      {/* ============================================================ */}
      <Audio
        src={staticFile("music/Asfalto_Quente.mp3")}
        volume={musicVolume}
      />

      {/* ============================================================ */}
      {/* 1. FULL-BLEED GAMEPLAY WITH VELOCITY RAMPED VIDEO            */}
      {/* ============================================================ */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile("ace_ramped.mp4")}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${tensionZoom})`,
            transformOrigin: "center center",
          }}
        />
        {/* Subtle cinematic vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 90%), linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.7) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      {/* TARGET LOCK RETICLE ON CHAMBER HEAD (during 0.4x slow-mo: frame 1578 to 1833) */}
      <TargetLockReticle impactFrame={1833} x={50} y={48} />

      {/* ============================================================ */}
      {/* 2. TOP FLOATING KILLFEED PIP                                 */}
      {/* ============================================================ */}
      {!showOutro && (
        <div
          style={{
            position: "absolute",
            top: 135,
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
            <OffthreadVideo src={staticFile("ace_ramped.mp4")} volume={0} />
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
            KILLFEED //
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. TOP MATCH HEADER & VALORANT 5-SKULL ACE TRACKER           */}
      {/* ============================================================ */}
      {!showOutro && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 30,
            right: 30,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 12,
          }}
        >
          {/* Match Header Tag */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              border: "1.5px solid #00f0ff",
              borderRadius: 10,
              padding: "8px 20px",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.08em",
              color: "#fff",
              textTransform: "uppercase",
              boxShadow: "0 4px 15px rgba(0, 240, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>⚡</span>
            <span>ASCENT: 1v5 ACE CLUTCH</span>
          </div>

          {/* 5-Skull Valorant HUD */}
          <div
            style={{
              display: "flex",
              gap: 8,
              background: "rgba(0, 0, 0, 0.8)",
              border: "1.5px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 10,
              padding: "6px 14px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.8)",
            }}
          >
            {skullStates.map((s, idx) => {
              const isAceSkull = idx === 4 && s.active;
              return (
                <span
                  key={idx}
                  style={{
                    fontSize: isAceSkull ? 26 : 22,
                    color: s.active ? s.color : "rgba(255, 255, 255, 0.2)",
                    filter: s.active
                      ? `drop-shadow(0 0 10px ${s.color})`
                      : "none",
                    transform: s.active ? "scale(1.1)" : "scale(0.9)",
                    transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  }}
                >
                  💀
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. ACE DETONATION SHOCKWAVE RING                             */}
      {/* ============================================================ */}
      {aceShockwaveOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "4px solid #FFE600",
            boxShadow: "0 0 40px #FFE600, inset 0 0 30px #ff4655",
            transform: `translate(-50%, -50%) scale(${aceShockwaveScale})`,
            opacity: aceShockwaveOpacity,
            pointerEvents: "none",
            zIndex: 24,
          }}
        />
      )}

      {/* ============================================================ */}
      {/* 5. KINETIC CAPTIONS DIRECTLY ON TOP OF GAMEPLAY              */}
      {/* ============================================================ */}
      {currentCaption && !showOutro && (
        <div
          style={{
            position: "absolute",
            bottom: 330,
            left: "50%",
            transform: `translateX(-50%) scale(${Math.max(0, captionScale)})`,
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
              color: "#FFE600",
              textTransform: "uppercase",
              WebkitTextStroke: "5px #000000",
              textShadow: "0 6px 0 #000, 0 8px 30px rgba(0,0,0,0.9)",
              lineHeight: 1.15,
            }}
          >
            {currentCaption.titleNodes}
          </div>

          <div
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              border: "1.5px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 8,
              padding: "6px 24px",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#fff",
              textTransform: "uppercase",
              boxShadow: "0 4px 15px rgba(0,0,0,0.8)",
            }}
          >
            {currentCaption.sub}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. RED IMPACT FLASH ON ACE KILL                              */}
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
      {/* 7. WON BANNER FREEZE                                         */}
      {/* ============================================================ */}
      {showWonBanner && (
        <WonBannerFreeze
          title="MATCH MVP // WON"
          subtitle="1v5 ACE CLUTCH // ENEMY ELIMINATED"
        />
      )}

      {/* ============================================================ */}
      {/* 8. EXTENDED LIKE & SUBSCRIBE OUTRO (4.5s = 270 frames)       */}
      {/* ============================================================ */}
      {showOutro && (
        <Sequence from={2120} durationInFrames={270}>
          <LikeSubscribeOutro channelName="RadiCalzMad" reelType="ace" />
        </Sequence>
      )}

      {/* ============================================================ */}
      {/* 9. BOTTOM PROGRESS RETENTION BAR                             */}
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
            background: "linear-gradient(90deg, #00f0ff, #FFE600, #ff4655)",
            boxShadow: "0 0 12px #00f0ff",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
