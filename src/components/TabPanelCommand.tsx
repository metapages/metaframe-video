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
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import localForage from "localforage";
import { useFileStore } from "../store";
import { useFormik } from "formik";
import * as yup from "yup";
import { FileValidated } from "@dropzone-ui/react";
import { useHashParamBase64 } from "@metapages/hash-query";
import { parse } from "shell-quote";
import { MessageError } from "./Messages";

const validationSchema = yup.object({
  command: yup.string(),
});
interface FormType extends yup.InferType<typeof validationSchema> {}

export const TabPanelCommand: React.FC = () => {
  const [command, setCommand] = useHashParamBase64("command");
  const syncCachedFiles = useFileStore((state) => state.syncCachedFiles);
  const cachedFiles = useFileStore((state) => state.cachedFiles);
  const uploadedFiles = useFileStore((state) => state.uploadedFiles);
  const addUploadedFile = useFileStore((state) => state.addUploadedFile);

  const setError = useFileStore((state) => state.setError);
  const setMode = useFileStore((state) => state.setMode);
  const mode = useFileStore((state) => state.mode);
  const error = useFileStore((state) => state.error);

  const ffmpegRef = useRef<FFmpeg | undefined>();

  // console.log('🥬 cachedFiles', cachedFiles);
  // console.log('🥬 uploadedFiles', uploadedFiles);

  // do this at least once
  useEffect(() => {
    syncCachedFiles();
  }, [syncCachedFiles]);

  useEffect(() => {
    if (mode === "cancelled") {
      try {
        if (ffmpegRef.current?.isLoaded()) {
          ffmpegRef.current?.exit();
        }
      } catch(err) {
        console.log(`💜 ffmpeg.exit() error:`, err);
      }
      ffmpegRef.current = undefined;
    }
  }, [mode, ffmpegRef]);

  const cancel = useCallback(() => {
    setMode("cancelled");
  }, [setMode]);

  const run = useCallback(
    async (command: string) => {
      console.log('🔴 run command', command);
      // console.log('🔴 run cachedFiles', cachedFiles);

      setError(null);
      setMode("running");
      // setCommand(command);
      // console.log(`💜 createFFmpeg`)
      const ffmpeg = createFFmpeg({ log: true });
      // keep a local copy and a ref. if those two values
      // are ever different, bail immediately, another run
      // has started
      ffmpegRef.current = ffmpeg
      // console.log(`💜 await ffmpegRef.load()`)
      await ffmpeg.load();
      if (ffmpegRef.current !== ffmpeg) {
        return;
      }
      ffmpeg.FS("mkdir", "/outputs");



      const existingFileNamesSet = new Set<string>();
      cachedFiles.forEach(item => existingFileNamesSet.add(item));
      uploadedFiles.forEach(item => existingFileNamesSet.add(item.file.name));
      const existingFileNames = Array.from(existingFileNamesSet);
      const filesToWrite = existingFileNames.filter(f => command.includes(f));
      console.log('🔴 filesToWrite', filesToWrite);

      for (const fileName of filesToWrite) {
        let fileBlob :File;
        let uploadedFile = uploadedFiles.find(f => f.file.name === fileName);

        if (uploadedFile) {
          fileBlob = uploadedFile.file;
        } else {
          const fileFromCache :File | undefined | null  = await localForage.getItem(fileName);
          console.log(`🔴 loaded "${fileName}"`, fileFromCache);
          // bail after every await if another run has started
          if (ffmpegRef.current !== ffmpeg) {
            return;
          }
          if (!fileFromCache) {
            setError(`File ${fileName} not found in cache`);
            setMode("error");
            return;
          }
          fileBlob = fileFromCache;
        }

        if (fileBlob) {

          const buffer = await fileBlob.arrayBuffer();
          // bail after every await if another run has started
          if (ffmpegRef.current !== ffmpeg) {
            return;
          }
          var uint8View = new Uint8Array(buffer);
          ffmpegRef.current.FS("writeFile", fileName, uint8View);
          // console.log(`💜 👉 await ffmpeg.writefile(${fileName}) [${ffmpeg.FS("readdir", "/")}]`);

        } else {
          console.log(`❗ no blob for "${fileName}")`);
        }
      }
      try {


        // ffmpeg.setLogger(({ message }) => {
        //   console.log(message);
        //   console.log(`message=${message}`);
        // });
        ffmpeg.setProgress((ratio) => {
          console.log(`ratio=${JSON.stringify(ratio)}`);
        });
        const parsedComment :string[] = parse(command).filter((s) => s.toString()) as string[];
        // console.log(`💜 await ffmpegRef.run(${parsedComment})`)
        await ffmpeg.run(...parsedComment);

        const allFFmpegFiles = ffmpeg.FS("readdir", "/");
        console.log('allFFmpegFiles', allFFmpegFiles);

        // remove the files we wrote
        filesToWrite.forEach(f => ffmpeg.FS("unlink", f));

        // output the new video files
        // allFFmpegFiles
        console.log('allFFmpegFiles', allFFmpegFiles);
        const outputFiles = ffmpeg.FS("readdir", "/outputs");
        outputFiles.forEach(filename => {
          console.log(`🔴 checking "${filename}"`);
          // ignore the input files we already deleted
          // if (filesToWrite.includes(filename)) {
          //   console.log(`🔴 ignoring bc in filesToWrite: "${filename}"`);
          //   return;
          // }
          // must have a video extension
          if (filename.endsWith(".mp4") || filename.endsWith(".webm")) {
            const data = ffmpeg.FS("readFile", `/outputs/${filename}`);
            const blob = new Blob([data.buffer], { type: "video/mp4" });
            const file = new File([blob], filename, { type: "video/mp4" });
          //   export interface FileValidated {
          //     file: File;
          //     valid: boolean;
          //     id: number | string | undefined;
          //     errors?: string[];
          //     uploadMessage?: string;
          //     uploadStatus?: undefined | UPLOADSTATUS;
          // }
            console.log(`🔴 adding to cache: "${filename}"`);
            addUploadedFile({ file, valid:true, id: undefined });
            // localForage.setItem(filename, file);

            ffmpeg.FS("unlink", `/outputs/${filename}`);
          } else {
            console.log(`❗ ignoring "${filename}"`);
          }

        });
        // ffmpeg.FS('readFile', 'video.mp4');

        // get the output files
      } catch(err) {
        console.error(err);
        setError(`${err}`);
        setMode("error");
        return;
      }
      setMode("success");
      // bail after every await if another run has started
      if (ffmpegRef.current !== ffmpeg) {
        return;
      }

      // const allFFmpegFiles = ffmpeg.FS("readdir", "/");
      // console.log('allFFmpegFiles', allFFmpegFiles);





      // ffmpeg.FS("writeFile", name, await fetchFile(files[0]));


      // readdir
      // const data = ffmpeg.FS("readFile", "output.mp4");
      // const video = document.getElementById("player");
      // video.src = URL.createObjectURL(
      //   new Blob([data.buffer], { type: "video/mp4" })
      // );
    },
    [ffmpegRef, uploadedFiles, cachedFiles, setError, setMode]
  );

  const onSubmit = useCallback(
    (values: FormType) => {
      if (values.command) {
        setMode("running")
        setCommand(values.command);
        run(values.command);
      }
    },
    [setMode, setCommand, run]
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
      <form onSubmit={formik.handleSubmit}>
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

      {error ? <MessageError message={error} /> : null}
    </VStack>
  );
};
