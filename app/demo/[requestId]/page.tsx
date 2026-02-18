import { RequestStatusWorkspace } from "@/components/demo/request-status-workspace";

type PageProps = {
  params: Promise<{ requestId: string }>;
};

export default async function RequestPage({ params }: PageProps) {
  const { requestId } = await params;
  return <RequestStatusWorkspace requestId={requestId} />;
}
