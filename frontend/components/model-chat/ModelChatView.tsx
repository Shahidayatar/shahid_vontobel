"use client";

import { useMemo, useState } from "react";
import { Loader2, Paperclip, RefreshCcw, Send, Sparkles, Trash } from "lucide-react";
import { useModels } from "@/hooks/use-models";
import { useModelChatHistory, useSendModelMessage } from "@/hooks/use-model-chat";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-5xl flex-col gap-5">
      <Card className="border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
              <Sparkles className="h-3.5 w-3.5" />
              Live model lab
            </p>
            <h3 className="text-lg font-semibold text-white">Test deployed models in a Gemini-style workspace</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={regenerate} disabled={!lastPrompt || sendMessage.isPending}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
            <Button variant="secondary" onClick={() => modelId && clearModelMessages(modelId)} disabled={!modelId}>
              <Trash className="mr-2 h-4 w-4" />
              Clear chat
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Deployment</p>
            <Select
              value={modelId}
              onChange={setModelId}
              options={[
                { value: "", label: "Select deployed model" },
                ...models.map((model) => ({ value: model.id, label: `${model.name} (${model.model})` }))
              ]}
            />
          </div>
          <div className="text-right text-xs text-slate-400 lg:pb-1">Messages stay local to the selected deployment.</div>
        </div>
      </Card>

      <div className="grid flex-1 gap-5 lg:grid-rows-[1fr_auto]">
        <Card className="min-h-[34rem] overflow-hidden border-white/10 bg-black/20 p-0 shadow-[0_20px_80px_rgba(0,0,0,0.2)]">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-sm font-medium text-slate-200">Conversation</p>
              <p className="text-xs text-slate-400">Ask a question and compare model behavior directly.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-10 text-center">
                    <p className="text-lg font-medium text-white">What’s next, Shahid?</p>
                    <p className="mt-2 text-sm text-slate-400">
                      Select a deployment, then start a model evaluation session with the composer below.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isAssistant = message.role === "assistant";
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isAssistant ? "justify-start" : "justify-end"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[92%] rounded-3xl border px-4 py-3 shadow-lg md:max-w-[85%]",
                            isAssistant
                              ? "border-white/10 bg-white/5 text-slate-100"
                              : "border-cyan-300/10 bg-cyan-400/10 text-white"
                          )}
                        >
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            {isAssistant ? "Assistant" : "You"}
                          </p>
                          <Markdown content={message.content} />
                          {message.usage && (
                            <p className="mt-3 text-[11px] text-slate-400">
                              Tokens: {message.usage.promptTokens + message.usage.completionTokens} | Latency: {message.usage.latencyMs}ms
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {sendMessage.isPending && (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Streaming response...
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-white/5 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
              <span>Compose</span>
              <span>Shift + Enter for a new line</span>
            </div>
            <div className="flex items-end gap-3 rounded-[2rem] border border-white/10 bg-black/20 px-4 py-3">
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled
                aria-label="Attach file"
                title="File upload coming soon"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <Textarea
                placeholder={modelId ? "Ask the selected model anything..." : "Select a deployed model to start chatting..."}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                className="min-h-[64px] flex-1 resize-none border-0 bg-transparent px-0 py-2 text-base shadow-none placeholder:text-slate-500 focus-visible:ring-0"
                disabled={!modelId || sendMessage.isPending}
              />
              <Button
                onClick={submit}
                disabled={!prompt || !modelId || sendMessage.isPending}
                className="h-11 rounded-full px-5"
              >
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
            <p className="px-2 text-xs text-slate-500">
              Attachments are not enabled yet, so chat behavior stays unchanged while the UI is upgraded.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
