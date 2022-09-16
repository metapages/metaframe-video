import { useEffect } from "react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useHashParamBoolean, useHashParamInt } from "@metapages/hash-query";
import { TabPanelRecord } from "../components/TabPanelRecord";
import { TabPanelHelp } from "/@/components/TabPanelHelp";
import { TabPanelFileList } from "../components/TabPanelFileList";
import { StatusIcon } from "../components/StatusIcon";
import { TabPanelOptions } from "../components/TabPanelOptions";
// import { useMetaframeAndInput } from "@metapages/metaframe-hook";
import { useMetaframe } from "@metapages/metaframe-hook";
import { useFileStore } from "../store";
import { FileBlob } from "../components/FileBlob";
import { DataRef, dataRefToBlob } from "@metapages/data-ref";

export const Route: React.FC = () => {
  const [tabIndex, setTabIndex] = useHashParamInt("tab", 0);
  const [collapsed] = useHashParamBoolean("c");
  const addFile = useFileStore((state) => state.addFile);
  const setVideoSrc = useFileStore((state) => state.setPlaySource);

  const metaframeBlob = useMetaframe();

  useEffect(() => {
    if (!metaframeBlob?.metaframe) {
      return;
    }
    const disposer = metaframeBlob.metaframe.onInputs((inputs) => {
      if (!inputs) {
        return;
      }
      const keys = Object.keys(inputs);
      if (keys.length === 0) {
        return;
      }

      // Just take the first input and hope it's video (dataref)
      const key = keys[0];
      const value = inputs[key];
      if (!value) {
        return;
      }

      (async () => {
        const ref: DataRef = value;
        const blob = await dataRefToBlob(ref);
        const file = new File([blob], key, { type: "video/mp4" });
        const fileBlob: FileBlob = { name: key, file: file, cached: false };
        addFile(fileBlob);

        if (!fileBlob.urlEncoded) {
          fileBlob.urlEncoded = URL.createObjectURL(fileBlob.file!);
        }
        setVideoSrc({ src: fileBlob.urlEncoded!, type: file.type });
      })();
    });

    return () => {
      if (disposer) {
        disposer();
      }
    };
  }, [metaframeBlob.metaframe]);

  if (collapsed) {
    return (
      <HStack spacing={1} width="100%" alignItems="flex-start">
        <StatusIcon />
        <TabPanelRecord />
      </HStack>
    );
  }

  return (
    <VStack spacing={10} width="100%" alignItems="stretch">
      <Tabs index={tabIndex} onChange={setTabIndex}>
        <TabList>
          <StatusIcon />
          <Tab>Record</Tab>
          <Tab>Files</Tab>
          <Tab>Options</Tab>
          <Tab>Help</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <TabPanelRecord />
          </TabPanel>

          <TabPanel>
            <TabPanelFileList />
          </TabPanel>

          <TabPanel>
            <TabPanelOptions />
          </TabPanel>

          <TabPanel>
            <TabPanelHelp />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};
