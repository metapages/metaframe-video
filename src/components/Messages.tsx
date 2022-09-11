import {
  UnorderedList,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  ListItem,
  AlertStatus,
  Link,
} from "@chakra-ui/react";

export type MessagePayload = {
  status?: AlertStatus;
  header?: string;
  messages?: string[];
  message?: string;
}

export const Message: React.FC<MessagePayload> = ({ status = "error", header, message, messages }) => (
  <Alert status={status}>
    <AlertIcon />
    {header ? <AlertTitle>{header}</AlertTitle> : null}

    {message ? <AlertDescription>{`${message}`}</AlertDescription> : null}

    {messages && messages.length === 1 ? (
      <AlertDescription>{maybeConvertToLink(messages[0])}</AlertDescription>
    ) : null}

    {messages && messages.length > 1 ? (
      <AlertDescription>
        <UnorderedList>
          {messages.map((m, i) => (
            <ListItem key={i}>{maybeConvertToLink(m)}</ListItem>
          ))}
        </UnorderedList>
      </AlertDescription>
    ) : null}
  </Alert>
);

export const MessageError: React.FC<{
  header?: string;
  message?: string;
  messages?: string[];
}> = ({ header, message, messages }) => (
  <Message
    status="error"
    header={header}
    message={message}
    messages={messages}
  />
);

const maybeConvertToLink = (m: any) => {
  if (typeof m === "string" && (m as string).startsWith("http")) {
    return <Link href={m}>{m}</Link>;
  }
  return `${m}`;
};
