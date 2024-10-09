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
import crypto from "crypto";

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

  // 计算哈希值的函数
  // function calculateHash(chunk) {
  //   const hash = crypto.createHash("sha256"); // 使用 sha256 哈希算法
  //   hash.update(chunk); // 传入切片数据
  //   return hash.digest("hex"); // 返回计算出的哈希值，使用 'hex' 编码格式
  // }

  // async function uploadFile(file: any) {
  //   const chunkSize = 5 * 1024 * 1024; // 5MB 切片大小
  //   const totalChunks = Math.ceil(file.size / chunkSize); // 计算总的切片数

  //   // 循环遍历每个切片进行上传
  //   for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
  //     const start = chunkIndex * chunkSize;
  //     const end = Math.min(file.size, start + chunkSize); // 确保最后一块不超出文件大小
  //     const chunk = file.slice(start, end); // 获取当前切片

  //     console.log(
  //       `Uploading chunk ${chunkIndex} from ${start} to ${end} of size ${chunk.size}`
  //     );

  //     const formData = new FormData();
  //     formData.append("chunk", chunk); // 可选的附加数据
  //     const chunkHash = await calculateHash(chunk); // 异步计算哈希
  //     console.log(`Chunk hash for chunk ${chunkIndex}:`, chunkHash);

  //     const headers = new Headers();
  //     headers.append("X-Index", encodeURIComponent(chunkIndex.toString()));
  //     headers.append(
  //       "X-TotalChunks",
  //       encodeURIComponent(totalChunks.toString())
  //     );
  //     headers.append("X-Filename", encodeURIComponent(file.name));
  //     headers.append("X-Chunk-Hash", chunkHash);

  //     try {
  //       // 使用 fetch 上传切片
  //       const response = await fetch("/api/upload-chunk", {
  //         method: "POST",
  //         headers: headers,
  //         body: formData, // 直接传递切片数据
  //       });

  //       if (!response.ok) {
  //         throw new Error(`Failed to upload chunk ${chunkIndex}`);
  //       }

  //       const result = await response.json();
  //       console.log(result.message); // 每块切片上传成功后，日志记录

  //       // 你可以在这里更新进度条，比如：
  //       console.log(
  //         `Progress: ${Math.round(((chunkIndex + 1) / totalChunks) * 100)}%`
  //       );
  //     } catch (error) {
  //       console.error(`Error uploading chunk ${chunkIndex}:`, error);
  //       // 可以在这里实现重试逻辑
  //     }
  //   }

  //   console.log("All chunks uploaded successfully");
  // }
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
      // await uploadFile(zipFile);
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
function calculateHash(chunk: any) {
  throw new Error("Function not implemented.");
}
