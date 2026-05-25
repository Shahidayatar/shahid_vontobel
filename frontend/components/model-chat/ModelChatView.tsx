"use client";

import { useMemo, useState } from "react";
import { Loader2, RefreshCcw, Trash } from "lucide-react";
import { useModels } from "@/hooks/use-models";
import { useModelChatHistory, useSendModelMessage } from "@/hooks/use-model-chat";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ModelChatView() {
  const { data: models = [] } = useModels();
  const [modelId, setModelId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const { data: history = [] } = useModelChatHistory(modelId);
  const sendMessage = useSendModelMessage();
  const { modelMessages, setModelMessages, clearModelMessages } = useChatStore();

  const messages = useMemo(() => {
    if (!modelId) {
      return [];
    }
    return modelMessages[modelId] ?? history;
  }, [history, modelId, modelMessages]);

  const submit = async () => {
    if (!prompt || !modelId) {
      return;
    }
    const next = [
      ...messages,
      { id: crypto.randomUUID(), role: "user" as const, content: prompt, createdAt: new Date().toISOString() }
    ];
    setModelMessages(modelId, next);
    setLastPrompt(prompt);
    setPrompt("");
    const assistant = await sendMessage.mutateAsync({ modelId, message: prompt });
    setModelMessages(modelId, [...next, assistant]);
  };

  const regenerate = async () => {
    if (!modelId || !lastPrompt) {
      return;
    }
    const assistant = await sendMessage.mutateAsync({ modelId, message: lastPrompt });
    setModelMessages(modelId, [...messages.filter((m) => m.role === "user"), assistant]);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="h-fit space-y-4">
        <h3 className="text-base font-semibold">Session Controls</h3>
        <Select
          value={modelId}
          onChange={setModelId}
          options={[
            { value: "", label: "Select deployed model" },
            ...models.map((model) => ({ value: model.id, label: `${model.name} (${model.model})` }))
          ]}
        />
        <Button variant="secondary" onClick={() => modelId && clearModelMessages(modelId)} disabled={!modelId}>
          <Trash className="mr-2 h-4 w-4" />
          Clear Chat
        </Button>
        <Button variant="ghost" onClick={regenerate} disabled={!lastPrompt || sendMessage.isPending}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Regenerate Response
        </Button>
      </Card>

      <Card className="space-y-4">
        <div className="h-[420px] space-y-3 overflow-y-auto rounded-xl bg-black/20 p-4">
          {messages.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-slate-300">
              Start a direct model evaluation session to test raw model behavior.
            </p>
          )}
          {messages.map((message) => (
            <div key={message.id} className="rounded-xl bg-white/5 p-3">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">{message.role}</p>
              <Markdown content={message.content} />
              {message.usage && (
                <p className="mt-2 text-xs text-slate-400">
                  Tokens: {message.usage.promptTokens + message.usage.completionTokens} | Latency: {message.usage.latencyMs}ms
                </p>
              )}
            </div>
          ))}
          {sendMessage.isPending && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Streaming response...
            </div>
          )}
        </div>
        <div className="space-y-3">
          <Textarea
            placeholder="Ask the selected model anything..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={!prompt || !modelId || sendMessage.isPending}>
              Send Message
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
