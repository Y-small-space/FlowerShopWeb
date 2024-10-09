// backend/api/deleteOrder.ts
import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = 'Y-small-space';
const repo = 'DB';

const deleteFromGitHub = async (path: string) => {
  try {
    const { data: existingFile } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    // 检查 existingFile 是对象且包含 sha 属性
    if (Array.isArray(existingFile)) {
      throw new Error("Path is a directory, not a file.");
    }

    if (existingFile && existingFile.type === "file" && existingFile.sha) {
      // 删除文件
      await octokit.repos.deleteFile({
        owner,
        repo,
        path,
        message: `Delete ${path}`,
        sha: existingFile.sha,
      });
    } else {
      throw new Error("Unable to find the file SHA for deletion.");
    }
  } catch (error) {
    console.error("Error deleting file from GitHub:", error);
    throw error;
  }
};

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const filePath = url.searchParams.get('filePath');

  if (!filePath) {
    return NextResponse.json({ error: 'Missing filePath parameter' }, { status: 400 });
  }
  console.log(filePath);


  try {
    await deleteFromGitHub(`DateBase/orders/${filePath}`);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: 'Error deleting file from GitHub' }, { status: 500 });
  }
}