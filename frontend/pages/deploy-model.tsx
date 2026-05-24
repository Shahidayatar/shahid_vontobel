import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DeployModelPage() {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/model-catalog");
  }, [router]);

  return null;
}