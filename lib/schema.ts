import {
  type KeySchemaElement,
  type AttributeDefinition,
  type GlobalSecondaryIndex,
} from "@aws-sdk/client-dynamodb";

export const TableName = {
  SERVICES: "services",
  USERS: "users",
  VOTINGS: "votings",
  VOTE_RECORDS: "vote-records",
  GIVEAWAYS: "giveaways",
  GIVEAWAY_WINNERS: "giveaway-winners",
  SETTINGS: "settings",
} as const;

export type TableName = (typeof TableName)[keyof typeof TableName];

export interface TableSchema {
  name: TableName;
  keySchema: KeySchemaElement[];
  attributeDefinitions: AttributeDefinition[];
  globalSecondaryIndexes?: GlobalSecondaryIndex[];
}

export const TABLE_SCHEMAS: Record<TableName, TableSchema> = {
  [TableName.SERVICES]: {
    name: TableName.SERVICES,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.USERS]: {
    name: TableName.USERS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "login", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "login-index",
        KeySchema: [{ AttributeName: "login", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.VOTINGS]: {
    name: TableName.VOTINGS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.VOTE_RECORDS]: {
    name: TableName.VOTE_RECORDS,
    keySchema: [
      { AttributeName: "votingId", KeyType: "HASH" },
      { AttributeName: "userId", KeyType: "RANGE" },
    ],
    attributeDefinitions: [
      { AttributeName: "votingId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
  },
  [TableName.GIVEAWAYS]: {
    name: TableName.GIVEAWAYS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.GIVEAWAY_WINNERS]: {
    name: TableName.GIVEAWAY_WINNERS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  [TableName.SETTINGS]: {
    name: TableName.SETTINGS,
    keySchema: [{ AttributeName: "key", KeyType: "HASH" }],
    attributeDefinitions: [{ AttributeName: "key", AttributeType: "S" }],
  },
};

export const TABLE_NAMES: TableName[] = Object.values(TableName);

export const IndexName = {
  SERVICES_STATUS: "status-index",
  USERS_LOGIN: "login-index",
  VOTINGS_STATUS: "status-index",
  GIVEAWAYS_STATUS: "status-index",
} as const;

export type IndexName = (typeof IndexName)[keyof typeof IndexName];
