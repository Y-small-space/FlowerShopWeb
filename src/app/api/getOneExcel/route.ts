import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";
import * as XLSX from 'xlsx';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = 'Y-small-space';
const repo = 'FlowerShopWeb';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const filePath = url.searchParams.get('filePath');

  if (!filePath) {
    return NextResponse.json({ error: 'Missing filePath parameter' }, { status: 400 });
  }

  try {
    const { data: fileContent } = await octokit.repos.getContent({
      owner,
      repo,
      path: `/DateBase/orders/${filePath}`,
    });

    const content = Buffer.from(fileContent.content, 'base64');
    const workbook = XLSX.read(content, { type: 'buffer' });
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
      // Optionally remove the original guige_number and guige_currency fields
      guige_number: undefined,
      guige_currency: undefined,
    }));

    console.log('processedData', processedData);

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Error fetching file from GitHub:", error);
    return NextResponse.json({ error: 'Error fetching file from GitHub' }, { status: 500 });
  }
}