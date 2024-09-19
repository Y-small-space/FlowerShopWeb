import "@mantine/core/styles.css";
import React from "react";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Flawors",
  description: "Flawors store",
};

export default function RootLayout({ children }: { children: any }) {
  // redirect("/main/uploader");
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body style={{ overflow: "auto" }}>
        <AntdRegistry>
          <MantineProvider>{children}</MantineProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
