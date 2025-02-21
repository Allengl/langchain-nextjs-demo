import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { Milvus } from "@langchain/community/vectorstores/milvus";
import { ChatDeepSeek } from "@langchain/deepseek";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import { BytesOutputParser, StringOutputParser } from "@langchain/core/output_parsers";

// 环境变量检查
const validateEnvironmentVariables = () => {
  const requiredEnvVars = ["OLLAMA_MODEL", "OLLAMA_BASE_URL", "MILVUS_ADDRESS"];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  }
};

// 格式化对话历史
const formatVercelMessages = (chatHistory: VercelChatMessage[]): string => {
  return chatHistory
    .map((message) => {
      if (message.role === "user") return `Human: ${message.content}`;
      if (message.role === "assistant") return `Assistant: ${message.content}`;
      return `${message.role}: ${message.content}`;
    })
    .join("\n");
};

// 合并文档内容
const combineDocumentsFn = (docs: Document[]): string => {
  return docs.map((doc) => doc.pageContent).join("\n\n");
};

// 初始化向量存储
const initializeVectorStore = async () => {
  const embeddings = new OllamaEmbeddings({
    model: process.env.OLLAMA_MODEL!,
    baseUrl: process.env.OLLAMA_BASE_URL!,
  });

  return Milvus.fromExistingCollection(embeddings, {
    collectionName: "test",
    vectorField: "vectors",
    clientConfig: {
      address: process.env.MILVUS_ADDRESS!,
    },
    indexCreateOptions: {
      metric_type: "COSINE",
      index_type: "HNSW",
    },

  });
};

// 初始化模型
const initializeModel = () => {
  return new ChatDeepSeek({
    model: "deepseek-chat",
    temperature: 0.2,
  });
};

// 定义提示模板
const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;
const condenseQuestionPrompt = PromptTemplate.fromTemplate(CONDENSE_QUESTION_TEMPLATE);

const ANSWER_TEMPLATE = `
用户：你是一个有用的助手。请使用以下内容作为你学到的知识，放在<context></context> XML标签中。  
当回答用户时：  
- 如果你不知道，就直接说你不知道。  
- 如果你不确定，请请求澄清。  
- 避免提及你从上下文中获取了信息。  
- 根据用户问题的语言进行回答。  
- 仅基于以下上下文和聊天历史回答问题。
<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

// 主处理函数
export async function POST(req: NextRequest) {
  try {
    validateEnvironmentVariables();

    const body = await req.json();
    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const model = initializeModel();
    const vectorstore = await initializeVectorStore();

    // 定义独立问题链
    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      model,
      new StringOutputParser(),
    ]);

    // 定义检索链
    const retriever = vectorstore.asRetriever({
      searchType: "similarity",
      k: 4,
      filter: "",
    });

    const retrievalChain = retriever.pipe(combineDocumentsFn);

    // 定义回答链
    const answerChain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          (input) => input.question,
          retrievalChain,
        ]),
        chat_history: (input) => input.chat_history,
        question: (input) => input.question,
      },
      answerPrompt,
      model,
    ]);

    // 组合完整链
    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: standaloneQuestionChain,
        chat_history: (input) => input.chat_history,
      },
      answerChain,
      new BytesOutputParser(),
    ]);

    // 执行链并获取流式响应
    const stream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: formatVercelMessages(previousMessages),
    });

    return new StreamingTextResponse(stream, {
      headers: {
        "x-message-index": (previousMessages.length + 1).toString(),
      },
    });
  } catch (error: any) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
