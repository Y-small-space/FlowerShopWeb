"use client";
import React, { useState } from "react";
import { Button, Group, FileInput, Alert } from "@mantine/core";
import { Text } from "@mantine/core";
import { Notification } from "@mantine/core";
import { message } from "antd";
import Loading from "@/app/components/loading";

const PushDatePage = () => {
  const [flowerExcel, setFlowerExcel] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useState("none");

  const handleFlowerExcelChange = (file: File | null) => {
    setFlowerExcel(file);
  };

  const handleZipFileChange = (file: File | null) => {
    setZipFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    if (!flowerExcel || !zipFile) {
      alert("Excel文件和压缩包必须同时传入");
      setLoading(false);
      return;
    }

    if (flowerExcel) {
      formData.append("flowerExcel", flowerExcel);
    }

    if (zipFile) {
      formData.append("zipFile", zipFile);
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    console.log("====================================");
    console.log(response);
    console.log("====================================");
    if (response.status === 200) {
      message.success("上传成功");
    } else {
      alert("上传错误");
    }

    setLoading(false);
  };
  function Demo() {
    return (
      <Notification
        title="上传成功"
        style={{ width: "30%", float: "right" }}
        display={display}
        onClick={() => setDisplay("none")}
      ></Notification>
    );
  }
  return (
    <div>
      <Text fw={700} size="xl">
        上传数据
      </Text>
      <br />
      {loading ? (
        <Loading />
      ) : (
        <form onSubmit={handleSubmit}>
          <Group
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <FileInput
              label="花数据的Excel文件"
              placeholder="请传入Excel文件"
              onChange={handleFlowerExcelChange}
              accept=".xlsx, .xls"
              style={{ width: "300px" }}
              required
            />
            <FileInput
              label="花图片文件夹的压缩包"
              placeholder="请传入压缩包"
              onChange={handleZipFileChange}
              accept=".zip, .rar"
              style={{ width: "300px" }}
              required
            />
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: "blue", to: "grape", deg: 90 }}
              loading={loading}
            >
              上传
            </Button>
          </Group>
        </form>
      )}
    </div>
  );
};

export default PushDatePage;
