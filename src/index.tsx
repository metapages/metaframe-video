import { createRoot } from "react-dom/client";
import localForage from "localforage";
import { WithMetaframe } from "@metapages/metaframe-hook";
import { ChakraProvider } from "@chakra-ui/react";
import { App } from "./App";

// for caching blobs from S3 and immutable graphql responses in the browser
// TODO: maybe integrate into an apollo persistent cache
localForage.config({
  driver: localForage.INDEXEDDB,
  name: "metaframe",
  version: 1.0,
  storeName: "files", // Should be alphanumeric, with underscores.
  description: "Cached files",
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <ChakraProvider>
    <WithMetaframe>
      <App />
    </WithMetaframe>
  </ChakraProvider>
);
