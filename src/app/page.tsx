import { MantineProvider } from "@mantine/core";
import MainLayout from "./main/layout";

export default function Home() {
  return (
    <MantineProvider>
      <MainLayout />
    </MantineProvider>
  );
}
