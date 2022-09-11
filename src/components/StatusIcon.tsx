import { CheckIcon, WarningIcon } from "@chakra-ui/icons";
import { Spinner } from "@chakra-ui/react";
import { useFileStore } from "../store";

export const StatusIcon: React.FC = () => {
  const mode = useFileStore((state) => state.mode);

  switch (mode) {
    case "error":
      return <WarningIcon color="red" />;
    case "idle":
      return <WarningIcon color="blue" />;
    case "success":
      return <CheckIcon color="green" />;
    case "running":
      return <Spinner size="sm" />;
    case "cancelled":
      return <WarningIcon color="blue" />;
  }
};
