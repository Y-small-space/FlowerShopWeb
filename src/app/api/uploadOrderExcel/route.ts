import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";
import * as XLSX from "xlsx";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = 'Y-small-space';
const repo = 'FlowerShopWeb';

const uploadToGitHub = async (content: any, path: string) => {
  try {
    const { data: existingFile } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    // 文件已经存在，更新文件
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Update ${path}`,
      content: content.toString("base64"),
      sha: (existingFile as any)?.sha,
    });
  } catch (error: any) {
    if (error.status === 404) {
      // 文件不存在，创建新文件
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Create ${path}`,
        content: content.toString("base64"),
      });
    } else {
      console.error("Error uploading file to GitHub:", error);
    }
  }
};

export async function POST(request: NextRequest) {
  const { customName, year, month, day, formValue } = await request.json();

  const orderData = {
    customName,
    date: String(`${year}-${month}-${day}`),
    contents: formValue.Order,  // 从请求中获取订单数据
  };

  console.log(orderData);

  // 将订单数据转换为行数据
  const rows = orderData.contents.map((content: any) => ({
    PackageID: content.PackageID,
    FlowerSpecies: content.FlowerSpecies,
    FlowerName: content.FlowerName,
    FlowerPacking: content.FlowerPacking,
    FlowerWeight: content.FlowerWeight,
    Number: content.Number,
    InPrice: content.InPrice,
    OutPrice: content.OutPrice,
  }));

  // 创建 Excel 表
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const filename = `${customName}_${year}-${month}-${day}.xlsx`;
  const fileContent = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // 上传文件到 GitHub
  await uploadToGitHub(fileContent, `DateBase/orders/${filename}`);

  return NextResponse.json({ message: 'File uploaded successfully' });
}