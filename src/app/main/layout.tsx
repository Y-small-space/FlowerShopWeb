"use client";

import { AppShell, Group, NavLink } from "@mantine/core";
import { Suspense } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconChevronRight, IconGauge } from "@tabler/icons-react";

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const isSmallScreen = useMediaQuery("(max-width: 768px)"); // 检测屏幕宽度小于768px

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: isSmallScreen ? 250 : 300, // 设置不同屏幕下的导航栏宽度
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: !opened }, // 在移动设备上根据状态折叠导航栏
      }}
      padding="md"
      styles={(theme) => ({
        main: {
          backgroundColor: theme.colors.gray[0],
        },
      })}
    >
      <AppShell.Header>
        <Group
          h="100%"
          px="md"
          style={{
            backgroundColor: "rgb(86,152,251)",
            color: "white",
            fontSize: "1.5rem",
            justifyContent: "space-between", // 使内容在行内居中分布
            alignItems: "center", // 垂直居中对齐
          }}
        >
          FlowerShop
          <button
            onClick={toggle}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "white",
            }}
          >
            {opened ? "关闭导航" : "打开导航"}
          </button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {/* <NavLink
          href="/main/uploadPage"
          label="上传文件"
          rightSection={
            <IconChevronRight
              size="0.8rem"
              stroke={1.5}
              className="mantine-rotate-rtl"
            />
          }
        /> */}
        {/* <NavLink
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
        > */}
        <NavLink href="/main/setOrder" label="创建订单" />
        <NavLink href="/main/orderList" label="订单列表" />
        {/* </NavLink> */}
      </AppShell.Navbar>
      <AppShell.Main style={{ overflow: "auto" }}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </AppShell.Main>
    </AppShell>
  );
}
