import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Center,
} from "@chakra-ui/react";
import { useHashParamInt } from "@metapages/hash-query";
import { TabPanelRecord } from "../components/TabPanelRecord";
import { TabPanelHelp } from "/@/components/TabPanelHelp";
import { TabPanelUpload } from "../components/TabPanelUpload";
import { TabPanelFileList } from "../components/TabPanelFileList";
import { StatusIcon } from "../components/StatusIcon";

export const Route: React.FC = () => {
  const [tabIndex, setTabIndex] = useHashParamInt("tab", 0);

  return (
    <VStack spacing={10} width="100%" alignItems="stretch">
      <Tabs index={tabIndex} onChange={setTabIndex}>

        <TabList>
          <Center><StatusIcon /></Center>
          <Tab>Record</Tab>
          <Tab>Files</Tab>
          <Tab>Upload</Tab>
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
            <TabPanelUpload />
          </TabPanel>




          <TabPanel>
            <TabPanelHelp />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};
