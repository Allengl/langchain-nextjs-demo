import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { put } from '@vercel/blob';

// export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. 上传文件到 Vercel Blob
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { url: fileUrl } = await put(file.name, fileBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log("File uploaded to Blob:", fileUrl);

    // 2. 根据文件类型创建加载器
    let loader;
    const fileBlob = new Blob([fileBuffer], { type: file.type });

    if (file.name.endsWith('.pdf')) {
      loader = new PDFLoader(fileBlob);
    } else if (file.name.endsWith('.docx')) {
      loader = new DocxLoader(fileBlob);
    } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      loader = new TextLoader(fileBlob);
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // 3. 加载文档内容
    const docs = await loader.load();



    // 5. 分割文档
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 256,
      chunkOverlap: 20,
    });

    const splitDocuments = await splitter.splitDocuments(docs);

    // 4. 添加文件 URL 到元数据
    splitDocuments.forEach(doc => {
      doc.metadata.fileLink = fileUrl;
      doc.metadata.fileName = file.name;
    });

    // 6. 初始化 Pinecone
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const pineconeIndex = client.Index("demo");

    // 7. 创建嵌入
    const embeddings = new OllamaEmbeddings({
      model: process.env.OLLAMA_MODEL!,
      baseUrl: process.env.OLLAMA_BASE_URL!,
    });

    // 8. 存储到向量数据库（包含文件 URL）
    const vectorStore = await PineconeStore.fromDocuments(
      splitDocuments,
      embeddings,
      {
        // @ts-ignore
        pineconeIndex: pineconeIndex,
      },

    );

    console.log("Vector store created with file URLs");

    return NextResponse.json({ ok: true, fileUrl }, { status: 200 });
  } catch (e: any) {
    console.error("Error processing file:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
