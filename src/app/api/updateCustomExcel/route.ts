import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import * as XLSX from "xlsx";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = "Y-small-space";
const repo = "FlowerShopWeb";
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

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const filePath = url.searchParams.get('filePath');

  if (!filePath) {
    return NextResponse.json({ error: 'Missing filePath parameter' }, { status: 400 });
  }

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: `/DateBase/orders/${filePath}`,
    });

    // 检查返回的数据是否是文件
    if (Array.isArray(response.data)) {
      throw new Error("Path is a directory or invalid.");
    }

    const { content } = response.data as { content: string }; // 类型断言为文件类型
    if (!content) {
      throw new Error("File content not found.");
    }

    // 解码 base64 内容
    const fileContent = Buffer.from(content, 'base64');
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Process jsonData to combine guige_number and guige_currency into a guige object
    const processedData = jsonData.map((item: any) => ({
      ...item,
      guige: {
        number: item.guige_number,
        currency: item.guige_currency,
      },
      guige_number: undefined,
      guige_currency: undefined,
    }));

    console.log('processedData', processedData);

    return NextResponse.json(processedData);
  } catch (error: any) {
    console.error("Error fetching file from GitHub:", error);
    return NextResponse.json({ error: `错误: ${error.message}` }, { status: 500 });
  }
}