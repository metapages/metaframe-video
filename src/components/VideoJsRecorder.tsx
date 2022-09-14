import React, { useRef, useEffect } from "react";
import videojs, { VideoJsPlayer } from "video.js";
import recordrtc from "recordrtc";
import Record from 'videojs-record';
import { Box } from "@chakra-ui/react";
import "video.js/dist/video-js.css";
import 'videojs-record/dist/css/videojs.record.css';
import { useFileStore } from "../store";

console.log('Record', Record);


// const videoJsOptions = {
//   autoplay: false,
//   playbackRates: [0.5, 1, 1.25, 1.5, 2],
//   width: 720,
//   height: 300,
//   controls: true,
//   sources: [
//     {
//       src: '//vjs.zencdn.net/v/oceans.mp4',
//       type: 'video/mp4',
//     },
//   ],
// };

const videoJsOptions = {
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
          videoMimeType: "video/mp4",
      }
  }
};

export const VideoJsRecorder = (props: any) => {
  const videoRef = useRef(null);
  const addFile = useFileStore((state) => state.addFile);
  // const playerRef = useRef<VideoJsPlayer | null>(null);
  const { options, onReady } = props;

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    // const dispose :(() => void)[] = [];
    // if (!playerRef.current) {
      const videoElement = videoRef.current;

      if (!videoElement) {
        return;
      }

      const player = videojs(videoElement, videoJsOptions, () => {
        videojs.log("player is ready");
        onReady && onReady(player);
      });

      var msg = 'Using video.js ' + videojs.VERSION +
                ' with videojs-record ' + videojs.getPluginVersion('record') +
                ' and recordrtc ' + recordrtc.version;
      videojs.log(msg);

      // playerRef.current = player;

      player.on("error", (err) => {
        console.error(`[video.js]`, err);
      });

      player.on("deviceReady", (err) => {
        console.log(`[video.js] device is ready!`);
      });

      let startRecordTime :number|undefined;
      player.on("startRecord", (err) => {
        console.log(`[video.js] startRecord!`);
        startRecordTime = Date.now();
      });

      // user completed recording and stream is available
      player.on('finishRecord', () => {
        // the blob object contains the recorded data that
        // can be downloaded by the user, stored on server etc.
        // @ts-ignore
        console.log('finished recording: ', player.recordedData);
        // console.log('finished recording: ');
        // @ts-ignore
        addFile({name:`${new Date().toISOString()}`, cached:false, file:player.recordedData})

        // recordedData
    });

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    // } else {
    //   // const player = playerRef.current;
    //   // player.autoplay(options.autoplay);
    //   // player.src(options.sources);
    // }

    return () => {
      player.dispose();
      // while (dispose.length) {
      //   dispose.pop()!();
      // }
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  // useEffect(() => {
  //   const player = playerRef.current;

  //   return () => {
  //     if (player) {
  //       console.log("disposing video recorder")
  //       player.dispose();
  //       playerRef.current = null;
  //     }
  //   };
  // }, [playerRef]);

  return (
    <div data-vjs-player>
      <video id="myvideo" ref={videoRef} className="video-js vjs-default-skin" />
    </div>
  );
};
