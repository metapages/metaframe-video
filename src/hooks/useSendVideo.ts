import { useCallback } from "react";
import { useMetaframe } from "@metapages/metaframe-hook";
import objectHash from "object-hash";
import { FileBlob } from "../components/FileBlob";
import { useFileStore } from "../store";

export const useSendVideo: () =>
  | ((fileBlob: FileBlob) => Promise<void>)
  | null = () => {
  const metaframeBlob = useMetaframe();
  const getFile = useFileStore((state) => state.getFile);

  const sendMetaframeVideoOutput = useCallback(
    async (fileBlob: FileBlob) => {
      console.log('sendMetaframeVideoOutput')
      const file = await getFile(fileBlob.name);
      if (!file) {
        console.error(`Failed to send ${name}`);
        return;
      }

      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          console.log('loaded', !!reader.result)
          // convert image file to base64 string
          if (reader.result) {
            const base64String = (reader.result as string).split(",")[1];
            // metaframeBlob.metaframe?.setOutput("video", {
            //   name: fileBlob.name,
            //   file: {
            //     value: base64String,
            //     hash: objectHash.sha1(base64String),
            //     type: "base64",
            //   },
            // });
            console.log('metaframeBlob.metaframe?.setOutput', metaframeBlob.metaframe?.setOutput);
            metaframeBlob.metaframe?.setOutput("video", {
              name: fileBlob.name,
              value: base64String,
              hash: objectHash.sha1(base64String),
              type: "base64",
            });
          }
        },
        false
      );

      reader.readAsDataURL(file);
    },
    [metaframeBlob.metaframe, getFile]
  );

  return metaframeBlob?.metaframe ? sendMetaframeVideoOutput : null;
};
