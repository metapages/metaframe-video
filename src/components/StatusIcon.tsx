import { CheckIcon, WarningIcon } from "@chakra-ui/icons";
import { Center, Spinner } from "@chakra-ui/react";
import { useFileStore } from "../store";

export const StatusIcon: React.FC = () => {
  const mode = useFileStore((state) => state.mode);

  switch (mode) {
    case "error":
      return <Center p={2}><WarningIcon color="red" /></Center>;
    case "idle":
      return <Center p={2}><WarningIcon color="blue" /></Center>;
    case "success":
      return <Center p={2}><CheckIcon color="green" /></Center>;
    case "running":
      return <Center p={2}><Spinner size="sm" /></Center>;
    case "cancelled":
      return <Center p={2}><WarningIcon color="blue" /></Center>;
  }
};
