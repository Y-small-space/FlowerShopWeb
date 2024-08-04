import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import Busboy from 'busboy';
import JSZip from 'jszip';
import { Readable } from 'stream';
import pLimit from 'p-limit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const limit = pLimit(1); // 设置并发限制为 5

export async function POST(request: NextRequest) {
  console.log('====================================');
  console.log(process.env.GITHUB_TOKEN);
  console.log('====================================');
  const formData = await parseFormData(request);
  const flowerExcel = formData['flowerExcel'] as { name: string, data: Buffer } | undefined;
  const zipFile = formData['zipFile'] as { name: string, data: Buffer } | undefined;

  console.log('flowerExcel:', flowerExcel);
  console.log('zipFile:', zipFile);

  if (!flowerExcel || !zipFile) {
    return NextResponse.json({ message: 'Missing files' }, { status: 400 });
  }

  try {
    if (!Buffer.isBuffer(flowerExcel.data)) {
      throw new Error('flowerExcel.data is not a Buffer');
    }

    await deleteFilesInDirectory('DateBase/flawers');

    const ExcelRes = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Y-small-space',
      repo: 'FlowerShopWeb',
      path: `DateBase/flawers/flower.xlsx`,
      message: 'Upload flowerExcel',
      content: flowerExcel.data.toString('base64'),
    });

    console.log('====================================');
    console.log("ExcelRes:", ExcelRes);
    console.log('====================================');

    // 解压缩 zipFile
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zipFile.data);

    const uploadPromises: any = [];

    zipData.forEach((relativePath, file) => {
      if (file.dir || relativePath.startsWith('__MACOSX') || relativePath.endsWith('.DS_Store')) {
        return;
      }

      uploadPromises.push(limit(async () => {
        const fileData = await file.async('nodebuffer');
        const githubPath = `DateBase/flawers/flowerImages${relativePath}`;
        console.log('====================================');
        console.log(githubPath);
        console.log('====================================');
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
          owner: 'Y-small-space',
          repo: 'FlowerShopWeb',
          path: githubPath,
          message: `Upload ${relativePath}`,
          content: fileData.toString('base64'),
        });
      }));
    });

    const ZipRes = await Promise.all(uploadPromises);
    console.log('====================================');
    console.log("zigRes:", ZipRes);
    console.log('====================================');

    return NextResponse.json({ message: 'Files uploaded successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Upload failed', error: error.message }, { status: 500 });
  }
}

async function parseFormData(request: NextRequest) {
  console.log('Starting to parse form data');

  const busboy = Busboy({ headers: { 'content-type': request.headers.get('content-type') || '' } });
  const formData: { [key: string]: any } = {};

  return new Promise<any>((resolve, reject) => {
    busboy.on('file', (fieldname: any, file: any, filename: any, encoding: any, mimetype: any) => {
      console.log(`File event: fieldname=${fieldname}, filename=${filename}, encoding=${encoding}, mimetype=${mimetype}`);

      const chunks: Buffer[] = [];
      file.on('data', (data: any) => {
        console.log(`Received data chunk of size: ${data.length}`);
        chunks.push(data);
      });

      file.on('end', () => {
        console.log(`Finished receiving file: ${filename}`);
        const fileData = Buffer.concat(chunks);
        formData[fieldname] = { name: filename, data: fileData };
      });
    });

    busboy.on('field', (fieldname, value) => {
      console.log(`Field event: fieldname=${fieldname}, value=${value}`);
      formData[fieldname] = value;
    });

    busboy.on('finish', () => {
      console.log('Finished parsing form data');
      resolve(formData);
    });

    busboy.on('error', (error) => {
      console.error('Error occurred while parsing form data:', error);
      reject(error);
    });

    Readable.from(request.body as any).pipe(busboy);
  });
}

async function deleteFilesInDirectory(directoryPath: string) {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Y-small-space',
      repo: 'FlowerShopWeb',
      path: directoryPath,
    });

    if (Array.isArray(response.data)) {
      for (const file of response.data) {
        if (file.type === 'dir') {
          // 递归删除子目录
          await deleteFilesInDirectory(file.path);
        } else {
          // 删除文件
          const res = await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
            owner: 'Y-small-space',
            repo: 'FlowerShopWeb',
            path: file.path,
            message: `Delete ${file.path}`,
            sha: file.sha,
          });
          console.log('====================================');
          console.log('DeleteRes:', res);
          console.log('====================================');
        }
      }
    }
  } catch (error) {
    console.error('Error deleting files:', error);
  }
}