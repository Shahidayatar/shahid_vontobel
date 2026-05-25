"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAgents, useCreateAgent } from "@/hooks/use-agents";
import { useModels } from "@/hooks/use-models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function AgentsView() {
  const { data: agents = [] } = useAgents();
  const { data: models = [] } = useModels();
  const createAgent = useCreateAgent();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [modelDeploymentId, setModelDeploymentId] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.4);
  const [retrievalEnabled, setRetrievalEnabled] = useState(true);

  const submit = async () => {
    await createAgent.mutateAsync({
      name,
      description,
      modelDeploymentId,
      systemPrompt,
      temperature,
      retrievalEnabled
    });
    setOpen(false);
    setName("");
    setDescription("");
    setSystemPrompt("");
    setModelDeploymentId("");
    setTemperature(0.4);
    setRetrievalEnabled(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {agents.map((agent) => (
          <Card key={agent.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{agent.name}</h3>
              <Badge label={agent.status} tone={agent.status === "active" ? "success" : "warning"} />
            </div>
            <p className="text-sm text-slate-300">{agent.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <p>Model: {agent.modelDeploymentId}</p>
              <p>Temperature: {agent.temperature.toFixed(2)}</p>
              <p>Retrieval: {agent.retrievalEnabled ? "Enabled" : "Disabled"}</p>
              <p>Created: {new Date(agent.createdAt).toLocaleDateString()}</p>
            </div>
          </Card>
        ))}
      </div>
      {agents.length === 0 && (
        <Card className="text-center text-sm text-slate-300">No agents found. Create an enterprise assistant to begin.</Card>
      )}

      <Modal open={open} title="Create Agent" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Input placeholder="Agent name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input
            placeholder="Short description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Select
            value={modelDeploymentId}
            onChange={setModelDeploymentId}
            options={[
              { value: "", label: "Select model deployment" },
              ...models.map((model) => ({ value: model.id, label: model.name }))
            ]}
          />
          <Textarea
            placeholder="System prompt"
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
          />
          <div>
            <p className="mb-1 text-xs text-slate-300">Temperature: {temperature.toFixed(2)}</p>
            <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.05} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
            <div>
              <p className="text-sm font-medium">Retrieval</p>
              <p className="text-xs text-slate-400">Enable Azure AI Search context grounding</p>
            </div>
            <Switch checked={retrievalEnabled} onCheckedChange={setRetrievalEnabled} />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={submit}
              disabled={!name || !description || !modelDeploymentId || !systemPrompt || createAgent.isPending}
            >
              {createAgent.isPending ? "Creating..." : "Create Agent"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
