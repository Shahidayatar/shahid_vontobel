import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CreateAgentPage() {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/agents");
  }, [router]);

  return null;
}
