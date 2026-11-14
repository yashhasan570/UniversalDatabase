import type { UniversalDatabaseSDK } from '../sdk';

export interface RecordField {
  [key: string]: any;
}

export interface DataRecord {
  id?: string | number;
  fields: RecordField;
}

export interface DataRecordId {
  id: string | number;
}

export interface DataRecordWithDeleted extends DataRecordId {
  deleted: boolean;
}

export interface DataListResponse {
  records?: DataRecord[];
  record?: DataRecord | null;
  next?: string;
  prev?: string;
  nestedNext?: string;
  nestedPrev?: string;
}

export interface DataInsertRequest {
  fields: RecordField;
}

export interface DataUpdateRequest {
  id: string | number;
  fields: RecordField;
}

export interface DataDeleteRequest {
  id: string | number;
}

export interface DataListParams {
  baseId?: string;
  modelId: string;
  query: any;
  viewId?: string;
  ignorePagination?: boolean;
  req: UniversalDatabaseSDK.NcRequest;
  // Reject a link filter its linked display field can't match (a non-date on a
  // Date display value) instead of returning no rows. Not settable over HTTP.
  strictLinkFilters?: boolean;
}

export interface DataInsertParams {
  baseId?: string;
  viewId?: string;
  modelId: string;
  body: DataInsertRequest | DataInsertRequest[];
  cookie: any;
}

export interface DataUpdateParams {
  baseId?: string;
  modelId: string;
  viewId?: string;
  body: DataUpdateRequest | DataUpdateRequest[];
  cookie: any;
}

export interface DataDeleteParams {
  baseId?: string;
  modelId: string;
  viewId?: string;
  cookie: any;
  body?: DataDeleteRequest | DataDeleteRequest[];
  queryRecords?: string | string[];
}

export interface NestedDataListParams {
  modelId: string;
  rowId: string;
  query: any;
  viewId: string;
  columnId: string;
  req: UniversalDatabaseSDK.NcRequest;
}

export interface DataReadParams {
  modelId: string;
  rowId: string;
  query: any;
  viewId?: string;
  req: UniversalDatabaseSDK.NcRequest;
}

export interface TransformRecordToV3Param {
  context: UniversalDatabaseSDK.NcContext;
  record: any;
  primaryKey: UniversalDatabaseSDK.ColumnType;
  primaryKeys?: UniversalDatabaseSDK.ColumnType[];
  requestedFields?: string[];
  columns?: UniversalDatabaseSDK.ColumnType[];
  nestedLimit?: number;
  skipSubstitutingColumnIds?: boolean;
  depth?: number;
}

export interface TransformRecordsToV3FormatParam {
  context: UniversalDatabaseSDK.NcContext;
  records: any[];
  primaryKey: UniversalDatabaseSDK.ColumnType;
  primaryKeys?: UniversalDatabaseSDK.ColumnType[];
  requestedFields?: string[];
  columns?: UniversalDatabaseSDK.ColumnType[];
  nestedLimit?: number;
  skipSubstitutingColumnIds?: boolean;
  depth?: number;
}

export type NestedLinkParams = {
  modelId: string;
  columnId: string;
  rowId: string;
  refRowIds:
    | string
    | string[]
    | number
    | number[]
    | Record<string, any>
    | Record<string, any>[];
  query?: any;
  cookie?: any;
  viewId?: string;
};

export interface IDataV3Service {
  transformRecordsToV3Format(
    param: TransformRecordsToV3FormatParam,
  ): Promise<DataRecord[]>;

  dataList<T extends boolean>(
    context: UniversalDatabaseSDK.NcContext,
    param: DataListParams,
    pagination?: T,
  ): Promise<T extends true ? DataListResponse : DataRecord[]>;

  dataInsert(
    context: UniversalDatabaseSDK.NcContext,
    param: DataInsertParams,
  ): Promise<{ records: DataRecord[] }>;

  dataDelete(
    context: UniversalDatabaseSDK.NcContext,
    param: DataDeleteParams,
  ): Promise<{ records: DataRecordWithDeleted[] }>;

  dataUpdate(
    context: UniversalDatabaseSDK.NcContext,
    param: DataUpdateParams,
  ): Promise<{ records: DataRecord[] }>;

  nestedDataList(
    context: UniversalDatabaseSDK.NcContext,
    param: NestedDataListParams,
  ): Promise<DataListResponse>;

