"use client";

import { AppShell, Group } from "@mantine/core";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { useDisclosure } from "@mantine/hooks";

export default function MainLayout({ children }: PropsWithChildren<{}>) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          Flawer
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Link href="/main/uploadPage">PushDate</Link>
        <Link href="">1</Link>
        <Link href="">1</Link>
        <Link href="">1</Link>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
