import { useCallback, useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  VStack,
} from "@chakra-ui/react";
import localForage from "localforage";
import { useFileStore } from "../store";
import { useFormik } from "formik";
import * as yup from "yup";
import { useHashParamBase64 } from "@metapages/hash-query";
import { parse } from "shell-quote";
import { MessageError } from "./Messages";
import 'video.js/dist/video-js.min.css';
import 'videojs-record/dist/css/videojs.record.css';
import videojs from 'video.js';
import { VideoJsRecorder } from "./VideoJsRecorder";
import { VideoPlayer } from "./VideoPlayer";
// import Record from 'videojs-record';

const validationSchema = yup.object({
  command: yup.string(),
});
interface FormType extends yup.InferType<typeof validationSchema> {}

export const TabPanelRecord: React.FC = () => {
  const [command, setCommand] = useHashParamBase64("command");
  const syncCachedFiles = useFileStore((state) => state.syncCachedFiles);
  const file = useFileStore((state) => state.files);
  const addFile = useFileStore((state) => state.addFile);

  const setError = useFileStore((state) => state.setError);
  const setMode = useFileStore((state) => state.setMode);
  const mode = useFileStore((state) => state.mode);
  const error = useFileStore((state) => state.error);

  // do this at least once
  useEffect(() => {
    syncCachedFiles();
  }, [syncCachedFiles]);



  const cancel = useCallback(() => {
    setMode("cancelled");
  }, [setMode]);

  // const run = useCallback(
  //   async (command: string) => {
  //     console.log('🔴 run command', command);
  //     // console.log('🔴 run cachedFiles', cachedFiles);

  //     setError(null);
  //     setMode("running");
  //     // setCommand(command);
  //     // console.log(`💜 createFFmpeg`)
  //     // create video here



  //     const existingFileNamesSet = new Set<string>();
  //     cachedFiles.forEach(item => existingFileNamesSet.add(item));
  //     uploadedFiles.forEach(item => existingFileNamesSet.add(item.file.name));
  //     const existingFileNames = Array.from(existingFileNamesSet);
  //     const filesToWrite = existingFileNames.filter(f => command.includes(f));
  //     console.log('🔴 filesToWrite', filesToWrite);

  //     for (const fileName of filesToWrite) {
  //       let fileBlob :File;
  //       let uploadedFile = uploadedFiles.find(f => f.file.name === fileName);

  //       if (uploadedFile) {
  //         fileBlob = uploadedFile.file;
  //       } else {
  //         const fileFromCache :File | undefined | null  = await localForage.getItem(fileName);
  //         console.log(`🔴 loaded "${fileName}"`, fileFromCache);
  //         // bail after every await if another run has started
  //         // if (ffmpegRef.current !== ffmpeg) {
  //         //   return;
  //         // }
  //         if (!fileFromCache) {
  //           setError(`File ${fileName} not found in cache`);
  //           setMode("error");
  //           return;
  //         }
  //         fileBlob = fileFromCache;
  //       }

  //       if (fileBlob) {

  //         const buffer = await fileBlob.arrayBuffer();
  //         // bail after every await if another run has started
  //         // if (ffmpegRef.current !== ffmpeg) {
  //         //   return;
  //         // }
  //         var uint8View = new Uint8Array(buffer);
  //         // ffmpegRef.current.FS("writeFile", fileName, uint8View);
  //         // console.log(`💜 👉 await ffmpeg.writefile(${fileName}) [${ffmpeg.FS("readdir", "/")}]`);

  //       } else {
  //         console.log(`❗ no blob for "${fileName}")`);
  //       }
  //     }
  //     try {


  //       // get the output files
  //     } catch(err) {
  //       console.error(err);
  //       setError(`${err}`);
  //       setMode("error");
  //       return;
  //     }
  //     setMode("success");
  //     // bail after every await if another run has started
  //     // if (ffmpegRef.current !== ffmpeg) {
  //     //   return;
  //     // }

  //     // const allFFmpegFiles = ffmpeg.FS("readdir", "/");
  //     // console.log('allFFmpegFiles', allFFmpegFiles);





  //     // ffmpeg.FS("writeFile", name, await fetchFile(files[0]));


  //     // readdir
  //     // const data = ffmpeg.FS("readFile", "output.mp4");
  //     // const video = document.getElementById("player");
  //     // video.src = URL.createObjectURL(
  //     //   new Blob([data.buffer], { type: "video/mp4" })
  //     // );
  //   },
  //   [ uploadedFiles, cachedFiles, setError, setMode]
  // );

  const onSubmit = useCallback(
    (values: FormType) => {
      if (values.command) {
        setMode("running")
        setCommand(values.command);
        // run(values.command);
      }
    },
    [setMode, setCommand]
  );

  const formik = useFormik({
    initialValues: {
      command:command,
    },
    onSubmit,
    validationSchema,
  });

  const onClick = useCallback(() => {
    if (mode === "running") {
      cancel();
    } else {
      formik.handleSubmit();
    }
  }, [formik, cancel]);

  useEffect(() => {
    formik.setFieldValue("command", command);
  }, [command, formik.setFieldValue])


  // console.log('🥬 command', command);
  // console.log('🥬 formik.values.command', formik.values.command);


  return (
    <VStack alignItems="stretch">
      {/* <VideoJsRecorder /> */}

      {/* <VideoPlayer /> */}

      <VideoJsRecorder />

      {/* <form onSubmit={formik.handleSubmit}>
        <FormControl>
          <FormLabel htmlFor="command">ffmpeg command:</FormLabel>

          <InputGroup>
            <Input
              id="command"
              name="command"
              type="text"
              variant="filled"
              onChange={formik.handleChange}
              value={formik.values.command || ""}
            />
          </InputGroup>
        </FormControl>

      <Button
        alignSelf="flex-start"
        colorScheme={mode === "running" ? "red" : "green"}
        mr={3}
        disabled={!formik.values.command}
        // disabled={mode !== "running"}
        onClick={onClick}
        >
        {mode === "running" ? "Cancel" : "Run"}
      </Button>
          </form>

      {error ? <MessageError message={error} /> : null} */}

      {/* <ReactMediaRecorder
      video
      render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
        <div>
          <p>{status}</p>
          <button onClick={startRecording}>Start Recording</button>
          <button onClick={stopRecording}>Stop Recording</button>
          <video src={mediaBlobUrl} controls autoPlay loop />
        </div>
      )}
    /> */}


    </VStack>
  );
};
