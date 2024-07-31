import { MantineProvider } from "@mantine/core";
import Main from "./main/page";

export default function Home() {
  return (
    <MantineProvider>
      <Main />
    </MantineProvider>
  );
}
