import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";
import * as XLSX from 'xlsx';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = 'Y-small-space';
const repo = 'DB';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const filePath = url.searchParams.get('filePath');

  if (!filePath) {
    return NextResponse.json({ error: 'Missing filePath parameter' }, { status: 400 });
  }

  try {
    const response: any = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: `/DateBase/orders/${filePath}`,
    });

    if (Array.isArray(response.data)) {
      throw new Error("Path is a directory or invalid.");
    }

    const { content } = response.data;
    if (!content) {
      throw new Error("File content not found.");
    }

    const fileContent = Buffer.from(content, 'base64');
    const workbook = XLSX.read(fileContent, { type: 'buffer' });

    const orderSheet = workbook.Sheets['Orders'];
    const summarySheet = workbook.Sheets['Summary'];

    if (!orderSheet) {
      throw new Error("Orders sheet not found.");
    }

    const jsonData = XLSX.utils.sheet_to_json(orderSheet);
    const summaryData = summarySheet ? XLSX.utils.sheet_to_json(summarySheet) : [];

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

    return NextResponse.json({
      orders: processedData,
      summary: summaryData[0] || {}
    });
  } catch (error) {
    console.error("Error fetching file from GitHub:", error);
    return NextResponse.json({ error: 'Error fetching file from GitHub' }, { status: 500 });
  }
}