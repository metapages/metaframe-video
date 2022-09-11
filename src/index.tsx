import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import localForage from "localforage";
import { WithMetaframeAndInputs } from "@metapages/metaframe-hook";
import { ChakraProvider } from "@chakra-ui/react";
import { App } from "./App";


// for caching blobs from S3 and immutable graphql responses in the browser
// TODO: maybe integrate into an apollo persistent cache
localForage.config({
  driver: localForage.INDEXEDDB,
  name: "metaframe-ffmpeg",
  version: 1.0,
  storeName: "files", // Should be alphanumeric, with underscores.
  description: "Cached video files",
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <StrictMode>
    <ChakraProvider>
      <WithMetaframeAndInputs>
        <App />
      </WithMetaframeAndInputs>
    </ChakraProvider>
  </StrictMode>
);
