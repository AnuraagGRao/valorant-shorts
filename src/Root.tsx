import React from "react";
import { Composition } from "remotion";
import { ValorantShort, valorantShortSchema } from "./ValorantShort";
import { EwillyClutchShort } from "./EwillyClutchShort";

export const Root: React.FC = () => {
  return (
    <>
      {/* 1. Ewilly-style Viral Sarcastic 1v5 Ace Short (37s @ 60fps = 2220 frames) */}
      <Composition
        id="EwillyClutchShort"
        component={EwillyClutchShort}
        durationInFrames={2220} // 37 seconds
        fps={60}
        width={1080}
        height={1920}
      />

      {/* 2. Fast 6s Headshot Highlight Short */}
      <Composition
        id="ValorantShort"
        component={ValorantShort}
        durationInFrames={360} // 6 seconds at 60 FPS
        fps={60}
        width={1080}
        height={1920}
        schema={valorantShortSchema}
        defaultProps={{
          videoSrc: "clip.mp4",
          startFrame: 300,
          killFrameOffset: 90,
          title: "CLEAN 1-TAP // VANDAL",
          playerTag: "RADIANT // CLUTCH",
          weapon: "VANDAL",
          killType: "HEADSHOT",
        }}
      />
    </>
  );
};

