"use client";

import { PostGraph } from "@/components/analytics/post-graph";
import { Card, CardHeader, CardDescription, CardTitle } from "@marble/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function PageClient() {
  const params = useParams<{ workspace: string }>();

    const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", params.workspace],
    staleTime: 1000 * 60 * 60, // 1 hour in milliseconds
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) {
        throw new Error(`Failed to fetch analytics: ${res.status}`);
      }
      const data = await res.json();
      return data;
    },
  });

  if (error) {
    return (
      <div className="p-4 flex flex-col flex-1 h-full items-center justify-center">
        <div className="text-red-500">
          Error loading analytics: {error.message}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 flex flex-col flex-1 h-full items-start justify-start">
      <div className=" max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Publishing Activity</CardTitle>
            <CardDescription>
              Your publishing activity over the past year
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <PostGraph data={data?.graph?.activity} isLoading={isLoading} />
          </div>
        </Card>
      </div>
    </div>
  );
}
