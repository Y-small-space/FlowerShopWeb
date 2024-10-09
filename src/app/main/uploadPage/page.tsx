"use client";
import React, { useState } from "react";
import { Button, Group, FileInput, Alert } from "@mantine/core";
import { Text } from "@mantine/core";
import { Notification } from "@mantine/core";
import { message } from "antd";
import Loading from "@/app/components/loading";
import JSZip from "jszip";
import { Octokit } from "@octokit/rest";
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }); // 使用 GitHub Token 创建 Octokit 实例

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

    try {
      // 将 Excel 文件上传到 GitHub1  ·
      const flowerExcelData = await flowerExcel.arrayBuffer();
      await uploadFileToGitHub("DateBase/flawers/flower.xlsx", flowerExcelData);

      // 解压 ZIP 文件
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      const uploadPromises: any = [];

      // 遍历 ZIP 文件中的每个文件
      zipData.forEach((relativePath, file) => {
        if (
          file.dir ||
          relativePath.startsWith("__MACOSX") ||
          relativePath.endsWith(".DS_Store")
        ) {
          return;
        }

        // 上传每个文件到 GitHub
        uploadPromises.push(uploadZipFileToGitHub(file, relativePath));
      });

      // 执行所有上传操作
      await Promise.all(uploadPromises);

      message.success("上传成功");
    } catch (error) {
      console.error(error);
      message.error("上传失败");
    } finally {
      setLoading(false);
    }

    if (response.status === 200) {
      message.success("上传成功");
    } else {
      alert("上传错误");
    }

    setLoading(false);
  };

  // 上传文件到 GitHub 的函数
  const uploadFileToGitHub = async (path: string, content: ArrayBuffer) => {
    const base64Content = Buffer.from(content).toString("base64");
    try {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: "Y-small-space",
        repo: "FlowerShopWeb",
        path: path,
        message: `Upload ${path}`,
        content: base64Content,
      });
    } catch (error) {
      console.error("Failed to upload to GitHub:", error);
      throw new Error(`Failed to upload file ${path}`);
    }
  };

  // 上传 ZIP 文件中的每个文件
  const uploadZipFileToGitHub = async (file: any, relativePath: string) => {
    const fileData = await file.async("nodebuffer");
    const newFileName = `${relativePath.split("/").pop()}`;
    const githubPath = `DateBase/flawers/${newFileName}`;

    try {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: "Y-small-space",
        repo: "FlowerShopWeb",
        path: githubPath,
        message: `Upload ${newFileName}`,
        content: fileData.toString("base64"),
      });
      console.log("File uploaded successfully:", githubPath);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file ${githubPath}`);
    }
  };

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
