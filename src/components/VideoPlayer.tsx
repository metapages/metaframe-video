import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import { useState } from 'react';

const videoJsOptions = {
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

export const VideoPlayer: React.FC<{videoSource?:{type:string, src:string}}> = ({videoSource}) => {

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<videojs.Player | undefined>();


  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.setAttribute("webkit-playsinline", "true");
    videoRef.current.setAttribute("playsinline", "true");

    const player = videojs(
      videoRef.current,
      videoSource ? { ...videoJsOptions, ...{sources:[videoSource]}} : videoJsOptions,
      function onPlayerReady() {
        console.log("onPlayerReady", this);
      }
    );

    playerRef.current = player;

    return () => {
      player.dispose();
    };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>

  );
};

// export default class VideoPlayer2 extends React.Component {
//   componentDidMount() {
//     // instantiate video.js
//     this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
//       console.log("onPlayerReady", this);
//     });

//     if (this.videoNode) {
//       this.videoNode.setAttribute("webkit-playsinline", true);
//       this.videoNode.setAttribute("playsinline", true);
//     }
//   }

//   // destroy player on unmount
//   componentWillUnmount() {
//     if (this.player) {
//       this.player.dispose();
//     }
//   }

//   // wrap the player in a div with a `data-vjs-player` attribute
//   // so videojs won't create additional wrapper in the DOM
//   // see https://github.com/videojs/video.js/pull/3856
//   render() {
//     return (
//       <div data-vjs-player>
//         <video ref={node => (this.videoNode = node)} className="video-js" />
//       </div>
//     );
//   }
// }
