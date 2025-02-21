import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function AgentsPage() {
  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">
          🔍
          <span className="ml-2">
            欢迎使用知识库检索助手！我可以帮您在已上传的文档中快速查找相关信息并给出准确答案。
          </span>
        </li>
        <li className="hidden text-l md:block">
          ⚙️
          <span className="ml-2">工作流程：</span>
          <ul>
            <li className="ml-4">
              1️⃣
              <span className="ml-2">
                首先，我会理解您的问题，并结合上下文将其转化为明确的查询语句
              </span>
            </li>
            <li className="ml-4">
              2️⃣
              <span className="ml-2">
                然后，我会在知识库中检索相关文档，并基于检索结果为您组织完整的答案
              </span>
            </li>
          </ul>
        </li>
        <li>
          📝
          <span className="ml-2">
            使用方法：先上传您想要咨询的文档，然后针对文档内容提出具体问题
          </span>
        </li>
        <li className="hidden text-l md:block">
          💡
          <span className="ml-2">
            小贴士：问题越具体，答案越准确。我只能回答基于已上传文档的内容。
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            开始体验吧！上传文档后，可以尝试提问：<code>这份文档主要讲了什么？</code>
          </span>
        </li>
      </ul>
    </GuideInfoBox>
  );
  return (
    <ChatWindow
      endpoint="api/chat/retrieval"
      emoji="🔍"
      placeholder="请输入您关于文档的问题..."
      emptyStateComponent={InfoCard}
      showIngestForm={true}
    />
  );
}
