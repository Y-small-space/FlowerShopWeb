import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import * as XLSX from "xlsx";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = "Y-small-space";
const repo = "DB";
const filePath = "DateBase/customs/customs.xlsx"; // 文件路径

// 上传或更新 Excel 文件到 GitHub
const uploadToGitHub = async (content: Buffer, path: string, sha?: string) => {
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: sha ? `Update ${path}` : `Create ${path}`,
      content: content.toString("base64"),
      sha,
    });
  } catch (error) {
    console.error("Error uploading file to GitHub:", error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  const { orders } = await request.json(); // 接收订单数据

  // 转换订单数据为符合要求的格式
  const updatedData = orders.map((order: any) => ({
    name: order.customer,
    ...order.order.reduce((acc: any, order: string, index: number) => ({
      ...acc,
      [`Order ${index + 1}`]: order,
    }), {}),
  }));

  // 创建 Excel 工作簿并添加数据
  const worksheet = XLSX.utils.json_to_sheet(updatedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

  // 转换为 buffer 以便上传
  const fileContent = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  try {
    // 尝试获取现有文件的 SHA 值
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    // 检查返回的数据是否是文件
    if (Array.isArray(response.data)) {
      throw new Error("Path is a directory or invalid.");
    }

    const { sha } = response.data as { sha: string }; // 类型断言为文件类型

    // 更新文件
    await uploadToGitHub(fileContent, filePath, sha);
  } catch (error: any) {
    if (error.status === 404) {
      // 文件不存在，创建新文件
      await uploadToGitHub(fileContent, filePath);
    } else {
      console.error("Error checking file existence:", error);
      return NextResponse.json(
        { error: "Error updating file on GitHub" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "File uploaded/updated successfully" });
}

export async function GET() {
  // 获取文件用于前端下载
  try {
    const { data: fileContent }: { data: any } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });
    const content: any = fileContent?.content;
    if (!content) return;
    const fileBuffer = Buffer.from(content, "base64");
    return NextResponse.json({ fileBuffer: fileBuffer.toString("base64") });
  } catch (error) {
    console.error("Error fetching file from GitHub:", error);
    return NextResponse.json(
      { error: "Error fetching file from GitHub" },
      { status: 500 }
    );
  }
}