  dataRead(
    context: UniversalDatabaseSDK.NcContext,
    param: DataReadParams,
  ): Promise<DataRecord>;

  nestedLink(
    context: UniversalDatabaseSDK.NcContext,
    param: NestedLinkParams,
  ): Promise<{ success: boolean }>;

  nestedUnlink(
    context: UniversalDatabaseSDK.NcContext,
    param: NestedLinkParams,
  ): Promise<{ success: boolean }>;
}

export interface ITablesService {
  list(
    context: UniversalDatabaseSDK.NcContext,
    param: { base_id: string },
  ): Promise<Array<{ id: string; title: string; table_name: string }>>;

  tableUpdate(
    context: UniversalDatabaseSDK.NcContext,
    param: {
      tableId: any;
      table: Partial<UniversalDatabaseSDK.TableReqType> & { base_id?: string };
      baseId?: string;
      user: UniversalDatabaseSDK.UserType;
      req: UniversalDatabaseSDK.NcRequest;
    },
  ): Promise<boolean>;

  reorderTable(
    context: UniversalDatabaseSDK.NcContext,
    param: { tableId: string; order: any; req: UniversalDatabaseSDK.NcRequest },
  ): Promise<any>;

  tableDelete(
    context: UniversalDatabaseSDK.NcContext,
    param: {
      tableId: string;
      user: UniversalDatabaseSDK.UserType;
      forceDeleteRelations?: boolean;
      forceDeleteSyncs?: boolean;
      req?: any;
    },
  ): Promise<any>;

  getTableWithAccessibleViews(
    context: UniversalDatabaseSDK.NcContext,
    param: {
      tableId: string;
      user: UniversalDatabaseSDK.UserType;
    },
  ): Promise<
    UniversalDatabaseSDK.TableType & {
      views: Array<UniversalDatabaseSDK.ViewType>;
      columns: Array<UniversalDatabaseSDK.ColumnType>;
    }
  >;

  getAccessibleTables(
    context: UniversalDatabaseSDK.NcContext,
    param: {
      baseId: string;
      sourceId?: string;
      includeM2M?: boolean;
      roles: Record<string, boolean>;
      user: UniversalDatabaseSDK.UserType;
    },
  ): Promise<UniversalDatabaseSDK.TableType[]>;

  tableCreate(
    context: UniversalDatabaseSDK.NcContext,
    param: {
      baseId: string;
      sourceId?: string;
      table: UniversalDatabaseSDK.TableReqType;
      user: UniversalDatabaseSDK.UserType;
      req: UniversalDatabaseSDK.NcRequest;
      synced?: boolean;
      apiVersion?: UniversalDatabaseSDK.NcApiVersion;
    },
  ): Promise<UniversalDatabaseSDK.TableType>;
}

interface XcEmailAttachment {
  /** Name that will be displayed to the recipient. Unicode is allowed. */
  filename?: string;
  /** Contents of the file */
  content?: string | Buffer;
  /** Filesystem path or URL (including data URIs). Recommended for large files. */
  path?: string;
  /** HTTP(S) URL that Nodemailer should fetch and attach */
  href?: string;
  /** Custom HTTP headers for href, for example { authorization: 'Bearer …' } */
  httpHeaders?: object;
  /** Explicit MIME type. Defaults to the type inferred from filename */
  contentType?: string;
  /** Content‑Disposition header. Defaults to 'attachment' */
  contentDisposition?: string;
  /** Content‑ID for embedding the attachment inline in the HTML body */
  cid?: string;
  /** Encoding applied when content is a string (e.g. 'base64', 'hex') */
  encoding?: string;
  /** Custom headers for the individual MIME node */
  headers?: object;
  /** Advanced: Full pre‑built MIME node including headers. Overrides every other field. */
  raw?: string;
}

interface RawMailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: XcEmailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
}

export interface IMailService {
  sendMailRaw(param: RawMailParams): Promise<boolean>;
}

/** A Universal Database attachment cell entry (record attachment or uploaded workflow asset). */
export interface EmailAttachmentFileRef {
  /** FileReference id, when the source carries one (record attachments, uploads) */
  id?: string;
  path?: string;
  url?: string;
  title?: string;
  mimetype?: string;
  size?: number;
}

/**
 * Where a stored file came from, which decides what may vouch for it: `upload`
 * is a file uploaded to the node, `record` an attachment field's value.
 */
