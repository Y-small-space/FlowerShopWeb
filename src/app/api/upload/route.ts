import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest'; // GitHub API 客户端库
import Busboy from 'busboy'; // 处理 multipart/form-data 数据的库
import JSZip from 'jszip'; // 处理 ZIP 文件的库
import { Readable } from 'stream'; // Node.js 中的 stream 模块，用于处理流数据
import pLimit from 'p-limit'; // 控制并发操作的库

// 创建 Octokit 实例，使用 GitHub Token 进行身份验证
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// 设置并发限制为 1，防止多个请求同时执行
const limit = pLimit(1);

export async function POST(request: NextRequest) {
  // 解析请求体中的 form-data
  const formData = await parseFormData(request);
  // 从 formData 中获取上传的 Excel 文件和 ZIP 文件
  const flowerExcel = formData['flowerExcel'] as { name: string, data: Buffer } | undefined;
  const zipFile: any = formData['zipFile'] as { name: string, data: Buffer } | undefined;

  // 输出文件信息到控制台，方便调试
  console.log('flowerExcel:', flowerExcel);
  console.log('zipFile:', zipFile);

  // 如果文件缺失，返回错误响应
  if (!flowerExcel || !zipFile) {
    return NextResponse.json({ message: 'Missing files' }, { status: 400 });
  }

  try {
    // 确保 flowerExcel 数据是 Buffer 类型
    if (!Buffer.isBuffer(flowerExcel.data)) {
      throw new Error('flowerExcel.data is not a Buffer');
    }

    // 删除 GitHub 中目标目录的所有文件（如有）
    await deleteFilesInDirectory('DateBase/flawers');

    // 上传 Excel 文件到 GitHub 仓库
    const ExcelRes = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Y-small-space', // GitHub 仓库所有者
      repo: 'DB', // GitHub 仓库名称
      path: `DateBase/flawers/flower.xlsx`, // 上传文件的路径
      message: 'Upload flowerExcel', // 提交信息
      content: flowerExcel.data.toString('base64'), // 文件内容以 base64 编码
    });

    console.log('ExcelRes:', ExcelRes);

    // 等待 2 秒，确保删除操作完成
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 使用 JSZip 解压上传的 ZIP 文件
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zipFile.data);

    const uploadPromises: any = [];

    // 遍历 ZIP 文件中的每个文件
    zipData.forEach((relativePath, file) => {
      // 如果是目录或无关文件则跳过
      if (file.dir || relativePath.startsWith('__MACOSX') || relativePath.endsWith('.DS_Store')) {
        return;
      }

      // 上传每个文件到 GitHub，使用并发限制
      uploadPromises.push(limit(async () => {
        // 获取文件的二进制数据
        const fileData = await file.async('nodebuffer');

        // 提取文件夹名称和文件名
        const folderName = relativePath.split('/')[1]; // 获取文件夹名称
        const originalFileName = relativePath.split('/').pop(); // 获取文件名
        const newFileName = `${originalFileName}`; // 生成新的文件名
        const githubPath = `DateBase/flawers/${newFileName}`; // 文件上传到 GitHub 的路径

        try {
          // 上传文件到 GitHub
          await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: 'Y-small-space',
            repo: 'DB',
            path: githubPath,
            message: `Upload ${newFileName}`, // 提交信息
            content: fileData.toString('base64'), // 文件内容以 base64 编码
          });
          console.log('File updated successfully!!!', githubPath);
        } catch (error: any) {
          // 如果发生冲突错误（文件已存在）
          if (error.status === 409) {
            console.error('Conflict error occurred. Retry fetching the latest SHA and updating the file.');
            // 获取已有文件的 SHA 值
            const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
              owner: 'Y-small-space',
              repo: 'DB',
              path: githubPath,
            });
            const existingFileSha: any = (response.data as any).sha;
            // 使用最新的 SHA 值再次尝试更新文件
            await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
              owner: 'Y-small-space',
              repo: 'DB',
              path: githubPath,
              message: `Update ${newFileName}`,
              content: fileData.toString('base64'),
              sha: existingFileSha, // 传递 SHA 值覆盖文件
            });
            console.log('File updated successfully after retry!!!', githubPath);
          }
        }
      }));
    });

    // 执行所有上传操作
    const ZipRes = await Promise.all(uploadPromises);
    console.log('zipRes:', ZipRes);

    // 返回上传成功的响应
    return NextResponse.json({ message: 'Files uploaded successfully' });
  } catch (error: any) {
    // 错误处理
    console.error(error);
    return NextResponse.json({ message: 'Upload failed', error: error.message }, { status: 500 });
  }
}

// 解析 multipart/form-data 数据
async function parseFormData(request: NextRequest) {
  console.log('Starting to parse form data');

  // 创建 busboy 实例，指定 headers
  const busboy = Busboy({ headers: { 'content-type': request.headers.get('content-type') || '' } });
  const formData: { [key: string]: any } = {};

  return new Promise<any>((resolve, reject) => {
    // 监听文件事件
    busboy.on('file', (fieldname: any, file: any, filename: any, encoding: any, mimetype: any) => {
      console.log(`File event: fieldname=${fieldname}, filename=${filename}, encoding=${encoding}, mimetype=${mimetype}`);

      const chunks: any = [];
      file.on('data', (data: any) => {
        console.log(`Received data chunk of size: ${data.length}`);
        chunks.push(data);
      });

      // 文件接收完毕
      file.on('end', () => {
        console.log(`Finished receiving file: ${filename}`);
        const fileData = Buffer.concat(chunks); // 合并所有 Buffer 块
        formData[fieldname] = { name: filename, data: fileData };
      });
    });

    // 监听字段事件
    busboy.on('field', (fieldname, value) => {
      console.log(`Field event: fieldname=${fieldname}, value=${value}`);
      formData[fieldname] = value;
    });

    // 解析结束事件
    busboy.on('finish', () => {
      console.log('Finished parsing form data');
      resolve(formData);
    });

    // 错误事件
    busboy.on('error', (error) => {
      console.error('Error occurred while parsing form data:', error);
      reject(error);
    });

    // 将请求体数据流导入 busboy
    Readable.from(request.body as any).pipe(busboy);
  });
}

// 删除 GitHub 目录中的所有文件
async function deleteFilesInDirectory(directoryPath: string) {
  try {
    // 获取目录下的文件列表
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Y-small-space',
      repo: 'DB',
      path: directoryPath,
    });

    // 如果目录包含文件
    if (Array.isArray(response.data)) {
      for (const file of response.data) {
        if (file.type === 'dir') {
          // 递归删除子目录中的文件
          await deleteFilesInDirectory(file.path);
        } else {
          // 删除文件
          const res = await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
            owner: 'Y-small-space',
            repo: 'DB',
            path: file.path,
            message: `Delete ${file.path}`,
            sha: file.sha, // 提供文件的 SHA 值以便删除
          });
          console.log('DeleteRes:', res);
        }
      }
    }
  } catch (error) {
    // 处理错误
    console.error('Error deleting files:', error);
  }
}