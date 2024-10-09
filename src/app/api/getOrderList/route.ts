import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = 'Y-small-space';
const repo = 'DB';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const directory = url.searchParams.get('directory');

  if (!directory) {
    return NextResponse.json({ error: 'Missing directory parameter' }, { status: 400 });
  }

  try {
    const { data: files } = await octokit.repos.getContent({
      owner,
      repo,
      path: directory,
    });
    if (!Array.isArray(files)) return;
    const fileNames = files
      .filter((file: any) => file.type === 'file' && file.name.endsWith('.xlsx'))
      .map((file: any) => file.name);

    return NextResponse.json(fileNames);
  } catch (error) {
    console.error("Error fetching files from GitHub:", error);
    return NextResponse.json({ error: 'Error fetching files from GitHub' }, { status: 500 });
  }
}