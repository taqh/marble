"use server";

import { randomBytes } from "node:crypto";
import { db } from "@marble/db";
import { getServerSession } from "@/lib/auth/session";

/**
 * Check if a category slug is taken
 * @param slug - The slug of the category to check
 * @param workspaceId - The id of the workspace
 * @returns True if the slug is taken, false otherwise
 */
export async function checkCategorySlugAction(
  slug: string,
  workspaceId: string,
) {
  const result = await db.category.findFirst({
    where: { workspaceId: workspaceId, slug: slug },
  });

  return !!result;
}

/**
 * Check if a category slug is taken for update
 * @param slug - The slug of the category to check
 * @param workspaceId - The id of the workspace
 * @param currentCategoryId - The id of the current category
 * @returns True if the slug is taken, false otherwise
 */
export async function checkCategorySlugForUpdateAction(
  slug: string,
  workspaceId: string,
  currentCategoryId: string,
) {
  const result = await db.category.findFirst({
    where: {
      workspaceId: workspaceId,
      slug: slug,
      NOT: {
        id: currentCategoryId,
      },
    },
  });

  return !!result;
}

export async function checkTagSlugAction(slug: string, workspaceId: string) {
  const result = await db.tag.findFirst({
    where: { workspaceId: workspaceId, slug: slug },
  });

  return !!result;
}

export async function checkTagSlugForUpdateAction(
  slug: string,
  workspaceId: string,
  currentTagId: string,
) {
  const result = await db.tag.findFirst({
    where: {
      workspaceId: workspaceId,
      slug: slug,
      NOT: {
        id: currentTagId,
      },
    },
  });

  return !!result;
}

/**
 * Verify an invite
 * @param inviteId - The invite ID
 * @returns The invite email
 */
export async function verifyInvite(inviteId: string) {
  const session = await getServerSession();
  const invite = await db.invitation.findUnique({
    where: { id: inviteId, email: session?.user.email },
    select: { email: true, status: true, expiresAt: true },
  });

  if (!invite) {
    throw new Error("Invite not found");
  }

  if (invite.status !== "pending") {
    throw new Error("Invite is no longer valid");
  }

  if (invite.expiresAt < new Date()) {
    throw new Error("Invite has expired");
  }

  return invite.email;
}

/**
 * Generate a secure webhook secret (server action)
 * @returns The webhook secret
 */
export const generateWebhookSecretAction = async () => {
  try {
    const secret = randomBytes(32).toString("hex");
    return { success: true, secret };
  } catch (error) {
    console.error("Failed to generate webhook secret:", error);
    return { success: false, secret: null };
  }
};

export async function checkWorkspaceSlug(
  slug: string,
  currentWorkspaceId?: string,
) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const workspace = await db.organization.findFirst({
    where: {
      slug,
      NOT: currentWorkspaceId ? { id: currentWorkspaceId } : undefined,
    },
  });

  return !!workspace; // Return true if slug is in use (workspace found)
}
