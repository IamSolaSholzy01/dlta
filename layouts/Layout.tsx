import { Box, Container, Tab, TabList, Tabs } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

const routes = [
  { label: "Countries", url: "/countries" },
  { label: "Records", url: "/records" },
];
export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const changeRoute = (index: number) => {
    router.push(routes[index].url).then();
  };
  const [defaultIndex, setDefaultIndex] = useState(0);
  useEffect(() => {
    const index = routes.findIndex(({ url }) => router.pathname.includes(url));
    setDefaultIndex(index);
  }, [router.pathname]);
  return (
    <Container centerContent={true} maxW={"90vw"}>
      <Box>
        <Tabs onChange={changeRoute} index={defaultIndex}>
          <TabList>
            {routes.map(({ label, url }, index) => (
              <Tab key={index}>{label}</Tab>
            ))}
          </TabList>
        </Tabs>
      </Box>
      <Box m={4} p={4} width={"100%"}>
        {children}
      </Box>
    </Container>
  );
}
