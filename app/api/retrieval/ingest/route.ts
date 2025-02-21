import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { Milvus } from "@langchain/community/vectorstores/milvus";
import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { OllamaEmbeddings } from "@langchain/ollama";
// export const runtime = "edge";

// Before running, follow set-up instructions at
// https://js.langchain.com/v0.2/docs/integrations/vectorstores/supabase

/**
 * This handler takes input text, splits it into chunks, and embeds those chunks
 * into a vector store for later retrieval. See the following docs for more information:
 *
 * https://js.langchain.com/v0.2/docs/how_to/recursive_text_splitter
 * https://js.langchain.com/v0.2/docs/integrations/vectorstores/supabase
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;

  if (process.env.NEXT_PUBLIC_DEMO === "true") {
    return NextResponse.json(
      {
        error: [
          "Ingest is not supported in demo mode.",
          "Please set up your own version of the repo here: https://github.com/langchain-ai/langchain-nextjs-template",
        ].join("\n"),
      },
      { status: 403 },
    );
  }

  try {



    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 256,
      chunkOverlap: 20,
    });

    const splitDocuments = await splitter.createDocuments([text]);


    const embeddings = new OllamaEmbeddings({
      model: process.env.OLLAMA_MODEL!,
      baseUrl: process.env.OLLAMA_BASE_URL!,
    });

    const vectorstore = await Milvus.fromTexts(
      [""],
      [""],
      embeddings,
      {
        collectionName: "test",
        vectorField: 'vectors',
        clientConfig: {
          address: process.env.MILVUS_ADDRESS!,
        },
      }
    );





    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
