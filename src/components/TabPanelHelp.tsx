import { VStack } from "@chakra-ui/react";

export const TabPanelHelp: React.FC = () => {
  const url = `${window.location.origin}${window.location.pathname}/README.md`;
  const iframeUrl = `https://markdown.mtfm.io/#?url=${url}`;
  return (
    <VStack>
      <iframe sandbox="allow-same-origin allow-scripts allow-top-navigation-by-user-activation" width="100%" height="100%" src={iframeUrl} />
    </VStack>
  );
};
