#!/usr/bin/env node

// src/shared/tools.ts
import { z as z23 } from "zod";
import fetch2 from "node-fetch";
import { promises as fs } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import archiver from "archiver";

// src/shared/response-handler.ts
async function handleApiResponse(response) {
  const responseData = await response.json();
  if (!response.ok) {
    const errorData = responseData;
    let fullMessage = errorData.message || errorData.error || "Unknown error";
    if (errorData.nextAction) {
      fullMessage += `. ${errorData.nextAction}`;
    }
    throw new Error(fullMessage);
  }
  return responseData;
}
function formatSuccessMessage(operation, data) {
  if (data && typeof data === "object" && "message" in data) {
    return `${data.message}
${JSON.stringify(data, null, 2)}`;
  }
  return `${operation} completed successfully:
${JSON.stringify(data, null, 2)}`;
}

// src/shared/usage-tracker.ts
import fetch from "node-fetch";
var UsageTracker = class {
  apiBaseUrl;
  apiKey;
  constructor(apiBaseUrl, apiKey) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey;
  }
  async trackUsage(toolName, success = true) {
    if (!this.apiKey) {
      return;
    }
    try {
      const payload = {
        tool_name: toolName,
        success,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      await fetch(`${this.apiBaseUrl}/api/usage/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Failed to track usage:", error);
    }
  }
};

// node_modules/@insforge/shared-schemas/dist/database.schema.js
import { z } from "zod";
var ColumnType;
(function(ColumnType2) {
  ColumnType2["STRING"] = "string";
  ColumnType2["DATE"] = "date";
  ColumnType2["DATETIME"] = "datetime";
  ColumnType2["INTEGER"] = "integer";
  ColumnType2["FLOAT"] = "float";
  ColumnType2["BOOLEAN"] = "boolean";
  ColumnType2["UUID"] = "uuid";
  ColumnType2["JSON"] = "json";
})(ColumnType || (ColumnType = {}));
var onUpdateActionSchema = z.enum(["CASCADE", "RESTRICT", "NO ACTION"]);
var onDeleteActionSchema = z.enum([
  "CASCADE",
  "SET NULL",
  "SET DEFAULT",
  "RESTRICT",
  "NO ACTION"
]);
var columnTypeSchema = z.enum([
  ColumnType.STRING,
  ColumnType.DATE,
  ColumnType.DATETIME,
  ColumnType.INTEGER,
  ColumnType.FLOAT,
  ColumnType.BOOLEAN,
  ColumnType.UUID,
  ColumnType.JSON
]);
var foreignKeySchema = z.object({
  referenceTable: z.string().min(1, "Target table cannot be empty"),
  referenceColumn: z.string().min(1, "Target column cannot be empty"),
  onDelete: onDeleteActionSchema,
  onUpdate: onUpdateActionSchema
});
var columnSchema = z.object({
  columnName: z.string().min(1, "Column name cannot be empty").max(64, "Column name must be less than 64 characters"),
  type: z.union([columnTypeSchema, z.string()]),
  defaultValue: z.string().optional(),
  isPrimaryKey: z.boolean().optional(),
  isNullable: z.boolean(),
  isUnique: z.boolean(),
  foreignKey: foreignKeySchema.optional()
});
var tableSchema = z.object({
  tableName: z.string().min(1, "Table name cannot be empty").max(64, "Table name must be less than 64 characters"),
  columns: z.array(columnSchema).min(1, "At least one column is required"),
  recordCount: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});
var databaseFunctionSchema = z.object({
  functionName: z.string(),
  functionDef: z.string(),
  kind: z.string()
});
var databaseIndexSchema = z.object({
  tableName: z.string(),
  indexName: z.string(),
  indexDef: z.string(),
  isUnique: z.boolean().nullable(),
  isPrimary: z.boolean().nullable()
});
var databasePolicySchema = z.object({
  tableName: z.string(),
  policyName: z.string(),
  cmd: z.string(),
  roles: z.array(z.string()),
  qual: z.string().nullable(),
  withCheck: z.string().nullable()
});
var databaseTriggerSchema = z.object({
  tableName: z.string(),
  triggerName: z.string(),
  actionTiming: z.string(),
  eventManipulation: z.string(),
  actionOrientation: z.string(),
  actionCondition: z.string().nullable(),
  actionStatement: z.string()
});

// node_modules/@insforge/shared-schemas/dist/database-api.schema.js
import { z as z2 } from "zod";
var createTableRequestSchema = tableSchema.pick({
  tableName: true,
  columns: true
}).extend({
  rlsEnabled: z2.boolean().default(true)
});
var createTableResponseSchema = tableSchema.pick({
  tableName: true,
  columns: true
}).extend({
  message: z2.string(),
  autoFields: z2.array(z2.string()),
  nextActions: z2.string()
});
var updateTableSchemaRequestSchema = z2.object({
  addColumns: z2.array(columnSchema.omit({
    foreignKey: true
  })).optional(),
  dropColumns: z2.array(z2.string()).optional(),
  updateColumns: z2.array(z2.object({
    columnName: z2.string(),
    defaultValue: z2.string().optional(),
    newColumnName: z2.string().min(1, "New column name cannot be empty").max(64, "New column name must be less than 64 characters").optional()
  })).optional(),
  addForeignKeys: z2.array(z2.object({
    columnName: z2.string().min(1, "Column name is required for adding foreign key"),
    foreignKey: foreignKeySchema
  })).optional(),
  dropForeignKeys: z2.array(z2.string()).optional(),
  renameTable: z2.object({
    newTableName: z2.string().min(1, "New table name cannot be empty").max(64, "New table name must be less than 64 characters")
  }).optional()
});
var updateTableSchemaResponse = z2.object({
  message: z2.string(),
  tableName: z2.string(),
  operations: z2.array(z2.string())
});
var deleteTableResponse = z2.object({
  message: z2.string(),
  tableName: z2.string(),
  nextActions: z2.string()
});
var rawSQLRequestSchema = z2.object({
  query: z2.string().min(1, "Query is required"),
  params: z2.array(z2.unknown()).optional()
});
var rawSQLResponseSchema = z2.object({
  rows: z2.array(z2.record(z2.string(), z2.unknown())),
  rowCount: z2.number().nullable(),
  fields: z2.array(z2.object({
    name: z2.string(),
    dataTypeID: z2.number()
  })).optional()
});
var exportRequestSchema = z2.object({
  tables: z2.array(z2.string()).optional(),
  format: z2.enum(["sql", "json"]).default("sql"),
  includeData: z2.boolean().default(true),
  includeFunctions: z2.boolean().default(false),
  includeSequences: z2.boolean().default(false),
  includeViews: z2.boolean().default(false),
  rowLimit: z2.number().int().positive().max(1e4).default(1e3)
});
var exportJsonDataSchema = z2.object({
  timestamp: z2.string(),
  tables: z2.record(z2.string(), z2.object({
    schema: z2.array(z2.object({
      columnName: z2.string(),
      dataType: z2.string(),
      characterMaximumLength: z2.number().nullable(),
      isNullable: z2.string(),
      columnDefault: z2.string().nullable()
    })),
    indexes: z2.array(z2.object({
      indexname: z2.string(),
      indexdef: z2.string(),
      isUnique: z2.boolean().nullable(),
      isPrimary: z2.boolean().nullable()
    })),
    foreignKeys: z2.array(z2.object({
      constraintName: z2.string(),
      columnName: z2.string(),
      foreignTableName: z2.string(),
      foreignColumnName: z2.string(),
      deleteRule: z2.string().nullable(),
      updateRule: z2.string().nullable()
    })),
    rlsEnabled: z2.boolean().optional(),
    policies: z2.array(z2.object({
      policyname: z2.string(),
      cmd: z2.string(),
      roles: z2.array(z2.string()),
      qual: z2.string().nullable(),
      withCheck: z2.string().nullable()
    })),
    triggers: z2.array(z2.object({
      triggerName: z2.string(),
      actionTiming: z2.string(),
      eventManipulation: z2.string(),
      actionOrientation: z2.string(),
      actionCondition: z2.string().nullable(),
      actionStatement: z2.string(),
      newTable: z2.string().nullable(),
      oldTable: z2.string().nullable()
    })),
    rows: z2.array(z2.record(z2.string(), z2.unknown())).optional(),
    recordCount: z2.number().optional()
  })),
  functions: z2.array(z2.object({
    functionName: z2.string(),
    functionDef: z2.string(),
    kind: z2.string()
  })),
  sequences: z2.array(z2.object({
    sequenceName: z2.string(),
    startValue: z2.string(),
    increment: z2.string(),
    minValue: z2.string().nullable(),
    maxValue: z2.string().nullable(),
    cycle: z2.string()
  })),
  views: z2.array(z2.object({
    viewName: z2.string(),
    definition: z2.string()
  }))
});
var exportResponseSchema = z2.object({
  format: z2.enum(["sql", "json"]),
  data: z2.union([z2.string(), exportJsonDataSchema]),
  timestamp: z2.string()
});
var importRequestSchema = z2.object({
  truncate: z2.union([
    z2.boolean(),
    z2.string().transform((val) => {
      if (val === "true")
        return true;
      if (val === "false")
        return false;
      throw new Error("Invalid boolean string");
    })
  ]).default(false)
});
var importResponseSchema = z2.object({
  success: z2.boolean(),
  message: z2.string(),
  filename: z2.string(),
  tables: z2.array(z2.string()),
  rowsImported: z2.number(),
  fileSize: z2.number()
});
var bulkUpsertRequestSchema = z2.object({
  table: z2.string().min(1, "Table name is required"),
  upsertKey: z2.string().optional()
  // Note: File handling is done at the API layer via multipart/form-data
});
var bulkUpsertResponseSchema = z2.object({
  success: z2.boolean(),
  message: z2.string(),
  table: z2.string(),
  rowsAffected: z2.number(),
  totalRecords: z2.number(),
  filename: z2.string()
});
var databaseFunctionsResponseSchema = z2.object({
  functions: z2.array(databaseFunctionSchema)
});
var databaseIndexesResponseSchema = z2.object({
  indexes: z2.array(databaseIndexSchema)
});
var databasePoliciesResponseSchema = z2.object({
  policies: z2.array(databasePolicySchema)
});
var databaseTriggersResponseSchema = z2.object({
  triggers: z2.array(databaseTriggerSchema)
});

// node_modules/@insforge/shared-schemas/dist/secrets.schema.js
import { z as z3 } from "zod";
var secretSchema = z3.object({
  id: z3.string(),
  key: z3.string(),
  isActive: z3.boolean(),
  isReserved: z3.boolean(),
  lastUsedAt: z3.string().nullable(),
  expiresAt: z3.string().nullable(),
  createdAt: z3.string(),
  updatedAt: z3.string()
});

// node_modules/@insforge/shared-schemas/dist/secrets-api.schema.js
import { z as z4 } from "zod";
var listSecretsResponseSchema = z4.object({
  secrets: z4.array(secretSchema)
});
var getSecretValueResponseSchema = z4.object({
  key: z4.string(),
  value: z4.string()
});
var createSecretRequestSchema = z4.object({
  key: z4.string().regex(/^[A-Z0-9_]+$/, "Use uppercase letters, numbers, and underscores only"),
  value: z4.string().min(1, "Value is required")
});
var createSecretResponseSchema = z4.object({
  success: z4.literal(true),
  message: z4.string(),
  id: z4.string()
});
var updateSecretResponseSchema = z4.object({
  success: z4.literal(true),
  message: z4.string()
});
var deleteSecretResponseSchema = z4.object({
  success: z4.literal(true),
  message: z4.string()
});

// node_modules/@insforge/shared-schemas/dist/storage.schema.js
import { z as z5 } from "zod";
var storageFileSchema = z5.object({
  key: z5.string(),
  bucket: z5.string(),
  size: z5.number(),
  mimeType: z5.string().optional(),
  uploadedAt: z5.string(),
  url: z5.string()
});
var storageBucketSchema = z5.object({
  name: z5.string(),
  public: z5.boolean(),
  createdAt: z5.string()
});

// node_modules/@insforge/shared-schemas/dist/storage-api.schema.js
import { z as z6 } from "zod";
var createBucketRequestSchema = z6.object({
  bucketName: z6.string().min(1, "Bucket name cannot be empty"),
  isPublic: z6.boolean().default(true)
});
var updateBucketRequestSchema = z6.object({
  isPublic: z6.boolean()
});
var listObjectsResponseSchema = z6.object({
  objects: z6.array(storageFileSchema),
  pagination: z6.object({
    offset: z6.number(),
    limit: z6.number(),
    total: z6.number()
  })
});
var uploadStrategyRequestSchema = z6.object({
  filename: z6.string().min(1, "Filename cannot be empty"),
  contentType: z6.string().optional(),
  size: z6.number().optional()
});
var uploadStrategyResponseSchema = z6.object({
  method: z6.enum(["presigned", "direct"]),
  uploadUrl: z6.string(),
  fields: z6.record(z6.string()).optional(),
  key: z6.string(),
  confirmRequired: z6.boolean(),
  confirmUrl: z6.string().optional(),
  expiresAt: z6.date().optional()
});
var downloadStrategyRequestSchema = z6.object({
  expiresIn: z6.number().optional().default(3600)
});
var downloadStrategyResponseSchema = z6.object({
  method: z6.enum(["presigned", "direct"]),
  url: z6.string(),
  expiresAt: z6.date().optional(),
  headers: z6.record(z6.string()).optional()
});
var confirmUploadRequestSchema = z6.object({
  size: z6.number(),
  contentType: z6.string().optional(),
  etag: z6.string().optional()
});

// node_modules/@insforge/shared-schemas/dist/auth.schema.js
import { z as z7 } from "zod";
var userIdSchema = z7.string().uuid("Invalid user ID format");
var emailSchema = z7.string().email("Invalid email format").toLowerCase().trim();
var passwordSchema = z7.string();
var nameSchema = z7.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").trim();
var roleSchema = z7.enum(["anon", "authenticated", "project_admin"]);
var verificationMethodSchema = z7.enum(["code", "link"]);
var profileSchema = z7.object({
  name: z7.string().optional(),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  avatar_url: z7.string().url().optional()
}).passthrough();
var userSchema = z7.object({
  id: userIdSchema,
  email: emailSchema,
  emailVerified: z7.boolean(),
  providers: z7.array(z7.string()).optional(),
  createdAt: z7.string(),
  // PostgreSQL timestamp
  updatedAt: z7.string(),
  // PostgreSQL timestamp
  profile: profileSchema.nullable(),
  // User profile data (name, avatar_url, bio, etc.)
  metadata: z7.record(z7.unknown()).nullable()
  // System metadata (device ID, login IP, etc.)
});
var oAuthProvidersSchema = z7.enum([
  "google",
  "github",
  "discord",
  "linkedin",
  "facebook",
  "instagram",
  "tiktok",
  "apple",
  "x",
  "spotify",
  "microsoft"
]);
var oAuthStateSchema = z7.object({
  provider: oAuthProvidersSchema,
  redirectUri: z7.string().url().optional()
});
var oAuthConfigSchema = z7.object({
  id: z7.string().uuid(),
  provider: oAuthProvidersSchema,
  clientId: z7.string().optional(),
  scopes: z7.array(z7.string()).optional(),
  redirectUri: z7.string().optional(),
  useSharedKey: z7.boolean(),
  createdAt: z7.string(),
  // PostgreSQL timestamp
  updatedAt: z7.string()
  // PostgreSQL timestamp
});
var authConfigSchema = z7.object({
  id: z7.string().uuid(),
  requireEmailVerification: z7.boolean(),
  passwordMinLength: z7.number().min(4).max(128),
  requireNumber: z7.boolean(),
  requireLowercase: z7.boolean(),
  requireUppercase: z7.boolean(),
  requireSpecialChar: z7.boolean(),
  verifyEmailMethod: verificationMethodSchema,
  resetPasswordMethod: verificationMethodSchema,
  signInRedirectTo: z7.union([z7.string().url(), z7.literal(""), z7.null()]).optional().transform((val) => val === "" ? null : val),
  createdAt: z7.string(),
  // PostgreSQL timestamp
  updatedAt: z7.string()
  // PostgreSQL timestamp
});
var tokenPayloadSchema = z7.object({
  sub: userIdSchema,
  // Subject (user ID)
  email: emailSchema,
  role: roleSchema,
  iat: z7.number().optional(),
  // Issued at
  exp: z7.number().optional()
  // Expiration
});

// node_modules/@insforge/shared-schemas/dist/auth-api.schema.js
import { z as z8 } from "zod";
var paginationSchema = z8.object({
  limit: z8.string().optional(),
  offset: z8.string().optional()
});
var createUserRequestSchema = z8.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema.optional()
});
var createSessionRequestSchema = z8.object({
  email: emailSchema,
  password: passwordSchema
});
var exchangeAdminSessionRequestSchema = z8.object({
  code: z8.string()
});
var listUsersRequestSchema = paginationSchema.extend({
  search: z8.string().optional()
}).optional();
var deleteUsersRequestSchema = z8.object({
  userIds: z8.array(userIdSchema).min(1, "At least one user ID is required")
});
var updateProfileRequestSchema = z8.object({
  profile: z8.record(z8.unknown())
});
var sendVerificationEmailRequestSchema = z8.object({
  email: emailSchema
});
var verifyEmailRequestSchema = z8.object({
  email: emailSchema.optional(),
  otp: z8.string().min(1)
}).refine((data) => data.email || data.otp, {
  message: "Either email or otp must be provided"
});
var sendResetPasswordEmailRequestSchema = z8.object({
  email: emailSchema
});
var exchangeResetPasswordTokenRequestSchema = z8.object({
  email: emailSchema,
  code: z8.string().min(1)
});
var resetPasswordRequestSchema = z8.object({
  newPassword: passwordSchema,
  otp: z8.string().min(1, "OTP/token is required")
});
var createUserResponseSchema = z8.object({
  user: userSchema.optional(),
  accessToken: z8.string().nullable(),
  requireEmailVerification: z8.boolean().optional(),
  redirectTo: z8.string().url().optional(),
  csrfToken: z8.string().nullable().optional()
});
var createSessionResponseSchema = z8.object({
  user: userSchema,
  accessToken: z8.string(),
  redirectTo: z8.string().url().optional(),
  csrfToken: z8.string().nullable().optional()
});
var verifyEmailResponseSchema = z8.object({
  user: userSchema,
  accessToken: z8.string(),
  redirectTo: z8.string().url().optional(),
  csrfToken: z8.string().nullable().optional()
});
var refreshSessionResponseSchema = z8.object({
  accessToken: z8.string(),
  user: userSchema,
  csrfToken: z8.string()
});
var exchangeResetPasswordTokenResponseSchema = z8.object({
  token: z8.string(),
  expiresAt: z8.string().datetime()
});
var resetPasswordResponseSchema = z8.object({
  message: z8.string()
});
var getCurrentSessionResponseSchema = z8.object({
  user: userSchema
});
var getProfileResponseSchema = z8.object({
  id: userIdSchema,
  profile: profileSchema.nullable()
});
var listUsersResponseSchema = z8.object({
  data: z8.array(userSchema),
  pagination: z8.object({
    offset: z8.number(),
    limit: z8.number(),
    total: z8.number()
  })
});
var deleteUsersResponseSchema = z8.object({
  message: z8.string(),
  deletedCount: z8.number().int().nonnegative()
});
var getOauthUrlResponseSchema = z8.object({
  authUrl: z8.string().url()
});
var createOAuthConfigRequestSchema = oAuthConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  clientSecret: z8.string().optional()
});
var updateOAuthConfigRequestSchema = oAuthConfigSchema.omit({
  id: true,
  provider: true,
  createdAt: true,
  updatedAt: true
}).extend({
  clientSecret: z8.string().optional()
}).partial();
var listOAuthConfigsResponseSchema = z8.object({
  data: z8.array(oAuthConfigSchema),
  count: z8.number()
});
var updateAuthConfigRequestSchema = authConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).partial();
var getPublicAuthConfigResponseSchema = z8.object({
  oAuthProviders: z8.array(oAuthProvidersSchema),
  ...authConfigSchema.omit({
    id: true,
    updatedAt: true,
    createdAt: true,
    signInRedirectTo: true
  }).shape
});
var authErrorResponseSchema = z8.object({
  error: z8.string(),
  message: z8.string(),
  statusCode: z8.number().int(),
  nextActions: z8.string().optional()
});

// node_modules/@insforge/shared-schemas/dist/metadata.schema.js
import { z as z11 } from "zod";

// node_modules/@insforge/shared-schemas/dist/realtime.schema.js
import { z as z9 } from "zod";
var senderTypeSchema = z9.enum(["system", "user"]);
var realtimeChannelSchema = z9.object({
  id: z9.string().uuid(),
  pattern: z9.string().min(1),
  description: z9.string().nullable(),
  webhookUrls: z9.array(z9.string().url()).nullable(),
  enabled: z9.boolean(),
  createdAt: z9.string().datetime(),
  updatedAt: z9.string().datetime()
});
var realtimeMessageSchema = z9.object({
  id: z9.string().uuid(),
  eventName: z9.string().min(1),
  channelId: z9.string().uuid().nullable(),
  channelName: z9.string().min(1),
  payload: z9.record(z9.string(), z9.unknown()),
  senderType: senderTypeSchema,
  senderId: z9.string().uuid().nullable(),
  wsAudienceCount: z9.number().int().min(0),
  whAudienceCount: z9.number().int().min(0),
  whDeliveredCount: z9.number().int().min(0),
  createdAt: z9.string().datetime()
});
var subscribeChannelPayloadSchema = z9.object({
  channel: z9.string().min(1)
  // The resolved channel instance, e.g., "order:123"
});
var unsubscribeChannelPayloadSchema = z9.object({
  channel: z9.string().min(1)
  // The resolved channel instance, e.g., "order:123"
});
var publishEventPayloadSchema = z9.object({
  channel: z9.string().min(1),
  event: z9.string().min(1),
  payload: z9.record(z9.string(), z9.unknown())
});
var subscribeResponseSchema = z9.discriminatedUnion("ok", [
  z9.object({
    ok: z9.literal(true),
    channel: z9.string().min(1)
  }),
  z9.object({
    ok: z9.literal(false),
    channel: z9.string().min(1),
    error: z9.object({
      code: z9.string().min(1),
      message: z9.string().min(1)
    })
  })
]);
var realtimeErrorPayloadSchema = z9.object({
  channel: z9.string().optional(),
  code: z9.string().min(1),
  message: z9.string().min(1)
});
var webhookMessageSchema = z9.object({
  messageId: z9.string().uuid(),
  channel: z9.string().min(1),
  eventName: z9.string().min(1),
  payload: z9.record(z9.string(), z9.unknown())
});
var socketMessageMetaSchema = z9.object({
  channel: z9.string().optional(),
  // Present for room broadcasts
  messageId: z9.string().uuid(),
  senderType: senderTypeSchema,
  senderId: z9.string().uuid().optional(),
  timestamp: z9.string().datetime()
});
var socketMessageSchema = z9.object({
  meta: socketMessageMetaSchema
}).passthrough();

// node_modules/@insforge/shared-schemas/dist/realtime-api.schema.js
import { z as z10 } from "zod";
var createChannelRequestSchema = z10.object({
  pattern: z10.string().min(1, "Channel pattern is required"),
  description: z10.string().optional(),
  webhookUrls: z10.array(z10.string().url()).optional(),
  enabled: z10.boolean().optional().default(true)
});
var updateChannelRequestSchema = z10.object({
  pattern: z10.string().min(1).optional(),
  description: z10.string().optional(),
  webhookUrls: z10.array(z10.string().url()).optional(),
  enabled: z10.boolean().optional()
});
var listChannelsResponseSchema = z10.array(realtimeChannelSchema);
var deleteChannelResponseSchema = z10.object({
  message: z10.string()
});
var listMessagesRequestSchema = z10.object({
  channelId: z10.string().uuid().optional(),
  eventName: z10.string().optional(),
  limit: z10.coerce.number().int().min(1).max(1e3).optional().default(100),
  offset: z10.coerce.number().int().min(0).optional().default(0)
});
var listMessagesResponseSchema = z10.array(realtimeMessageSchema);
var messageStatsRequestSchema = z10.object({
  channelId: z10.string().uuid().optional(),
  since: z10.coerce.date().optional()
});
var messageStatsResponseSchema = z10.object({
  totalMessages: z10.number().int().min(0),
  whDeliveryRate: z10.number().min(0).max(1),
  topEvents: z10.array(z10.object({
    eventName: z10.string(),
    count: z10.number().int().min(0)
  }))
});
var rlsPolicySchema = z10.object({
  policyName: z10.string(),
  tableName: z10.string(),
  command: z10.string(),
  roles: z10.array(z10.string()),
  using: z10.string().nullable(),
  withCheck: z10.string().nullable()
});
var realtimePermissionsResponseSchema = z10.object({
  subscribe: z10.object({
    policies: z10.array(rlsPolicySchema)
  }),
  publish: z10.object({
    policies: z10.array(rlsPolicySchema)
  })
});

// node_modules/@insforge/shared-schemas/dist/metadata.schema.js
var authMetadataSchema = getPublicAuthConfigResponseSchema;
var databaseMetadataSchema = z11.object({
  tables: z11.array(z11.object({
    tableName: z11.string(),
    recordCount: z11.number()
  })),
  totalSizeInGB: z11.number(),
  hint: z11.string().optional()
});
var bucketMetadataSchema = storageBucketSchema.extend({
  objectCount: z11.number().optional()
});
var storageMetadataSchema = z11.object({
  buckets: z11.array(bucketMetadataSchema),
  totalSizeInGB: z11.number()
});
var edgeFunctionMetadataSchema = z11.object({
  slug: z11.string(),
  name: z11.string(),
  description: z11.string().nullable(),
  status: z11.string()
});
var aiMetadataSchema = z11.object({
  models: z11.array(z11.object({
    inputModality: z11.array(z11.string()),
    outputModality: z11.array(z11.string()),
    modelId: z11.string()
  }))
});
var realtimeMetadataSchema = z11.object({
  channels: z11.array(realtimeChannelSchema),
  permissions: realtimePermissionsResponseSchema
});
var appMetaDataSchema = z11.object({
  auth: authMetadataSchema,
  database: databaseMetadataSchema,
  storage: storageMetadataSchema,
  aiIntegration: aiMetadataSchema.optional(),
  functions: z11.array(edgeFunctionMetadataSchema),
  realtime: realtimeMetadataSchema.optional(),
  version: z11.string().optional()
});
var databaseConnectionParametersSchema = z11.object({
  host: z11.string(),
  port: z11.number(),
  database: z11.string(),
  user: z11.string(),
  password: z11.string(),
  sslmode: z11.string()
});
var databaseConnectionInfoSchema = z11.object({
  connectionURL: z11.string(),
  parameters: databaseConnectionParametersSchema
});
var databasePasswordInfoSchema = z11.object({
  databasePassword: z11.string()
});
var apiKeyResponseSchema = z11.object({
  apiKey: z11.string()
});

// node_modules/@insforge/shared-schemas/dist/ai.schema.js
import { z as z12 } from "zod";
var modalitySchema = z12.enum(["text", "image", "audio"]);
var aiConfigurationInputSchema = z12.object({
  inputModality: z12.array(modalitySchema).min(1),
  outputModality: z12.array(modalitySchema).min(1),
  provider: z12.string(),
  modelId: z12.string(),
  systemPrompt: z12.string().optional()
});
var aiConfigurationSchema = aiConfigurationInputSchema.extend({
  id: z12.string().uuid()
});
var aiConfigurationWithUsageSchema = aiConfigurationSchema.extend({
  usageStats: z12.object({
    totalInputTokens: z12.number(),
    totalOutputTokens: z12.number(),
    totalTokens: z12.number(),
    totalImageCount: z12.number(),
    totalRequests: z12.number()
  }).optional()
});
var aiUsageDataSchema = z12.object({
  configId: z12.string().uuid(),
  inputTokens: z12.number().int().optional(),
  outputTokens: z12.number().int().optional(),
  imageCount: z12.number().int().optional(),
  imageResolution: z12.string().optional()
});
var aiUsageRecordSchema = aiUsageDataSchema.extend({
  id: z12.string().uuid(),
  createdAt: z12.date(),
  modelId: z12.string().nullable().optional(),
  model: z12.string().nullable(),
  provider: z12.string().nullable(),
  inputModality: z12.array(modalitySchema).nullable(),
  outputModality: z12.array(modalitySchema).nullable()
});
var aiUsageSummarySchema = z12.object({
  totalInputTokens: z12.number(),
  totalOutputTokens: z12.number(),
  totalTokens: z12.number(),
  totalImageCount: z12.number(),
  totalRequests: z12.number()
});

// node_modules/@insforge/shared-schemas/dist/ai-api.schema.js
import { z as z13 } from "zod";
var textContentSchema = z13.object({
  type: z13.literal("text"),
  text: z13.string()
});
var imageContentSchema = z13.object({
  type: z13.literal("image_url"),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  image_url: z13.object({
    // URL can be either a public URL or base64-encoded data URI
    // Examples:
    // - Public URL: "https://example.com/image.jpg"
    // - Base64: "data:image/jpeg;base64,/9j/4AAQ..."
    url: z13.string(),
    detail: z13.enum(["auto", "low", "high"]).optional()
  })
});
var audioContentSchema = z13.object({
  type: z13.literal("input_audio"),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  input_audio: z13.object({
    // Base64-encoded audio data (direct URLs not supported for audio)
    data: z13.string(),
    format: z13.enum(["wav", "mp3", "aiff", "aac", "ogg", "flac", "m4a"])
  })
});
var contentSchema = z13.union([textContentSchema, imageContentSchema, audioContentSchema]);
var chatMessageSchema = z13.object({
  role: z13.enum(["user", "assistant", "system"]),
  // New format: content can be string or array of content parts (OpenAI-compatible)
  content: z13.union([z13.string(), z13.array(contentSchema)]),
  // Legacy format: separate images field (deprecated but supported for backward compatibility)
  images: z13.array(z13.object({ url: z13.string() })).optional()
});
var chatCompletionRequestSchema = z13.object({
  model: z13.string(),
  messages: z13.array(chatMessageSchema),
  temperature: z13.number().min(0).max(2).optional(),
  maxTokens: z13.number().positive().optional(),
  topP: z13.number().min(0).max(1).optional(),
  stream: z13.boolean().optional()
});
var chatCompletionResponseSchema = z13.object({
  text: z13.string(),
  metadata: z13.object({
    model: z13.string(),
    usage: z13.object({
      promptTokens: z13.number().optional(),
      completionTokens: z13.number().optional(),
      totalTokens: z13.number().optional()
    }).optional()
  }).optional()
});
var imageGenerationRequestSchema = z13.object({
  model: z13.string(),
  prompt: z13.string(),
  images: z13.array(z13.object({
    url: z13.string()
  })).optional()
});
var imageGenerationResponseSchema = z13.object({
  text: z13.string().optional(),
  images: z13.array(z13.object({
    type: z13.literal("imageUrl"),
    imageUrl: z13.string()
  })),
  metadata: z13.object({
    model: z13.string(),
    usage: z13.object({
      promptTokens: z13.number().optional(),
      completionTokens: z13.number().optional(),
      totalTokens: z13.number().optional()
    }).optional()
  }).optional()
});
var aiModelSchema = z13.object({
  id: z13.string(),
  inputModality: z13.array(modalitySchema).min(1),
  outputModality: z13.array(modalitySchema).min(1),
  provider: z13.string(),
  modelId: z13.string(),
  priceLevel: z13.number().min(0).max(3).optional()
});
var createAIConfigurationRequestSchema = aiConfigurationSchema.omit({
  id: true
});
var updateAIConfigurationRequestSchema = z13.object({
  systemPrompt: z13.string().nullable()
});
var listAIUsageResponseSchema = z13.object({
  records: z13.array(aiUsageRecordSchema),
  total: z13.number()
});
var getAIUsageRequestSchema = z13.object({
  startDate: z13.string().datetime().optional(),
  endDate: z13.string().datetime().optional(),
  limit: z13.string().regex(/^\d+$/).default("50"),
  offset: z13.string().regex(/^\d+$/).default("0")
});
var getAIUsageSummaryRequestSchema = z13.object({
  configId: z13.string().uuid().optional(),
  startDate: z13.string().datetime().optional(),
  endDate: z13.string().datetime().optional()
});

// node_modules/@insforge/shared-schemas/dist/logs.schema.js
import { z as z14 } from "zod";
var auditLogSchema = z14.object({
  id: z14.string(),
  actor: z14.string(),
  action: z14.string(),
  module: z14.string(),
  details: z14.record(z14.unknown()).nullable(),
  ipAddress: z14.string().nullable(),
  createdAt: z14.string(),
  updatedAt: z14.string()
});
var logSourceSchema = z14.object({
  id: z14.string(),
  name: z14.string(),
  token: z14.string()
});
var logSchema = z14.object({
  id: z14.string(),
  eventMessage: z14.string(),
  timestamp: z14.string(),
  body: z14.record(z14.string(), z14.unknown()),
  source: z14.string().optional()
});
var logStatsSchema = z14.object({
  source: z14.string(),
  count: z14.number(),
  lastActivity: z14.string()
});

// node_modules/@insforge/shared-schemas/dist/logs-api.schema.js
import { z as z15 } from "zod";
var getAuditLogsRequestSchema = z15.object({
  limit: z15.number().default(100),
  offset: z15.number().default(0),
  actor: z15.string().optional(),
  action: z15.string().optional(),
  module: z15.string().optional(),
  startDate: z15.string().optional(),
  endDate: z15.string().optional()
});
var getAuditLogsResponseSchema = z15.object({
  data: z15.array(auditLogSchema),
  pagination: z15.object({
    limit: z15.number(),
    offset: z15.number(),
    total: z15.number()
  })
});
var getAuditLogStatsRequestSchema = z15.object({
  days: z15.number().default(7)
});
var getAuditLogStatsResponseSchema = z15.object({
  totalLogs: z15.number(),
  uniqueActors: z15.number(),
  uniqueModules: z15.number(),
  actionsByModule: z15.record(z15.number()),
  recentActivity: z15.array(auditLogSchema)
});
var clearAuditLogsRequestSchema = z15.object({
  daysToKeep: z15.number().default(90)
});
var clearAuditLogsResponseSchema = z15.object({
  message: z15.string(),
  deleted: z15.number()
});
var getLogsResponseSchema = z15.object({
  logs: z15.array(logSchema),
  total: z15.number()
});

// node_modules/@insforge/shared-schemas/dist/functions.schema.js
import { z as z16 } from "zod";
var functionSchema = z16.object({
  id: z16.string(),
  slug: z16.string(),
  name: z16.string(),
  description: z16.string().nullable(),
  code: z16.string(),
  status: z16.enum(["draft", "active", "error"]),
  createdAt: z16.string(),
  updatedAt: z16.string(),
  deployedAt: z16.string().nullable()
});

// node_modules/@insforge/shared-schemas/dist/functions-api.schema.js
import { z as z17 } from "zod";
var uploadFunctionRequestSchema = z17.object({
  name: z17.string().min(1, "Name is required"),
  slug: z17.string().regex(/^[a-zA-Z0-9_-]+$/, "Invalid slug format - must be alphanumeric with hyphens or underscores only").optional(),
  code: z17.string().min(1),
  description: z17.string().optional(),
  status: z17.enum(["draft", "active"]).optional().default("active")
});
var updateFunctionRequestSchema = z17.object({
  name: z17.string().optional(),
  code: z17.string().optional(),
  description: z17.string().optional(),
  status: z17.enum(["draft", "active"]).optional()
});
var listFunctionsResponseSchema = z17.object({
  functions: z17.array(functionSchema),
  runtime: z17.object({
    status: z17.enum(["running", "unavailable"])
  })
});

// node_modules/@insforge/shared-schemas/dist/cloud-events.schema.js
import { z as z18 } from "zod";
var appRouteChangeEventSchema = z18.object({
  type: z18.literal("APP_ROUTE_CHANGE"),
  path: z18.string()
});
var authSuccessEventSchema = z18.object({
  type: z18.literal("AUTH_SUCCESS")
});
var authErrorEventSchema = z18.object({
  type: z18.literal("AUTH_ERROR"),
  message: z18.string()
});
var mcpConnectionStatusEventSchema = z18.object({
  type: z18.literal("MCP_CONNECTION_STATUS"),
  connected: z18.boolean(),
  toolName: z18.string(),
  timestamp: z18.union([z18.number(), z18.string()])
});
var showOnboardingOverlayEventSchema = z18.object({
  type: z18.literal("SHOW_ONBOARDING_OVERLAY")
});
var showSettingsOverlayEventSchema = z18.object({
  type: z18.literal("SHOW_SETTINGS_OVERLAY")
});
var onboardingSuccessSchema = z18.object({
  type: z18.literal("ONBOARDING_SUCCESS")
});
var navigateToUsageSchema = z18.object({
  type: z18.literal("NAVIGATE_TO_USAGE")
});
var showContactModalEventSchema = z18.object({
  type: z18.literal("SHOW_CONTACT_MODAL")
});
var showConnectOverlayEventSchema = z18.object({
  type: z18.literal("SHOW_CONNECT_OVERLAY")
});
var authorizationCodeEventSchema = z18.object({
  type: z18.literal("AUTHORIZATION_CODE"),
  code: z18.string()
});
var routeChangeEventSchema = z18.object({
  type: z18.literal("ROUTE_CHANGE"),
  path: z18.string()
});
var cloudEventSchema = z18.discriminatedUnion("type", [
  appRouteChangeEventSchema,
  authSuccessEventSchema,
  authErrorEventSchema,
  mcpConnectionStatusEventSchema,
  showOnboardingOverlayEventSchema,
  showSettingsOverlayEventSchema,
  onboardingSuccessSchema,
  navigateToUsageSchema,
  showContactModalEventSchema,
  showConnectOverlayEventSchema,
  authorizationCodeEventSchema,
  routeChangeEventSchema
]);

// node_modules/@insforge/shared-schemas/dist/docs.schema.js
import { z as z19 } from "zod";
var sdkFeatureSchema = z19.enum(["db", "storage", "functions", "auth", "ai", "realtime"]).describe(`
    SDK feature categories:

    - "db" - Database operations
    - "storage" - File storage
    - "functions" - Edge functions
    - "auth" - User authentication
    - "ai" - AI features
    - "realtime" - Real-time WebSockets
    `);
var sdkLanguageSchema = z19.enum([
  "typescript",
  "swift",
  "kotlin",
  // 'flutter',
  "rest-api"
]).describe(`
    SDK languages:

    - "typescript" - JavaScript/TypeScript SDK
    - "swift" - Swift SDK
    - "kotlin" - Kotlin SDK
    - "rest-api" - REST API
    `);
var docTypeSchema = z19.enum([
  "instructions",
  "auth-sdk",
  "db-sdk",
  "storage-sdk",
  "functions-sdk",
  "ai-integration-sdk",
  "auth-components-react",
  "auth-components-nextjs",
  "real-time",
  "deployment"
]).describe(`
    Documentation type:
      "instructions" (essential backend setup - use FIRST),
      "db-sdk" (database operations),
      "storage-sdk" (file storage),
      "functions-sdk" (edge functions),
      "auth-sdk" (direct SDK methods for custom auth flows),
      "auth-components-react" (authentication components for React+Vite applications),
      "auth-components-nextjs" (authentication components for Next.js applications),
      "ai-integration-sdk" (AI features),
      "real-time" (real-time pub/sub through WebSockets),
      "deployment" (deploy frontend applications via MCP tool)
    `);

// node_modules/@insforge/shared-schemas/dist/email-api.schema.js
import { z as z20 } from "zod";
var emailOrEmails = z20.union([
  emailSchema,
  z20.array(emailSchema).min(1, "At least one email is required").max(50, "Maximum 50 recipients allowed")
]);
var sendRawEmailRequestSchema = z20.object({
  to: emailOrEmails,
  subject: z20.string().trim().min(1, "Subject is required").max(500, "Subject too long"),
  html: z20.string().trim().min(1, "HTML content is required"),
  cc: emailOrEmails.optional(),
  bcc: emailOrEmails.optional(),
  from: z20.string().trim().max(100, "From name too long").optional(),
  replyTo: z20.string().email("Reply-To must be a valid email").optional()
});
var sendEmailResponseSchema = z20.object({});

// node_modules/@insforge/shared-schemas/dist/deployments.schema.js
import { z as z21 } from "zod";
var deploymentStatusSchema = z21.enum([
  "WAITING",
  // Record created, waiting for client to upload zip to S3
  "UPLOADING",
  // Server is downloading from S3 and uploading to Vercel
  "QUEUED",
  // Vercel: deployment queued
  "BUILDING",
  // Vercel: deployment building
  "READY",
  // Vercel: deployment ready
  "ERROR",
  // Vercel: deployment failed
  "CANCELED"
  // Vercel: deployment canceled
]);
var deploymentSchema = z21.object({
  id: z21.string().uuid(),
  providerDeploymentId: z21.string().nullable(),
  // Provider's deployment ID, null until deployment starts
  provider: z21.string(),
  status: deploymentStatusSchema,
  url: z21.string().nullable(),
  metadata: z21.record(z21.unknown()).nullable(),
  createdAt: z21.string().datetime(),
  updatedAt: z21.string().datetime()
});

// node_modules/@insforge/shared-schemas/dist/deployments-api.schema.js
import { z as z22 } from "zod";
var projectSettingsSchema = z22.object({
  buildCommand: z22.string().nullable().optional(),
  outputDirectory: z22.string().nullable().optional(),
  installCommand: z22.string().nullable().optional(),
  devCommand: z22.string().nullable().optional(),
  rootDirectory: z22.string().nullable().optional()
});
var envVarSchema = z22.object({
  key: z22.string(),
  value: z22.string()
});
var createDeploymentResponseSchema = z22.object({
  id: z22.string().uuid(),
  uploadUrl: z22.string().url(),
  uploadFields: z22.record(z22.string())
  // Required for S3 presigned POST (policy, signature, key, etc.)
});
var startDeploymentRequestSchema = z22.object({
  projectSettings: projectSettingsSchema.optional(),
  envVars: z22.array(envVarSchema).optional(),
  meta: z22.record(z22.string()).optional()
});
var listDeploymentsResponseSchema = z22.object({
  data: z22.array(deploymentSchema),
  pagination: z22.object({
    limit: z22.number(),
    offset: z22.number(),
    total: z22.number()
  })
});

// src/shared/tools.ts
import FormData from "form-data";
var execAsync = promisify(exec);
var TOOL_VERSION_REQUIREMENTS = {
  // Schedule tools - require backend v1.1.1+
  // 'upsert-schedule': { minVersion: '1.1.1' },
  // 'delete-schedule': { minVersion: '1.1.1' },
  // 'get-schedules': { minVersion: '1.1.1' },
  // 'get-schedule-logs': { minVersion: '1.1.1' },
  "create-deployment": { minVersion: "1.4.7" },
  "fetch-sdk-docs": { minVersion: "1.5.1" }
  // Example of a deprecated tool (uncomment when needed):
  // 'legacy-tool': { minVersion: '1.0.0', maxVersion: '1.5.0' },
};
function compareVersions(v1, v2) {
  const clean1 = v1.replace(/^v/, "").split("-")[0];
  const clean2 = v2.replace(/^v/, "").split("-")[0];
  const parts1 = clean1.split(".").map(Number);
  const parts2 = clean2.split(".").map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  return 0;
}
function shouldRegisterTool(toolName, backendVersion) {
  const requirement = TOOL_VERSION_REQUIREMENTS[toolName];
  if (!requirement) {
    return true;
  }
  const { minVersion, maxVersion } = requirement;
  if (minVersion && compareVersions(backendVersion, minVersion) < 0) {
    return false;
  }
  if (maxVersion && compareVersions(backendVersion, maxVersion) > 0) {
    return false;
  }
  return true;
}
async function fetchBackendVersion(apiBaseUrl) {
  const response = await fetch2(`${apiBaseUrl}/api/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  const health = await response.json();
  return health.version;
}
async function registerInsforgeTools(server, config = {}) {
  const GLOBAL_API_KEY = config.apiKey || process.env.API_KEY || "";
  const API_BASE_URL = config.apiBaseUrl || process.env.API_BASE_URL || "http://localhost:7130";
  const usageTracker = new UsageTracker(API_BASE_URL, GLOBAL_API_KEY);
  const backendVersion = await fetchBackendVersion(API_BASE_URL);
  console.error(`Backend version: ${backendVersion}`);
  let toolCount = 0;
  const registerTool = (toolName, ...args) => {
    if (shouldRegisterTool(toolName, backendVersion)) {
      server.tool(toolName, ...args);
      toolCount++;
      return true;
    } else {
      const req = TOOL_VERSION_REQUIREMENTS[toolName];
      const reason = req?.minVersion && compareVersions(backendVersion, req.minVersion) < 0 ? `requires backend >= ${req.minVersion}` : `deprecated after backend ${req?.maxVersion}`;
      console.error(`Skipping tool '${toolName}': ${reason} (current: ${backendVersion})`);
      return false;
    }
  };
  async function trackToolUsage(toolName, success = true) {
    if (GLOBAL_API_KEY) {
      await usageTracker.trackUsage(toolName, success);
    }
  }
  function withUsageTracking(toolName, handler) {
    return async (...args) => {
      try {
        const result = await handler(...args);
        await trackToolUsage(toolName, true);
        return result;
      } catch (error) {
        await trackToolUsage(toolName, false);
        throw error;
      }
    };
  }
  const getApiKey = (_toolApiKey) => {
    if (!GLOBAL_API_KEY) {
      throw new Error("API key is required. Pass --api_key when starting the MCP server.");
    }
    return GLOBAL_API_KEY;
  };
  const fetchDocumentation = async (docType) => {
    try {
      const response = await fetch2(`${API_BASE_URL}/api/docs/${docType}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.status === 404) {
        throw new Error("Documentation not found. This feature may not be supported in your project version. Please contact the Insforge team for assistance.");
      }
      const result = await handleApiResponse(response);
      if (result && typeof result === "object" && "content" in result) {
        let content = result.content;
        content = content.replace(/http:\/\/localhost:7130/g, API_BASE_URL);
        content = content.replace(/https:\/\/your-app\.region\.insforge\.app/g, API_BASE_URL);
        content = content.replace(/https:\/\/your-app\.insforge\.app/g, API_BASE_URL);
        return content;
      }
      throw new Error("Invalid response format from documentation endpoint");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Unable to retrieve ${docType} documentation: ${errMsg}`);
    }
  };
  const fetchSDKDocumentation = async (feature, language) => {
    try {
      const response = await fetch2(`${API_BASE_URL}/api/docs/${feature}/${language}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.status === 404) {
        throw new Error("Documentation not found. This feature may not be supported in your project version. Please contact the Insforge team for assistance.");
      }
      const result = await handleApiResponse(response);
      if (result && typeof result === "object" && "content" in result) {
        let content = result.content;
        content = content.replace(/http:\/\/localhost:7130/g, API_BASE_URL);
        content = content.replace(/https:\/\/your-app\.region\.insforge\.app/g, API_BASE_URL);
        content = content.replace(/https:\/\/your-app\.insforge\.app/g, API_BASE_URL);
        return content;
      }
      throw new Error("Invalid response format from documentation endpoint");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Unable to retrieve ${feature}-${language} documentation: ${errMsg}`);
    }
  };
  const fetchInsforgeInstructionsContext = async () => {
    try {
      return await fetchDocumentation("instructions");
    } catch (error) {
      console.error("Failed to fetch insforge-instructions.md:", error);
      return null;
    }
  };
  const addBackgroundContext = async (response) => {
    const isLegacyVersion = compareVersions(backendVersion, "1.1.7") < 0;
    if (isLegacyVersion) {
      const context = await fetchInsforgeInstructionsContext();
      if (context && response.content && Array.isArray(response.content)) {
        response.content.push({
          type: "text",
          text: `

---
\u{1F527} INSFORGE DEVELOPMENT RULES (Auto-loaded):
${context}`
        });
      }
    }
    return response;
  };
  registerTool(
    "fetch-docs",
    'Fetch Insforge documentation. Use "instructions" for essential backend setup (MANDATORY FIRST), or select specific SDK docs for database, auth, storage, functions, or AI integration.',
    {
      docType: docTypeSchema
    },
    withUsageTracking("fetch-docs", async ({ docType }) => {
      try {
        const content = await fetchDocumentation(docType);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: content
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
          return {
            content: [{
              type: "text",
              text: `Documentation for "${docType}" is not available. This is likely because your backend version is too old and doesn't support this documentation endpoint yet. This won't affect the functionality of the tools - they will still work correctly.`
            }]
          };
        }
        return {
          content: [{ type: "text", text: `Error fetching ${docType} documentation: ${errMsg}` }]
        };
      }
    })
  );
  registerTool(
    "fetch-sdk-docs",
    `Fetch Insforge SDK documentation for a specific feature and language combination.

Supported features: ${sdkFeatureSchema.options.join(", ")}
Supported languages: ${sdkLanguageSchema.options.join(", ")}`,
    {
      sdkFeature: sdkFeatureSchema,
      sdkLanguage: sdkLanguageSchema
    },
    withUsageTracking("fetch-sdk-docs", async ({ sdkFeature, sdkLanguage }) => {
      try {
        const content = await fetchSDKDocumentation(sdkFeature, sdkLanguage);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: content
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        if (errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
          return {
            content: [{
              type: "text",
              text: `Documentation for "${sdkFeature}-${sdkLanguage}" is not available. This is likely because your backend version is too old and doesn't support this documentation endpoint yet. This won't affect the functionality of the tools - they will still work correctly.`
            }]
          };
        }
        return {
          content: [{ type: "text", text: `Error fetching ${sdkFeature}-${sdkLanguage} documentation: ${errMsg}` }]
        };
      }
    })
  );
  registerTool(
    "get-anon-key",
    "Generate an anonymous JWT token that never expires. Requires admin API key. Use this for client-side applications that need public access.",
    {
      apiKey: z23.string().optional().describe("API key for authentication (optional if provided via --api_key)")
    },
    withUsageTracking("get-anon-key", async ({ apiKey }) => {
      try {
        const actualApiKey = getApiKey(apiKey);
        const response = await fetch2(`${API_BASE_URL}/api/auth/tokens/anon`, {
          method: "POST",
          headers: {
            "x-api-key": actualApiKey,
            "Content-Type": "application/json"
          }
        });
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage("Anonymous token generated", result)
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error generating anonymous token: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "get-table-schema",
    "Returns the detailed schema(including RLS, indexes, constraints, etc.) of a specific table",
    {
      apiKey: z23.string().optional().describe("API key for authentication (optional if provided via --api_key)"),
      tableName: z23.string().describe("Name of the table")
    },
    withUsageTracking("get-table-schema", async ({ apiKey, tableName }) => {
      try {
        const actualApiKey = getApiKey(apiKey);
        const response = await fetch2(`${API_BASE_URL}/api/metadata/${tableName}`, {
          method: "GET",
          headers: {
            "x-api-key": actualApiKey
          }
        });
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage("Schema retrieved", result)
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error getting table schema: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "get-backend-metadata",
    "Index all backend metadata",
    {
      apiKey: z23.string().optional().describe("API key for authentication (optional if provided via --api_key)")
    },
    withUsageTracking("get-backend-metadata", async ({ apiKey }) => {
      try {
        const actualApiKey = getApiKey(apiKey);
        const response = await fetch2(`${API_BASE_URL}/api/metadata?mcp=true`, {
          method: "GET",
          headers: {
            "x-api-key": actualApiKey
          }
        });
        const metadata = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: `Backend metadata:

${JSON.stringify(metadata, null, 2)}`
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving backend metadata: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "run-raw-sql",
    "Execute raw SQL query with optional parameters. Admin access required. Use with caution as it can modify data directly.",
    {
      apiKey: z23.string().optional().describe("API key for authentication (optional if provided via --api_key)"),
      ...rawSQLRequestSchema.shape
    },
    withUsageTracking("run-raw-sql", async ({ apiKey, query, params }) => {
      try {
        const actualApiKey = getApiKey(apiKey);
        const requestBody = {
          query,
          params: params || []
        };
        const response = await fetch2(`${API_BASE_URL}/api/database/advance/rawsql`, {
          method: "POST",
          headers: {
            "x-api-key": actualApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage("SQL query executed", result)
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error executing SQL query: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "download-template",
    "CRITICAL: MANDATORY FIRST STEP for all new InsForge projects. Download pre-configured starter template to a temporary directory. After download, you MUST copy files to current directory using the provided command.",
    {
      frame: z23.enum(["react", "nextjs"]).describe("Framework to use for the template (support React and Next.js)"),
      projectName: z23.string().optional().describe('Name for the project directory (optional, defaults to "insforge-react")')
    },
    withUsageTracking("download-template", async ({ frame, projectName }) => {
      try {
        const response = await fetch2(`${API_BASE_URL}/api/auth/tokens/anon`, {
          method: "POST",
          headers: {
            "x-api-key": getApiKey(),
            "Content-Type": "application/json"
          }
        });
        const result = await handleApiResponse(response);
        const anonKey = result.accessToken;
        if (!anonKey) {
          throw new Error("Failed to retrieve anon key from backend");
        }
        const tempDir = tmpdir();
        const targetDir = projectName || `insforge-${frame}`;
        const templatePath = `${tempDir}/${targetDir}`;
        console.error(`[download-template] Target path: ${templatePath}`);
        try {
          const stats = await fs.stat(templatePath);
          if (stats.isDirectory()) {
            console.error(`[download-template] Removing existing template at ${templatePath}`);
            await fs.rm(templatePath, { recursive: true, force: true });
          }
        } catch {
        }
        const command = `npx create-insforge-app ${targetDir} --frame ${frame} --base-url ${API_BASE_URL} --anon-key ${anonKey} --skip-install`;
        const { stdout, stderr } = await execAsync(command, {
          maxBuffer: 10 * 1024 * 1024,
          // 10MB buffer
          cwd: tempDir
        });
        const output = stdout || stderr || "";
        if (output.toLowerCase().includes("error") && !output.includes("successfully")) {
          throw new Error(`Failed to download template: ${output}`);
        }
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: `\u2705 React template downloaded successfully

\u{1F4C1} Template Location: ${templatePath}

\u26A0\uFE0F  IMPORTANT: The template is in a temporary directory and NOT in your current working directory.

\u{1F534} CRITICAL NEXT STEP REQUIRED:
You MUST copy ALL files (INCLUDING HIDDEN FILES like .env, .gitignore, etc.) from the temporary directory to your current project directory.

Copy all files from: ${templatePath}
To: Your current project directory
`
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error downloading template: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "bulk-upsert",
    "Bulk insert or update data from CSV or JSON file. Supports upsert operations with a unique key.",
    {
      apiKey: z23.string().optional().describe("API key for authentication (optional if provided via --api_key)"),
      ...bulkUpsertRequestSchema.shape,
      filePath: z23.string().describe("Path to CSV or JSON file containing data to import")
    },
    withUsageTracking("bulk-upsert", async ({ apiKey, table, filePath, upsertKey }) => {
      try {
        const actualApiKey = getApiKey(apiKey);
        const fileBuffer = await fs.readFile(filePath);
        const fileName = filePath.split("/").pop() || "data.csv";
        const formData = new FormData();
        formData.append("file", fileBuffer, fileName);
        formData.append("table", table);
        if (upsertKey) {
          formData.append("upsertKey", upsertKey);
        }
        const response = await fetch2(`${API_BASE_URL}/api/database/advance/bulk-upsert`, {
          method: "POST",
          headers: {
            "x-api-key": actualApiKey,
            ...formData.getHeaders()
          },
          body: formData
        });
        const result = await handleApiResponse(response);
        const message = result.success ? `Successfully processed ${result.rowsAffected} of ${result.totalRecords} records into table "${result.table}"` : result.message || "Bulk upsert operation completed";
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage("Bulk upsert completed", {
                message,
                table: result.table,
                rowsAffected: result.rowsAffected,
                totalRecords: result.totalRecords,
                errors: result.errors
              })
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error performing bulk upsert: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "create-bucket",
    "Create new storage bucket",
    {
      apiKey: z23.string().optional().describe("API key for authentication (optional if provided via --api_key)"),
      ...createBucketRequestSchema.shape
    },
    withUsageTracking("create-bucket", async ({ apiKey, bucketName, isPublic }) => {
      try {
        const actualApiKey = getApiKey(apiKey);
        const response = await fetch2(`${API_BASE_URL}/api/storage/buckets`, {
          method: "POST",
          headers: {
            "x-api-key": actualApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ bucketName, isPublic })
        });
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage("Bucket created", result)
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error creating bucket: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "list-buckets",
    "Lists all storage buckets",
    {},
    withUsageTracking("list-buckets", async () => {
      try {
        const response = await fetch2(`${API_BASE_URL}/api/storage/buckets`, {
          method: "GET",
          headers: {
            "x-api-key": getApiKey()
          }
        });
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage("Buckets retrieved", result)
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error listing buckets: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "delete-bucket",
    "Deletes a storage bucket",
    {
      apiKey: z23.string().optional().describe("API key for authentication (optional if provided via --api_key)"),
      bucketName: z23.string().describe("Name of the bucket to delete")
    },
    withUsageTracking("delete-bucket", async ({ apiKey, bucketName }) => {
      try {
        const actualApiKey = getApiKey(apiKey);
        const response = await fetch2(`${API_BASE_URL}/api/storage/buckets/${bucketName}`, {
          method: "DELETE",
          headers: {
            "x-api-key": actualApiKey
          }
        });
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage("Bucket deleted", result)
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error deleting bucket: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "create-function",
    "Create a new edge function that runs in Deno runtime. The code must be written to a file first for version control",
    {
      ...uploadFunctionRequestSchema.omit({ code: true }).shape,
      codeFile: z23.string().describe(
        "Path to JavaScript file containing the function code. Must export: module.exports = async function(request) { return new Response(...) }"
      )
    },
    withUsageTracking("create-function", async (args) => {
      try {
        let code;
        try {
          code = await fs.readFile(args.codeFile, "utf-8");
        } catch (fileError) {
          throw new Error(
            `Failed to read code file '${args.codeFile}': ${fileError instanceof Error ? fileError.message : "Unknown error"}`
          );
        }
        const response = await fetch2(`${API_BASE_URL}/api/functions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": getApiKey()
          },
          body: JSON.stringify({
            slug: args.slug,
            name: args.name,
            code,
            description: args.description,
            status: args.status
          })
        });
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage(
                `Edge function '${args.slug}' created successfully from ${args.codeFile}`,
                result
              )
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error creating function: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "get-function",
    "Get details of a specific edge function including its code",
    {
      slug: z23.string().describe("The slug identifier of the function")
    },
    withUsageTracking("get-function", async (args) => {
      try {
        const response = await fetch2(`${API_BASE_URL}/api/functions/${args.slug}`, {
          method: "GET",
          headers: {
            "x-api-key": getApiKey()
          }
        });
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage(`Edge function '${args.slug}' details`, result)
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error getting function: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "update-function",
    "Update an existing edge function code or metadata",
    {
      slug: z23.string().describe("The slug identifier of the function to update"),
      ...updateFunctionRequestSchema.omit({ code: true }).shape,
      codeFile: z23.string().optional().describe(
        "Path to JavaScript file containing the new function code. Must export: module.exports = async function(request) { return new Response(...) }"
      )
    },
    withUsageTracking("update-function", async (args) => {
      try {
        const updateData = {};
        if (args.name) {
          updateData.name = args.name;
        }
        if (args.codeFile) {
          try {
            updateData.code = await fs.readFile(args.codeFile, "utf-8");
          } catch (fileError) {
            throw new Error(
              `Failed to read code file '${args.codeFile}': ${fileError instanceof Error ? fileError.message : "Unknown error"}`
            );
          }
        }
        if (args.description !== void 0) {
          updateData.description = args.description;
        }
        if (args.status) {
          updateData.status = args.status;
        }
        const response = await fetch2(`${API_BASE_URL}/api/functions/${args.slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": getApiKey()
          },
          body: JSON.stringify(updateData)
        });
        const result = await handleApiResponse(response);
        const fileInfo = args.codeFile ? ` from ${args.codeFile}` : "";
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage(
                `Edge function '${args.slug}' updated successfully${fileInfo}`,
                result
              )
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error updating function: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "delete-function",
    "Delete an edge function permanently",
    {
      slug: z23.string().describe("The slug identifier of the function to delete")
    },
    withUsageTracking("delete-function", async (args) => {
      try {
        const response = await fetch2(`${API_BASE_URL}/api/functions/${args.slug}`, {
          method: "DELETE",
          headers: {
            "x-api-key": getApiKey()
          }
        });
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage(`Edge function '${args.slug}' deleted successfully`, result)
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error deleting function: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "get-container-logs",
    "Get latest logs from a specific container/service. Use this to help debug problems with your app.",
    {
      apiKey: z23.string().optional().describe("API key for authentication (optional if provided via --api_key)"),
      source: z23.enum(["insforge.logs", "postgREST.logs", "postgres.logs", "function.logs"]).describe("Log source to retrieve"),
      limit: z23.number().optional().default(20).describe("Number of logs to return (default: 20)")
    },
    withUsageTracking("get-container-logs", async ({ apiKey, source, limit }) => {
      try {
        const actualApiKey = getApiKey(apiKey);
        const queryParams = new URLSearchParams();
        if (limit) queryParams.append("limit", limit.toString());
        let response = await fetch2(`${API_BASE_URL}/api/logs/${source}?${queryParams}`, {
          method: "GET",
          headers: {
            "x-api-key": actualApiKey
          }
        });
        if (response.status === 404) {
          response = await fetch2(`${API_BASE_URL}/api/logs/analytics/${source}?${queryParams}`, {
            method: "GET",
            headers: {
              "x-api-key": actualApiKey
            }
          });
        }
        const result = await handleApiResponse(response);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage(`Latest logs from ${source}`, result)
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving container logs: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  registerTool(
    "create-deployment",
    "Deploy source code from a directory. This tool zips files, uploads to cloud storage, and triggers deployment with optional environment variables and project settings.",
    {
      sourceDirectory: z23.string().describe('Absolute path to the source directory containing files to deploy (e.g., /Users/name/project or C:\\Users\\name\\project). Do not use relative paths like "."'),
      ...startDeploymentRequestSchema.shape
    },
    withUsageTracking("create-deployment", async ({ sourceDirectory, projectSettings, envVars, meta }) => {
      try {
        const isAbsolutePath = sourceDirectory.startsWith("/") || /^[a-zA-Z]:[/\\]/.test(sourceDirectory);
        if (!isAbsolutePath) {
          return {
            content: [
              {
                type: "text",
                text: `Error: sourceDirectory must be an absolute path, not a relative path like "${sourceDirectory}". Please provide the full path to the source directory (e.g., /Users/name/project on macOS/Linux or C:\\Users\\name\\project on Windows).`
              }
            ],
            isError: true
          };
        }
        try {
          const stats = await fs.stat(sourceDirectory);
          if (!stats.isDirectory()) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error: "${sourceDirectory}" is not a directory. Please provide a path to a directory containing the source code.`
                }
              ],
              isError: true
            };
          }
        } catch (statError) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Directory "${sourceDirectory}" does not exist or is not accessible. Please verify the path is correct.`
              }
            ],
            isError: true
          };
        }
        const resolvedSourceDir = sourceDirectory;
        const createResponse = await fetch2(`${API_BASE_URL}/api/deployments`, {
          method: "POST",
          headers: {
            "x-api-key": getApiKey(),
            "Content-Type": "application/json"
          }
        });
        const createResult = await handleApiResponse(createResponse);
        const { id: deploymentId, uploadUrl, uploadFields } = createResult;
        const zipBuffer = await new Promise((resolve, reject) => {
          const archive = archiver("zip", { zlib: { level: 9 } });
          const chunks = [];
          archive.on("data", (chunk) => chunks.push(chunk));
          archive.on("end", () => resolve(Buffer.concat(chunks)));
          archive.on("error", (err) => reject(err));
          const excludePatterns = [
            "node_modules",
            ".git",
            ".next",
            ".env",
            ".env.local",
            "dist",
            "build",
            ".DS_Store"
          ];
          archive.directory(resolvedSourceDir, false, (entry) => {
            const normalizedName = entry.name.replace(/\\/g, "/");
            for (const pattern of excludePatterns) {
              if (normalizedName.startsWith(pattern + "/") || normalizedName === pattern || normalizedName.endsWith("/" + pattern) || normalizedName.includes("/" + pattern + "/")) {
                return false;
              }
            }
            if (normalizedName.endsWith(".log")) {
              return false;
            }
            return entry;
          });
          archive.finalize();
        });
        const uploadFormData = new FormData();
        for (const [key, value] of Object.entries(uploadFields)) {
          uploadFormData.append(key, value);
        }
        uploadFormData.append("file", zipBuffer, {
          filename: "deployment.zip",
          contentType: "application/zip"
        });
        const uploadResponse = await fetch2(uploadUrl, {
          method: "POST",
          body: uploadFormData,
          headers: uploadFormData.getHeaders()
        });
        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.text();
          throw new Error(`Failed to upload zip file: ${uploadError}`);
        }
        const startBody = {};
        if (projectSettings) startBody.projectSettings = projectSettings;
        if (envVars) startBody.envVars = envVars;
        if (meta) startBody.meta = meta;
        const startResponse = await fetch2(`${API_BASE_URL}/api/deployments/${deploymentId}/start`, {
          method: "POST",
          headers: {
            "x-api-key": getApiKey(),
            "Content-Type": "application/json"
          },
          body: JSON.stringify(startBody)
        });
        const startResult = await handleApiResponse(startResponse);
        return await addBackgroundContext({
          content: [
            {
              type: "text",
              text: formatSuccessMessage("Deployment started", startResult) + "\n\nNote: You can check deployment status by querying the system.deployments table."
            }
          ]
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
        return {
          content: [
            {
              type: "text",
              text: `Error creating deployment: ${errMsg}`
            }
          ],
          isError: true
        };
      }
    })
  );
  return {
    apiKey: GLOBAL_API_KEY,
    apiBaseUrl: API_BASE_URL,
    toolCount,
    backendVersion
  };
}

export {
  registerInsforgeTools
};
