// This is a Server Component (no "use client" directive)
import { TaskDetailsClient } from "./TaskDetailsClient";

// Add generateStaticParams for static site generation with App Router
export async function generateStaticParams() {
  // Replace this with actual task IDs from your data source
  // This ensures these paths are pre-rendered at build time
  return [
    { id: "1", taskId: "1" },
    { id: "1", taskId: "2" },
    { id: "2", taskId: "1" },
  ];
}

export default function TaskPage({ params }: { params: { id: string; taskId: string } }) {
  return <TaskDetailsClient projectId={params.id} taskId={params.taskId} />;
} 