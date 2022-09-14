import { useEffect, useState, useCallback } from "react";
import {
  Box,
  HStack,
  IconButton,
  Link,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { useFileStore } from "../store";
import { CheckIcon, DeleteIcon, DownloadIcon } from "@chakra-ui/icons";
import { FaPlay } from "react-icons/fa";
import { FileBlob } from "./FileBlob";
import { VideoPlayer } from "./VideoPlayer";

export const TabPanelFileList: React.FC = () => {
  const syncCachedFiles = useFileStore((state) => state.syncCachedFiles);
  const files = useFileStore((state) => state.files);
  const getFile = useFileStore((state) => state.getFile);
  const [videoSrc, setVideoSrc] = useState<
    { src: string; type: string } | undefined
  >();

  useEffect(() => {
    syncCachedFiles();
  }, [syncCachedFiles]);

  const onClick = useCallback(
    async (fileBlob: FileBlob) => {
      const file = await getFile(fileBlob.name);
      if (file) {
        if (!fileBlob.urlEncoded) {
          fileBlob.urlEncoded = URL.createObjectURL(file);
        }
        console.log(`setVideoSrc`, { src: fileBlob.urlEncoded!, type: file.type })
        setVideoSrc({ src: fileBlob.urlEncoded!, type: file.type });
      } else {
        console.log('onClick but no file', fileBlob)
      }
    },
    [setVideoSrc]
  );

  return (
    <HStack>
      <Box>
        <VideoPlayer videoSource={videoSrc} />
      </Box>

      <TableContainer>
        <Table variant="simple">
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>Play</Th>
              <Th>Name</Th>
              <Th>Local browser cache</Th>
              <Th>Download</Th>
              <Th>Delete</Th>
            </Tr>
          </Thead>
          <Tbody>
            {files.map((file, i) => (
              <FileLineItem
                key={i}
                file={file}
                onClick={async () => {
                  console.log("clicked ", file.name);
                  onClick(file);
                }}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* <VStack alignItems="flex-start">
        {files.map((file, i) => (
          <FileLineItem
            key={i}
            file={file}
            onClick={async () => {
              console.log("clicked ", file.name);
              onClick(file);
            }}
          />
        ))}
      </VStack> */}
    </HStack>
  );
};

const FileLineItem: React.FC<{ file: FileBlob; onClick: () => void }> = ({
  file,
  onClick,
}) => {
  const { cached, name } = file;
  const deleteFile = useFileStore((state) => state.deleteFile);
  const cacheFile = useFileStore((state) => state.cacheFile);
  const getFile = useFileStore((state) => state.getFile);
  const [objectUrl, setObjectUrl] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;
    (async () => {
      try {
        const file = await getFile(name);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(file);
        setObjectUrl(objectUrl);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) {
        // cleanup
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [name, getFile, setObjectUrl]);

  return (
    <Tr>
      <Td>
        <IconButton aria-label="play" onClick={onClick} icon={<FaPlay />} />
      </Td>
      <Td>{name}</Td>

      <Td>
        {cached ? (
          <CheckIcon color="black" />
        ) : (
          <IconButton
            aria-label="cache"
            onClick={() => cacheFile(file)}
            icon={<DownloadIcon />}
          />
        )}
      </Td>

      <Td>
          <IconButton
            aria-label="download"
            icon={<DownloadIcon />}
            onClick={
              () => {
                if (!objectUrl) {
                  return;
                }
                const link = document.createElement("a");
                link.download = `download.txt`;
                link.href = objectUrl;
                link.click();
              }
            }
          />
      </Td>
      <Td>
        <IconButton
          aria-label="delete"
          onClick={() => deleteFile(name)}
          icon={<DeleteIcon />}
        />
      </Td>
    </Tr>
  );

  // return (
  //   <VStack>
  //     <HStack>
  //       <IconButton
  //         aria-label="delete"
  //         onClick={() => deleteFile(name)}
  //         icon={<DeleteIcon />}
  //       />
  //       <Box onClick={onClick}>{name}</Box>

  //       {cached ? (
  //         <Box>cached</Box>
  //       ) : (
  //         <IconButton
  //           aria-label="cache"
  //           onClick={() => cacheFile(file)}
  //           icon={<DownloadIcon />}
  //         />
  //       )}

  //       {objectUrl ? (
  //         <a download={name} href={objectUrl}>
  //           download
  //         </a>
  //       ) : null}
  //     </HStack>
  //   </VStack>
  // );
};
