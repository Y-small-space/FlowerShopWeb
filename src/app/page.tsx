"use client";
import { MantineProvider } from "@mantine/core";
import MainLayout from "./main/layout";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    redirect("/main/setOrder");
  }, []);
  return (
    <MantineProvider>
      <MainLayout />
    </MantineProvider>
  );
}
