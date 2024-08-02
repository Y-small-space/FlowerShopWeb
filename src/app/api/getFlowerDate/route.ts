import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function GET() {
  const fileUrl = 'https://raw.githubusercontent.com/username/repository/branch/filename.ext';

  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Y-small-space',
      repo: 'FlowerShopWeb',
      path: `DateBase/flawers/flower.xlsx`,
    })

    return ''
  } catch (error: any) {
    return NextResponse.json({ error: `Error: ${error.message}` }, { status: 500 });
  }
}