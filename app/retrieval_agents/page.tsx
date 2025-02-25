import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function AgentsPage() {
  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">
          🤖
          <span className="ml-2">
            欢迎使用智能检索助手！我可以帮您在知识库中查找信息，并结合上下文进行对话。
          </span>
        </li>
        <li className="hidden text-l md:block">
          🛠️
          <span className="ml-2">
            我配备了向量检索工具和对话记忆功能，特别擅长回答关于当前对话的元问题。
          </span>
        </li>
        <li>
          💡
          <span className="ml-2">
            使用建议：先上传一些文档，然后您可以针对文档内容提出问题，我会帮您找到相关信息。
          </span>
        </li>
        <li className="hidden text-l md:block">
          📚
          <span className="ml-2">
            我会记住我们的对话内容，您可以基于之前的讨论继续提问。
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            开始体验吧！上传文档后，试试问我：<code>这份文档主要讲了什么？</code>
          </span>
        </li>
      </ul>
    </GuideInfoBox>
  );

  return (
    <ChatWindow
      endpoint="api/chat/retrieval_agents"
      emptyStateComponent={InfoCard}
      showIngestForm={true}
      showIntermediateStepsToggle={true}
      placeholder="请输入您的问题，我会帮您在文档中查找相关信息..."
      emoji="🤖"
    />
  );
}
