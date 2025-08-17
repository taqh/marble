import { db } from "@marble/db";
import { getServerSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionData = await getServerSession();

  if (!sessionData) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const posts = await db.post.findMany({
    where: {
      workspaceId: sessionData.session?.activeOrganizationId as string,
      status: 'published',
      publishedAt: {
        gte: oneYearAgo,
      },
    },
    select: {
      publishedAt: true,
    },
    orderBy: {
      publishedAt: 'asc',
    },
  });

  if (!posts || posts.length === 0) {
    return NextResponse.json({ graph: { activity: [] } }, { status: 200 });
  }

  const dateCountMap = new Map<string, number>();
  
  for (const post of posts) {
    const date = post.publishedAt.toISOString().split('T')[0];
    dateCountMap.set(date, (dateCountMap.get(date) || 0) + 1);
  }

  const activityData = Array.from(dateCountMap.entries()).map(([date, count]) => {
    let level: number;
    if (count === 1) level = 1;
    else if (count <= 3) level = 2;
    else if (count <= 6) level = 3;
    else level = 4;

    return {
      date,
      count,
      level,
    };
  });

  return NextResponse.json({
    graph: {
      activity: activityData,
    },
  });
}