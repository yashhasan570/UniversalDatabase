import { WorkspaceUserRoles } from 'universaldatabase-sdk';
import { Logger } from '@nestjs/common';
import type { User } from '~/models';
import {
  MetaTable,
  NC_STORE_DEFAULT_WORKSPACE_ID_KEY,
  RootScopes,
} from '~/utils/globals';
import { isOnPrem } from '~/utils';
import UniversalDatabase from '~/UniversalDatabase';
import WorkspaceUser from '~/models/WorkspaceUser';

const logger = new Logger('verifyDefaultWorkspace');

export const verifyDefaultWorkspace = async (
  user?: User,
  ncMeta = UniversalDatabase.ncMeta,
) => {
  // Skip for cloud/pure EE — they manage workspaces via EE service.
  // On-prem always needs a default workspace regardless of license state.
  if (UniversalDatabase.isEE() && !isOnPrem) {
    return;
  }

  // if ws id exists, return
  if (UniversalDatabase.ncDefaultWorkspaceId) {
    return;
  }
  const ncDefaultWorkspaceId = await ncMeta.metaGet(
    RootScopes.ROOT,
    RootScopes.ROOT,
    MetaTable.STORE,
    {
      key: NC_STORE_DEFAULT_WORKSPACE_ID_KEY,
    },
  );
  // if store has default ws id, we use that
  if (ncDefaultWorkspaceId?.value) {
    UniversalDatabase.ncDefaultWorkspaceId = ncDefaultWorkspaceId.value;
    return;
  }

  if (!user) {
    // find super user
    const superUser = await ncMeta
      .knexConnection(MetaTable.USERS)
      .where('roles', 'like', '%super%')
      .first();
    // no user created yet, we don't need to init ws
    if (!superUser) {
      return;
    }
    user = superUser;
  }

  // check if there are any records in workspace table
  let workspace = await ncMeta
    .knexConnection(MetaTable.WORKSPACE)
    .orderBy('created_at', 'asc')
    .first();

  if (!workspace) {
    // create workspace if not exists
    workspace = await ncMeta.metaInsert2(
      RootScopes.WORKSPACE,
      RootScopes.WORKSPACE,
      MetaTable.WORKSPACE,
      {
        title: 'Default Workspace',
        fk_user_id: user.id,
        status: 1,
        plan: 'free',
        fk_org_id: null,
      },
    );

    // insert ws user via model so cache is updated
    await WorkspaceUser.insert(
      {
        fk_workspace_id: workspace.id,
        fk_user_id: user.id,
        roles: WorkspaceUserRoles.OWNER,
      },
      ncMeta,
    );
  }

  // insert to store as it won't be exists
  await ncMeta.metaInsert2(
    RootScopes.ROOT,
    RootScopes.ROOT,
    MetaTable.STORE,
    {
      key: NC_STORE_DEFAULT_WORKSPACE_ID_KEY,
      value: workspace.id,
    },
    true,
  );

  UniversalDatabase.ncDefaultWorkspaceId = workspace.id;
};

export const verifyDefaultWsOwner = async (ncMeta = UniversalDatabase.ncMeta) => {
  // Skip for cloud/pure EE — on-prem always needs default workspace owner
  if (UniversalDatabase.isEE() && !isOnPrem) {
    return;
  }

  // find super user
  const user = await ncMeta
    .knexConnection(MetaTable.USERS)
    .where('roles', 'like', '%super%')
    .first();
  // no user created yet, we don't need to init ws
  if (!user) {
    return;
  }

  // if no default ws id present, we verify it first
  if (!UniversalDatabase.ncDefaultWorkspaceId) {
    await verifyDefaultWorkspace(user, ncMeta);
  }

  // get the user's workspace role
  const workspaceUser = await ncMeta
    .knexConnection(MetaTable.WORKSPACE_USER)
    .where('fk_workspace_id', UniversalDatabase.ncDefaultWorkspaceId)
    .andWhere('fk_user_id', user.id)
    .first();

  // if no role for user, we assign owner
  if (!workspaceUser) {
    await WorkspaceUser.insert(
      {
        fk_workspace_id: UniversalDatabase.ncDefaultWorkspaceId,
        fk_user_id: user.id,
        roles: WorkspaceUserRoles.OWNER,
      },
      ncMeta,
    );
  }
  // however if user has workspace role but not owner, we update
  else if (workspaceUser.roles !== WorkspaceUserRoles.OWNER) {
    await WorkspaceUser.update(
      UniversalDatabase.ncDefaultWorkspaceId,
      user.id,
      { roles: WorkspaceUserRoles.OWNER },
      ncMeta,
    );
  }
};

/**
 * The placeholder role for a member with no workspace role of their own. On
 * on-prem every user sits in the default workspace, and a placeholder there
 * must defer to team roles (INHERIT) rather than override them (NO_ACCESS).
 */
export const placeholderWorkspaceRole = (workspaceId?: string | null) =>
  isOnPrem && workspaceId && workspaceId === UniversalDatabase.ncDefaultWorkspaceId
    ? WorkspaceUserRoles.INHERIT
    : WorkspaceUserRoles.NO_ACCESS;

/**
 * Ensures a user has a workspace_user entry in the default workspace.
 * Used for non-first signups and org-user invites (CE + on-prem).
 * Cloud EE manages workspace membership via its own EE service — skip there.
 *
 * @param userId - The user ID to ensure membership for
 * @param role - Workspace role to assign (default: NO_ACCESS — preserves existing behavior)
 * @param ncMeta - Meta service instance
 */
export const ensureUserInDefaultWorkspace = async (
  userId: string,
  role: WorkspaceUserRoles = WorkspaceUserRoles.NO_ACCESS,
  ncMeta = UniversalDatabase.ncMeta,
) => {
  // Cloud EE manages workspace membership via its own service
  if (UniversalDatabase.isEE() && !isOnPrem) return;

  if (!UniversalDatabase.ncDefaultWorkspaceId) {
    await verifyDefaultWorkspace(undefined, ncMeta);
  }
  if (!UniversalDatabase.ncDefaultWorkspaceId) return;

  try {
    await WorkspaceUser.insert(
      {
        fk_workspace_id: UniversalDatabase.ncDefaultWorkspaceId,
        fk_user_id: userId,
        roles:
          role === WorkspaceUserRoles.NO_ACCESS
            ? placeholderWorkspaceRole(UniversalDatabase.ncDefaultWorkspaceId)
            : role,
      },
      ncMeta,
    );
  } catch {
    // Already in workspace — ignore duplicate
    logger.debug(`User ${userId} already in default workspace`);
  }
};
