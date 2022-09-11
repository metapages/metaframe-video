import { useEffect } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { useFileStore } from "../store";
import { DeleteIcon, DownloadIcon } from "@chakra-ui/icons";

export const TabPanelFileList: React.FC = () => {
  const syncCachedFiles = useFileStore((state) => state.syncCachedFiles);
  const cachedFiles = useFileStore((state) => state.cachedFiles);
  const uploadedFiles = useFileStore((state) => state.uploadedFiles);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const cacheFile = useFileStore((state) => state.cacheFile);


  useEffect(() => {
    syncCachedFiles();
  }, [syncCachedFiles]);

  const files :{name:string,cached:boolean}[] =
    [
      ...cachedFiles.map((file) => ({name:file,cached:true})),
      ...uploadedFiles.filter(file => !cachedFiles.includes(file.file.name)).map((file) => ({name:file.file.name,cached:false}))
    ];


  return (
    <VStack alignItems="flex-start">
      {files.map((file, i) => (
        <HStack key={i}>

          <IconButton
            aria-label="delete"
            onClick={() => deleteFile(file.name)}
            icon={<DeleteIcon />}
            />
            <Box>{file.name}</Box>

          {file.cached ? <Box>cached</Box> : <IconButton
            aria-label="cache"
            onClick={() => cacheFile(file.name)}
            icon={<DownloadIcon />}
            />}

        </HStack>
      ))}
    </VStack>
  );
};
