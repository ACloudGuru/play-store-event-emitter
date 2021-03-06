import { DynamoDB } from "aws-sdk";
import { Table, Entity } from "dynamodb-toolbox";

const DocumentClient = new DynamoDB.DocumentClient();

const ReleasesTable = new Table({
  name: process.env.ReleaseSnapshotsTableName || "Default",
  partitionKey: "releaseId",
  DocumentClient,
});

const ReleaseEntity = new Entity<Release>({
  name: "Release",
  attributes: {
    releaseId: {
      partitionKey: true,
      type: "string",
    },
    status: "string",
    userFraction: "number",
    versionCode: "string",
    versionName: "string",
    releaseTrack: "string",
  },
  table: ReleasesTable,
});

type ReleaseStatus =
  | "statusUnspecified"
  | "draft"
  | "inProgress"
  | "halted"
  | "completed";

export type Release = {
  releaseId: string;
  status: ReleaseStatus;
  userFraction: number;
  versionCode: string;
  versionName: string;
  releaseTrack: string;
};

export const makeReleaseRepository = () => {
  return {
    put: (release: Release) => {
      console.log(`Writing ${release.releaseId} to ${ReleasesTable.name}`);
      console.log(release);
      return ReleaseEntity.put(release);
    },
    decode: (item: any): Release | undefined => {
      if (!item) {
        return undefined;
      }
      const mappedItem = ReleaseEntity.parse(item);
      const parsedItem = DynamoDB.Converter.unmarshall(mappedItem) as Release;

      return parsedItem;
    },
  };
};
