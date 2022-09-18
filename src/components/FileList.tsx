import { useEffect, useState, useCallback } from "react";
import {
  Box,
  HStack,
  IconButton,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useFileStore } from "../store";
import {
  ArrowForwardIcon,
  CheckIcon,
  DeleteIcon,
  DownloadIcon,
} from "@chakra-ui/icons";
import { FaPlay } from "react-icons/fa";
import { FileBlob } from "./FileBlob";
import { useSendVideo } from "../hooks/useSendVideo";

export const FileList: React.FC = () => {
  const syncCachedFiles = useFileStore((state) => state.syncCachedFiles);
  const files = useFileStore((state) => state.files);
  const getFile = useFileStore((state) => state.getFile);
  const setVideoSrc = useFileStore((state) => state.setPlaySource);

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
        setVideoSrc({ src: fileBlob.urlEncoded!, type: file.type });
      }
    },
    [setVideoSrc]
  );

  return (
    <HStack>
      <TableContainer>
        <Table variant="simple">
          <TableCaption>Video files</TableCaption>
          <Thead>
            <Tr>
              <Th>Play</Th>
              <Th>Send</Th>
              <Th>Delete</Th>
              <Th>Download</Th>
              <Th>Name</Th>
              <Th>Local browser cache</Th>
            </Tr>
          </Thead>
          <Tbody>
            {files.map((file, i) => (
              <FileLineItem
                key={i}
                file={file}
                onClick={async () => {
                  onClick(file);
                }}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
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
  const sendVideo = useSendVideo();

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

      <Td>
        <IconButton
          aria-label="send"
          onClick={async () => {
            sendVideo && sendVideo(file);
          }}
          icon={<ArrowForwardIcon />}
        />
      </Td>

      <Td>
        <IconButton
          aria-label="delete"
          onClick={() => deleteFile(name)}
          icon={<DeleteIcon />}
        />
      </Td>

      <Td>
        <IconButton
          aria-label="download"
          icon={<DownloadIcon />}
          onClick={() => {
            if (!objectUrl) {
              return;
            }
            const link = document.createElement("a");
            link.download = `download.txt`;
            link.href = objectUrl;
            link.click();
          }}
        />
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
    </Tr>
  );
};
