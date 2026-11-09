import React from "react";
import { Composition } from "remotion";
import { ValorantShort, valorantShortSchema } from "./ValorantShort";
import { RadiAceClutchShort } from "./RadiAceClutchShort";
import { MultiKillMontageShort } from "./MultiKillMontageShort";
import { AllKillsMontageShort } from "./AllKillsMontageShort";
import { DeathMontageShort } from "./DeathMontageShort";

export const Root: React.FC = () => {
  return (
    <>
      {/* 1. MASTER REEL 1: "WOW HE'S SO COOL" - RADI'S 1v5 ACE CLUTCH (39.83s @ 60fps = 2390 frames) */}
      <Composition
        id="RadiAceClutchShort"
        component={RadiAceClutchShort}
        durationInFrames={2390}
        fps={60}
        width={1080}
        height={1920}
      />

      {/* 2. MASTER REEL 2: "I FAIL EVERY DAY" - CORRODE TRAGEDY MEME REEL (22.63s @ 60fps = 1358 frames) */}
      <Composition
        id="DeathMontageShort"
        component={DeathMontageShort}
        durationInFrames={1358}
        fps={60}
        width={1080}
        height={1920}
      />

      {/* 3. All-Kills Match Montage (26s @ 60fps = 1560 frames) */}
      <Composition
        id="AllKillsMontageShort"
        component={AllKillsMontageShort}
        durationInFrames={1560}
        fps={60}
        width={1080}
        height={1920}
      />

      {/* 4. Multi-Kill Round Highlights (19s @ 60fps = 1140 frames) */}
      <Composition
        id="MultiKillMontageShort"
        component={MultiKillMontageShort}
        durationInFrames={1140}
        fps={60}
        width={1080}
        height={1920}
      />

      {/* 5. Fast 6s Headshot Highlight Short */}
      <Composition
        id="ValorantShort"
        component={ValorantShort}
        durationInFrames={360}
        fps={60}
        width={1080}
        height={1920}
        schema={valorantShortSchema}
        defaultProps={{
          title: "CLEAN 1-TAP // RADIANT AIM",
          playerName: "RadiCalzMad",
          agent: "Reyna",
          rank: "Radiant",
          showSubtitles: true,
          showFacecam: false,
          musicVolume: 0.8,
        }}
      />
    </>
  );
};
