import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";
import * as XLSX from "xlsx";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = 'Y-small-space';
const repo = 'DB';

const uploadToGitHub = async (content: any, path: string) => {
  try {
    const { data: existingFile } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

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

  const orders = formValue.Order || [];

  const customFee = parseFloat(formValue.customFee) || 0;
  const shippingFee = parseFloat(formValue.shippingFee) || 0;
  const packagingFee = parseFloat(formValue.packagingFee) || 0;
  const certificateFee = parseFloat(formValue.certificateFee) || 0;
  const fumigationFee = parseFloat(formValue.fumigationFee) || 0;

  const totalMiscFee = customFee + shippingFee + packagingFee + certificateFee + fumigationFee;

  const totalNumber = orders.reduce(
    (acc: number, curr: any) => acc + (curr?.Number ?? 0),
    0
  );

  const summary = {
    CustomFee: customFee.toFixed(2),
    ShippingFee: shippingFee.toFixed(2),
    PackagingFee: packagingFee.toFixed(2),
    CertificateFee: certificateFee.toFixed(2),
    FumigationFee: fumigationFee.toFixed(2),
    TotalMiscFee: totalMiscFee.toFixed(2),
    TotalNumber: totalNumber,
    Money: formValue.money
  };

  // 将订单数据和汇总信息转换为行数据
  const rows = orders.map((order: any) => ({
    PackageID: order.PackageID,
    FlowerSpecies: order.FlowerSpecies,
    FlowerName: order.FlowerName,
    FlowerPacking: order.FlowerPacking,
    FlowerWeight: order.FlowerWeight,
    Number: order.Number,
    InPrice: order.InPrice,
    OutPrice: order.OutPrice,
    Amount: order.Amount,
    TotalWeight: order.TotalWeight,
    AdjustedPrice: order.AdjustedPrice,
    TotalPrice: order.TotalPrice
  }));

  // 创建 Excel 表
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const summaryWorksheet = XLSX.utils.json_to_sheet([summary], { header: Object.keys(summary) });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

  const filename = `${customName}_${year}-${month}-${day}.xlsx`;
  const fileContent = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  await uploadToGitHub(fileContent, `DateBase/orders/${filename}`);

  return NextResponse.json({ message: 'File uploaded successfully' });
}