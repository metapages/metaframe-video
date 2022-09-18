import React, { useRef, useEffect } from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import recordrtc from "recordrtc";
import Record from "videojs-record";
import "video.js/dist/video-js.css";
import "videojs-record/dist/css/videojs.record.css";
import { useFileStore } from "../store";
import { useSendVideo } from "../hooks/useSendVideo";
import { FileBlob } from "./FileBlob";

// If I don't make an object with this, it faails
const r = Record;

const videoJsOptionsDefault = {
  autoplay: true,
  controls: true,
  bigPlayButton: false,
  width: 320,
  height: 240,
  fluid: false,
  // sources: [
  //   {
  //     src: '//vjs.zencdn.net/v/oceans.mp4',
  //     type: 'video/mp4',
  //   },
  // ],
  plugins: {
    /*
      // wavesurfer section is only needed when recording audio-only
      wavesurfer: {
          backend: 'WebAudio',
          waveColor: '#36393b',
          progressColor: 'black',
          debug: true,
          cursorWidth: 1,
          msDisplayMax: 20,
          hideScrollbar: true,
          displayMilliseconds: true,
          plugins: [
              // enable microphone plugin
              WaveSurfer.microphone.create({
                  bufferSize: 4096,
                  numberOfInputChannels: 1,
                  numberOfOutputChannels: 1,
                  constraints: {
                      video: false,
                      audio: true
                  }
              })
          ]
      },
      */
    record: {
      audio: true,
      video: true,
      maxLength: 10,
      debug: true,
      // This is not supported, it's always webm
      // videoMimeType: "video/mp4",
    },
  },
};

export const VideoJsRecorder: React.FC<{
  options?: VideoJsPlayerOptions;
  onReady?: (player: VideoJsPlayer) => void;
}> = ({ options, onReady }) => {
  const videoRef = useRef(null);
  const playerRef = useRef<videojs.Player | undefined>();
  const addFile = useFileStore((state) => state.addFile);
  const sendVideo = useSendVideo();

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (!sendVideo) {
      return;
    }

    if (playerRef.current) {
      const sources = options?.sources;
      if (sources) {
        playerRef.current.src(sources);
      }
      return;
    }

    const videoJsOptions = { ...videoJsOptionsDefault, ...options };

    const player = videojs(videoElement, videoJsOptions, () => {
      // videojs.log("player is ready");
      onReady && onReady(player);
    });
    playerRef.current = player;

    var msg =
      "Using video.js " +
      videojs.VERSION +
      " with videojs-record " +
      videojs.getPluginVersion("record") +
      " and recordrtc " +
      recordrtc.version;
    videojs.log(msg);

    player.on("error", (err) => {
      console.error(`[video.js]`, err);
    });

    player.on("deviceReady", (err) => {
      // console.log(`[video.js] device is ready!`);
    });

    let startRecordTime: number | undefined;
    player.on("startRecord", (err) => {
      // console.log(`[video.js] startRecord!`);
      startRecordTime = Date.now();
    });

    // user completed recording and stream is available
    player.on("finishRecord", () => {
      // the blob object contains the recorded data that
      // can be downloaded by the user, stored on server etc.
      const fileBlob: FileBlob = {
        name: `${(startRecordTime
          ? new Date(startRecordTime)
          : new Date()
        ).toISOString()}.webm`,
        cached: false,
        // @ts-ignore
        file: player.recordedData,
      };
      addFile(fileBlob);
      sendVideo && sendVideo(fileBlob);
    });
  }, [options, onReady, sendVideo]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = undefined;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-default-skin" />
    </div>
  );
};
