"use client";

import { AppShell, Group, NavLink } from "@mantine/core";
import { PropsWithChildren } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronRight, IconGauge } from "@tabler/icons-react";
import { ReactNode } from "react";

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          FlowerShop
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink
          href="/main/uploadPage"
          label="上传文件"
          rightSection={
            <IconChevronRight
              size="0.8rem"
              stroke={1.5}
              className="mantine-rotate-rtl"
            />
          }
        />
        <NavLink
          href="#"
          label="订单"
          leftSection={<IconGauge size="1rem" stroke={1.5} />}
          rightSection={
            <IconChevronRight
              size="0.8rem"
              stroke={1.5}
              className="mantine-rotate-rtl"
            />
          }
        >
          <NavLink href="/main/orderList" label="订单列表" />
          <NavLink href="/main/setOrder" label="创建订单" />
        </NavLink>
      </AppShell.Navbar>
      <AppShell.Main style={{ overflow: "auto" }}>{children}</AppShell.Main>
    </AppShell>
  );
}
