import { mockTasks } from "~~/data/mockData";
import TaskDetailsClient from "./TaskDetailsClient";

// 添加generateStaticParams函数
export function generateStaticParams() {
  return mockTasks.map(task => ({
    id: task.id,
  }));
}

// 创建一个服务器组件作为页面入口
export default function TaskPage({ params }: { params: { id: string } }) {
  return <TaskDetailsClient id={params.id} />;
} 