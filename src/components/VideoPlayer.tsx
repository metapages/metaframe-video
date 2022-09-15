import React, { useEffect, useRef } from "react";
import videojs, { VideoJsPlayerOptions } from "video.js";

const videoJsOptionsDefault = {
  autoplay: true,
  playbackRates: [0.5, 1, 1.25, 1.5, 2],
  width: 320,
  height: 240,
  controls: true,
  // sources: [
  //   {
  //     src: "//vjs.zencdn.net/v/oceans.mp4",
  //     type: "video/mp4",
  //   },
  // ],
};

export const VideoPlayer: React.FC<{
  options: VideoJsPlayerOptions;
  onReady?: () => void;
}> = ({ options, onReady }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<videojs.Player | undefined>();

  const sources = options?.sources;

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    if (playerRef.current) {
      if (sources) {
        playerRef.current.src(sources);
      }
      return;
    }

    videoRef.current.setAttribute("webkit-playsinline", "true");
    videoRef.current.setAttribute("playsinline", "true");
    const videoJsOptions = { ...videoJsOptionsDefault, ...options };
    const player = videojs(videoRef.current, videoJsOptions, onReady);

    playerRef.current = player;
  }, [sources]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};
