import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function Home() {
  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">
          🤖
          <span className="ml-2">
            欢迎使用智能问答助手！我是一个基于大语言模型的AI助手，可以回答您的各类问题。
          </span>
        </li>
        <li className="hidden text-l md:block">
          💡
          <span className="ml-2">
            我可以帮您：解答问题、编写代码、分析数据、撰写文章等。请尽量描述具体的需求，这样我能更好地帮助您。
          </span>
        </li>
        <li>
          📚
          <span className="ml-2">
            我拥有丰富的知识储备，但也会实事求是地告诉您我不确定的事情。
          </span>
        </li>
        <li className="hidden text-l md:block">
          ⚡
          <span className="ml-2">
            为了获得更好的回答，建议您：提供必要的上下文、使用清晰的语言、一次只问一个问题。
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            开始对话吧！试试问我：<code>你能帮我做些什么？</code>
          </span>
        </li>
      </ul>
    </GuideInfoBox>
  );
  return (
    <ChatWindow
      endpoint="api/chat"
      emoji="🤖"
      placeholder="请输入您的问题，我会尽力帮助您..."
      emptyStateComponent={InfoCard}
    />
  );
}
