"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCreateModel, useDeleteModel, useModels } from "@/hooks/use-models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { ModelType } from "@/types/domain";

const modelOptions: Array<{ value: ModelType; label: string }> = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "text-embedding-3-large", label: "Text Embedding 3 Large" }
];

const regionOptions = [
  { value: "swedencentral", label: "Sweden Central" },
  { value: "eastus2", label: "East US 2" }
];

export function ModelsView() {
  const { data: models = [] } = useModels();
  const createModel = useCreateModel();
  const deleteModel = useDeleteModel();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [model, setModel] = useState<ModelType>("gpt-4o");
  const [region, setRegion] = useState("swedencentral");

  const submit = async () => {
    await createModel.mutateAsync({ name, model, region });
    setName("");
    setModel("gpt-4o");
    setRegion("swedencentral");
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Deploy Model
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {models.map((deployment) => (
          <Card key={deployment.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{deployment.name}</h3>
                <p className="text-xs text-slate-300">{deployment.model}</p>
              </div>
              <Badge
                label={deployment.health}
                tone={deployment.health === "healthy" ? "success" : deployment.health === "degraded" ? "warning" : "danger"}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
              <p>Status: {deployment.status}</p>
              <p>Region: {deployment.region}</p>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => deleteModel.mutate(deployment.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {models.length === 0 && (
        <Card className="text-center">
          <p className="text-sm text-slate-300">No deployments yet. Deploy your first GPT model to start testing.</p>
        </Card>
      )}

      <Modal open={open} title="Deploy New Model" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <Input placeholder="Deployment name" value={name} onChange={(event) => setName(event.target.value)} />
          <Select value={model} onChange={(value) => setModel(value as ModelType)} options={modelOptions} />
          <Select value={region} onChange={setRegion} options={regionOptions} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!name || createModel.isPending}>
              {createModel.isPending ? "Deploying..." : "Deploy"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
