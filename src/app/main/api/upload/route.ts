import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import Busboy from 'busboy';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function POST(request: NextRequest) {
  const formData = await parseFormData(request);

  const flowerExcel = formData['flowerExcel'] as { name: string, data: Buffer } | undefined;
  const flowerImagesFiles = Object.keys(formData)
    .filter(key => key.startsWith('flowerImagesFiles'))
    .map(key => formData[key] as { name: string, data: Buffer });

  console.log('flowerExcel:', flowerExcel);
  console.log('flowerImagesFiles:', flowerImagesFiles);

  if (!flowerExcel || flowerImagesFiles.length === 0) {
    return NextResponse.json({ message: 'Missing files' }, { status: 400 });
  }

  try {
    if (!Buffer.isBuffer(flowerExcel.data)) {
      throw new Error('flowerExcel.data is not a Buffer');
    }

    const flowerExcelPath = path.join('/tmp', String(flowerExcel.name));
    console.log('flowerExcelPath:', flowerExcelPath);

    await fs.writeFile(flowerExcelPath, flowerExcel.data);

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Y-small-space',
      repo: 'flawer',
      path: `DateBase/flawers/${flowerExcel.name}`,
      message: 'Upload flowerExcel',
      content: flowerExcel.data.toString('base64'),
    });

    for (const file of flowerImagesFiles) {
      if (!Buffer.isBuffer(file.data)) {
        throw new Error('file.data is not a Buffer');
      }

      const filePath = path.join('/tmp', file.name);
      console.log('filePath:', filePath);

      await fs.writeFile(filePath, file.data);

      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: 'Y-small-space',
        repo: 'flawer',
        path: `DateBase/flawers/flowerImages/${file.name}`,
        message: 'Upload flower image',
        content: file.data.toString('base64'),
      });
    }

    return NextResponse.json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Upload failed', error: error.message }, { status: 500 });
  }
}

async function parseFormData(request: NextRequest) {
  const busboy = Busboy({ headers: { 'content-type': request.headers.get('content-type') || '' } });
  const formData: { [key: string]: any } = {};

  return new Promise<any>((resolve, reject) => {
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const chunks: Buffer[] = [];

      file.on('data', (data) => {
        chunks.push(data);
      });

      file.on('end', () => {
        // Convert collected chunks to a Buffer
        const fileData = Buffer.concat(chunks);
        formData[fieldname] = { name: filename, data: fileData };
      });
    });

    busboy.on('finish', () => {
      resolve(formData);
    });

    busboy.on('error', (error) => {
      reject(error);
    });

    Readable.from(request.body as any).pipe(busboy);
  });
}