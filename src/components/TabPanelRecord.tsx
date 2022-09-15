import { useEffect } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { useFileStore } from "../store";
import "video.js/dist/video-js.min.css";
import "videojs-record/dist/css/videojs.record.css";
import { VideoJsRecorder } from "./VideoJsRecorder";
import { FileList } from "./FileList";

export const TabPanelRecord: React.FC = () => {
  const syncCachedFiles = useFileStore((state) => state.syncCachedFiles);
  const videoSrc = useFileStore((state) => state.playSource);

  // do this at least once
  useEffect(() => {
    syncCachedFiles();
  }, [syncCachedFiles]);

  return (
    <HStack alignItems="flex-start">
      <Box>
        <VideoJsRecorder
          options={{ sources: videoSrc ? [videoSrc] : undefined }}
        />
      </Box>

      <FileList />
    </HStack>
  );
};
