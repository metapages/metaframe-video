import { useEffect, useState } from "react";
import { Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { useFileStore } from "../store";
import { DeleteIcon, DownloadIcon } from "@chakra-ui/icons";

export const TabPanelFileList: React.FC = () => {
  const syncCachedFiles = useFileStore((state) => state.syncCachedFiles);
  const cachedFiles = useFileStore((state) => state.cachedFiles);
  const uploadedFiles = useFileStore((state) => state.uploadedFiles);

  useEffect(() => {
    syncCachedFiles();
  }, [syncCachedFiles]);

  const files: { name: string; cached: boolean }[] = [
    ...cachedFiles.map((file) => ({ name: file, cached: true })),
    ...uploadedFiles
      .filter((file) => !cachedFiles.includes(file.file.name))
      .map((file) => ({ name: file.file.name, cached: false })),
  ];

  return (
    <VStack alignItems="flex-start">
      {files.map((file, i) => (
        <FileLineItem key={i} filename={file.name} cached={file.cached} />
      ))}
    </VStack>
  );
};

const FileLineItem: React.FC<{ filename: string; cached: boolean }> = ({
  filename,
  cached,
}) => {
  const deleteFile = useFileStore((state) => state.deleteFile);
  const cacheFile = useFileStore((state) => state.cacheFile);
  const getFile = useFileStore((state) => state.getFile);
  const [objectUrl, setObjectUrl]  = useState<string|undefined>();

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;
    (async () => {

      try {

        const file = await getFile(filename);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(file);
        setObjectUrl(objectUrl);

      } catch(err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) {
        // cleanup
        URL.revokeObjectURL(objectUrl);
      }
    }
  }, [filename, getFile, setObjectUrl]);



  return (
    <HStack>
      <IconButton
        aria-label="delete"
        onClick={() => deleteFile(filename)}
        icon={<DeleteIcon />}
      />
      <Box>{filename}</Box>

      {cached ? (
        <Box>cached</Box>
      ) : (
        <IconButton
          aria-label="cache"
          onClick={() => cacheFile(filename)}
          icon={<DownloadIcon />}
        />
      )}

        {objectUrl ? <a download={filename} href={objectUrl} >download</a> : null }

    </HStack>
  );
};
