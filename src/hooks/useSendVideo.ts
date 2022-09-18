import { useCallback } from "react";
import { useMetaframe } from "@metapages/metaframe-hook";
import { FileBlob } from "../components/FileBlob";
import { useFileStore } from "../store";

export const useSendVideo: () =>
  | ((fileBlob: FileBlob) => Promise<void>)
  | null = () => {
  const metaframeBlob = useMetaframe();
  const getFile = useFileStore((state) => state.getFile);

  const sendMetaframeVideoOutput = useCallback(
    async (fileBlob: FileBlob) => {
      const file = await getFile(fileBlob.name);
      if (!file) {
        console.error(`Failed to send ${name}`);
        return;
      }

      metaframeBlob.metaframe?.setOutput("video", file);
    },
    [metaframeBlob.metaframe, getFile]
  );

  return metaframeBlob?.metaframe ? sendMetaframeVideoOutput : null;
};
