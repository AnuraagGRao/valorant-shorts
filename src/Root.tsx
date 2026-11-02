import React from "react";
import { Composition } from "remotion";
import { ValorantShort, valorantShortSchema } from "./ValorantShort";

export const Root: React.FC = () => {
  return (
    <>
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
          startFrame: 300, // 5 seconds into the 20s recording
          killFrameOffset: 90, // Kill occurs ~1.5s into this short
          title: "CLEAN 1-TAP // VANDAL",
          playerTag: "RADIANT // CLUTCH",
          weapon: "VANDAL",
          killType: "HEADSHOT",
        }}
      />
    </>
  );
};

