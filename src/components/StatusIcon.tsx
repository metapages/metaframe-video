import { CheckIcon, HamburgerIcon, WarningIcon } from "@chakra-ui/icons";
import { Box, Center, Spinner } from "@chakra-ui/react";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { useHashParamBoolean } from "@metapages/hash-query";
import { useFileStore } from "../store";

export const StatusIcon: React.FC = () => {
  const mode = useFileStore((state) => state.mode);
  const [collapsed, setCollapsed] = useHashParamBoolean("c");

  let icon: ReactJSXElement;

  switch (mode) {
    case "error":
      icon = <WarningIcon color="red" />;
      break;
    case "idle":
      icon = <HamburgerIcon color="blue" />;
      break;
    case "success":
      icon = <CheckIcon color="green" />;
      break;
    case "running":
      icon = <Spinner size="sm" />;
      break;
    case "cancelled":
      icon = <WarningIcon color="blue" />;
      break;
  }

  return (
    <Center p={2}>
      <Box onClick={() => setCollapsed(!collapsed)}>{icon}</Box>
    </Center>
  );
};