export type EmailAttachmentOrigin = 'upload' | 'record';

export type EmailAttachmentSource =
  | {
      kind: 'universaldatabase';
      origin: EmailAttachmentOrigin;
      file: EmailAttachmentFileRef;
    }
  | { kind: 'url'; url: string; filename?: string };

export interface ResolvedEmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
}

export interface ResolveEmailAttachmentsOptions {
  /** Provider ceiling; the host applies its own platform cap on top. */
  maxTotalBytes?: number;
  /**
   * Bytes the message already carries outside these attachments (inline body images). The host
   * takes them off whichever cap applies, its own (admin-configurable) one included.
   */
  reservedBytes?: number;
  maxFiles?: number;
  /** The run's cancel signal; URL downloads stop when it fires. */
  signal?: AbortSignal;
}

export interface IAttachmentService {
  /**
   * Load attachment bytes for an outgoing message. Universal Database files must belong to
   * the executing base; URLs are fetched with SSRF protection. Throws when a
   * file is inaccessible or the count / total-size caps are exceeded.
   */
  resolveEmailAttachments(
    sources: EmailAttachmentSource[],
    options?: ResolveEmailAttachmentsOptions,
  ): Promise<ResolvedEmailAttachment[]>;
}

export interface CommentAuthor {
  id: string | null;
  name: string | null;
  email: string | null;
}

export interface CommentMentionRef {
  id: string;
  email: string | null;
  name: string | null;
}

/**
 * A comment enriched for consumption by workflow nodes: the raw + plain-text
 * body, the resolved author, and the @mentioned users parsed from the body.
 * Mirrors what the comment-trigger dispatcher builds on the live event path.
 */
export interface CommentRecord {
  id: string;
  record_id: string | null;
  body: string;
  body_plain: string;
  author: CommentAuthor;
  created_at: string | null;
  updated_at: string | null;
  parent_comment_id: string | null;
  mentions: CommentMentionRef[];
}

export interface ICommentsService {
  /**
   * List comments on a table, enriched with plain-text body, resolved author
   * and parsed @mentions. Used by nodes that need real comment data (e.g. the
   * comment trigger's "Test" action fetches a sample comment through this).
   */
  listByModel(
    context: UniversalDatabaseSDK.NcContext,
    param: { modelId: string; limit?: number },
  ): Promise<CommentRecord[]>;
}

/** An agent as a node's picker sees it. */
export interface WorkflowAgent {
  id: string;
  title: string;
  enabled: boolean;
  /** An agent has no runnable config until it has been published once. */
  published: boolean;
}

export interface StartAgentRunParams {
  agentId: string;
  /** The turn's prompt — the agent reads it as a message from the workflow. */
  message: string;
  /** Continue this session instead of opening a new one. */
  sessionId?: string;
  /** Title of the node asking, for the session title and the trigger payload. */
  nodeTitle?: string;
}

/**
 * A queued agent run. A session IS a run, so the session id is the run's
 * identity; it is null when the firing was suppressed — the loop guard, or a
 * run already in flight.
 */
export interface StartedAgentRun {
  sessionId: string | null;
}

export interface IAgentsService {
  agentList(context: UniversalDatabaseSDK.NcContext): Promise<WorkflowAgent[]>;

  agentGet(
    context: UniversalDatabaseSDK.NcContext,
    agentId: string,
  ): Promise<WorkflowAgent | null>;

  agentRun(
    context: UniversalDatabaseSDK.NcContext,
    param: StartAgentRunParams,
  ): Promise<StartedAgentRun>;
}

/** A workflow of the current base, as a node's picker sees it. */
export interface WorkflowSummary {
  id: string;
  title: string;
  enabled: boolean;
}

export interface IWorkflowsService {
  workflowList(context: UniversalDatabaseSDK.NcContext): Promise<WorkflowSummary[]>;

  /** One workflow of this base, or null if it is not here. */
  workflowGet(
    context: UniversalDatabaseSDK.NcContext,
    workflowId: string,
  ): Promise<WorkflowSummary | null>;

  /**
   * `inputs` (name → expression over the workflow's steps), resolved against
   * that workflow's step test results: sample values for an editor test.
   * An input with nothing to read is null.
   */
  sampleRunInputs(
    context: UniversalDatabaseSDK.NcContext,
    workflowId: string,
    inputs: Record<string, string>,
  ): Promise<Record<string, unknown>>;
}
