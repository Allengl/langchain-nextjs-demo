import { cn } from "@/utils/cn";
import type { Message } from "ai/react";


export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources: any[];
}) {
  return (
    <div
      className={cn(
        `rounded-[24px] max-w-[80%] mb-8 flex`,
        props.message.role === "user"
          ? "bg-secondary text-secondary-foreground px-4 py-2"
          : null,
        // 修改对齐方式判断逻辑
        props.message.role === "user" ? "ml-auto" : "mr-auto bg-white"
      )}
    >
      {/* AI头像始终显示在左侧 */}
      {props.message.role !== "user" && (
        <div className="mr-4 border bg-secondary -mt-2 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
          {props.aiEmoji}
        </div>
      )}

      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>

        {/* 仅在AI消息显示来源 */}
        {props.message.role !== "user" && props.sources && props.sources.length ? (
          <div className="mt-4 border-t border-gray-200 pt-4 text-left"> {/* 强制左对齐 */}
            <h2 className="text-sm font-medium text-gray-500 mb-2">📎 参考来源:</h2>
            <div className="space-y-2">
              {props.sources?.map((source, i) => (
                <div key={`source-${i}`} className="text-sm text-gray-600">
                  <a
                    href={source.metadata?.fileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span>📄</span>
                    <span>{source.metadata?.fileName || "未命名文档"}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
