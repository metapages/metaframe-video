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
import { useMetaframe } from "@metapages/metaframe-hook";
import { useFileStore } from "../store";
import { FileBlob } from "../components/FileBlob";

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

      // Add all files, and set the last file to the selected
      let fileBlobToPlay: FileBlob | undefined;
      keys.forEach((key) => {
        if (inputs[key] instanceof Blob) {
          const type = `video/${key.split(".")[key.split(".").length - 1]}`;
          const blob = new Blob([inputs[key] as Blob], { type });
          const fileBlob: FileBlob = { name: key, file: blob, cached: false };
          addFile(fileBlob);
          fileBlobToPlay = fileBlob;
        }
      });
      if (fileBlobToPlay) {
        fileBlobToPlay.urlEncoded = URL.createObjectURL(fileBlobToPlay.file!);
        setVideoSrc({
          src: fileBlobToPlay.urlEncoded!,
          type: inputs[fileBlobToPlay.name].type,
        });
      }
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
