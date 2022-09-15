import { Box, HStack } from "@chakra-ui/react";
import { useFileStore } from "../store";
import { FileList } from "./FileList";
import { VideoPlayer } from "./VideoPlayer";

export const TabPanelFileList: React.FC = () => {
  const videoSrc = useFileStore((state) => state.playSource);

  return (
    <HStack alignItems="flex-start">
      <Box>
        <VideoPlayer options={{ sources: videoSrc ? [videoSrc] : undefined }} />
      </Box>

      <FileList />
    </HStack>
  );
};
