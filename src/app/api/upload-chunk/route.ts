import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from "crypto";


// 上传目录
const uploadDir = path.join(process.cwd(), 'uploads');

// 确保 uploads 目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function calculateHash(chunk) {
  const hash = crypto.createHash("sha256"); // 使用 sha256 哈希算法
  hash.update(chunk); // 传入切片数据
  return hash.digest("hex"); // 返回计算出的哈希值，使用 'hex' 编码格式
}

// 处理上传的切片
export async function POST(req) {
  try {
    const buffer = await req.arrayBuffer(); // 获取上传的二进制数据
    const chunkData = Buffer.from(buffer);

    const index = parseInt(req.headers.get('X-Index') || '0');
    const totalChunks = parseInt(req.headers.get('X-TotalChunks') || '0');
    const chunkHash = req.headers.get('X-Chunk-Hash');

    console.log(index);
    // console.log(chunkHash);
    console.log(calculateHash(chunkData));


    if (index < 0 || index >= totalChunks) {
      throw new Error(`Invalid chunk index: ${index}`);
    }

    const chunkFilePath = path.join(uploadDir, `chunk_${index}`);
    await fs.promises.writeFile(chunkFilePath, chunkData);

    if (index === totalChunks - 1) {
      await mergeChunks(totalChunks);
    }

    return NextResponse.json({ message: 'Chunk uploaded successfully' });
  } catch (error) {
    console.error('Error during chunk upload:', error);
    return NextResponse.json({ message: 'Upload failed', error: error.message }, { status: 500 });
  }
}

// 合并所有切片
async function mergeChunks(totalChunks) {
  const outputFilePath = path.join(uploadDir, `图片库.zip`);

  const writeStream = fs.createWriteStream(outputFilePath);

  try {
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(uploadDir, `chunk_${i}`);

      if (!fs.existsSync(chunkPath)) {
        throw new Error(`Chunk ${i} is missing`);
      }

      const chunkData = await fs.promises.readFile(chunkPath);
      writeStream.write(chunkData);
      await fs.promises.unlink(chunkPath);
    }

    writeStream.end();
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log(`All chunks merged into ${outputFilePath}`);
  } catch (err) {
    console.error('Error during chunk merge:', err);
    writeStream.end();
    throw err;
  }
}