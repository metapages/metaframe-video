import { FunctionalComponent } from "preact";
import {
  SimpleGrid,
} from "@chakra-ui/react";
// import { Header } from "/@/components/Header";
import { MetaframeOutputsRaw } from '/@/components/MetaframeOutputsRaw';

export const Route: FunctionalComponent = () => (
  <SimpleGrid columns={1} spacing={10}>
    <MetaframeOutputsRaw />
  </SimpleGrid>
);
