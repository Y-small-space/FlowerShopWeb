import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import * as XLSX from 'xlsx';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function GET() {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Y-small-space',
      repo: 'FlowerShopWeb',
      path: 'DateBase/flawers/flower.xlsx',
    });

    // 解码 base64 内容
    const fileContent = Buffer.from(response.data.content, 'base64');

    // 解析 Excel 文件
    const workbook = XLSX.read(fileContent, { type: 'buffer' });

    // 获取所有工作表的数据
    const jsonData = parseExcelToJSON(workbook);

    console.log('====================================');
    console.log('flowerDate:', jsonData);
    console.log('====================================');

    return NextResponse.json(jsonData);
  } catch (error: any) {
    return NextResponse.json({ error: `错误: ${error.message}` }, { status: 500 });
  }
}

function parseExcelToJSON(workbook: XLSX.WorkBook) {
  const result: { [sheetName: string]: any[] } = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    result[sheetName] = XLSX.utils.sheet_to_json(sheet);
  });

  return result;
}