import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";

interface ImageType {
  url: string;
  path: string;
}

const invalidateFileCache = async (filename: string) => {
  try {
    const path = [`/${filename}`];
    const cmd = new CreateInvalidationCommand({
      DistributionId: process.env.AWS_CLOUD_FONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: new Date().getTime().toString(),
        Paths: { Quantity: path.length, Items: path },
      },
    });
    await new CloudFrontClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESSKEYID as string,
        secretAccessKey: process.env.AWS_SECRETACCESSKEY as string,
      },
    }).send(cmd);
  } catch (error) {
    return false;
  }
};
export default class MediaService {
  constructor() {}

  async deleteMedia(key: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          Bucket: `${process.env.AWS_BUCKET_NAME}`,
          Key: key,
        };

        const deleteData = new DeleteObjectCommand({
          ...params,
        });
        // DELETE FROM S3 BUCKET
        await new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESSKEYID as string,
            secretAccessKey: process.env.AWS_SECRETACCESSKEY as string,
          },
        }).send(deleteData);
        // INVALIDATE THE CLOUD FRONT CACHE
        await invalidateFileCache(key);
        return resolve(true);
      } catch (error) {
        new Error();
        return resolve(false);
      }
    });
  }

  //delete multiple media
  public deleteMultipleMedia(paths: string[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        for (const path of paths) {
          const params = {
            Bucket: `${process.env.AWS_BUCKET_NAME}`,
            Key: path,
          };

          const deleteData = new DeleteObjectCommand({
            ...params,
          });
          // DELETE FROM S3 BUCKET
          await new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
              accessKeyId: process.env.AWS_ACCESSKEYID as string,
              secretAccessKey: process.env.AWS_SECRETACCESSKEY as string,
            },
          }).send(deleteData);
          // INVALIDATE THE CLOUD FRONT CACHE
          await invalidateFileCache(path);
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async uploadMedia(
    file: UploadedFile,
    dir?: string
  ): Promise<{ url: string; path: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const fileSplit = file.name.split(".");
        const fileType = fileSplit[fileSplit.length - 1];
        const fileName = `${new Date().getTime()}.${fileType}`;
        const params = {
          Bucket: `${process.env.AWS_BUCKET_NAME}`,
          Key: `${dir}/${fileName}`,
          Body: file?.data,
          ContentType: file.mimetype,
        };

        const objectSetUp = new PutObjectCommand({
          ...params,
        });
        const data = await new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESSKEYID as string,
            secretAccessKey: process.env.AWS_SECRETACCESSKEY as string,
          },
        }).send(objectSetUp);
        await invalidateFileCache(`${params?.Key}`);

        return resolve({
          path: `${params?.Key}`,
          url: `${process.env.AWS_CLOUD_FONT}/${params?.Key}`,
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  /** upload multiple media */
  public uploadMultipleMedia(
    files: UploadedFile[],
    folder?: string
  ): Promise<ImageType[]> {
    return new Promise(async (resolve, reject) => {
      try {
        let resultArray: ImageType[] = [];
        for (const file of files) {
          // upload media
          const fileSplit = file.name.split(".");
          const fileType = fileSplit[fileSplit.length - 1];
          const fileName = `${new Date().getTime()}.${fileType}`;
          const params = {
            Bucket: `${process.env.AWS_BUCKET_NAME}`,
            Key: `${uuidv4()}/${fileName}`,
            Body: file?.data,
            ContentType: file.mimetype,
          };

          const objectSetUp = new PutObjectCommand({
            ...params,
          });
          const data = await new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
              accessKeyId: process.env.AWS_ACCESSKEYID as string,
              secretAccessKey: process.env.AWS_SECRETACCESSKEY as string,
            },
          }).send(objectSetUp);
          await invalidateFileCache(`${params?.Key}`);

          // push result to result array
          resultArray.push({
            path: `${params?.Key}`,
            url: `${process.env.AWS_CLOUD_FONT}/${params?.Key}`,
          });
        }
        // send response to client
        resolve(resultArray);
      } catch (error) {
        reject(error);
      }
    });
  }

  public async uploadPdf({ file, dir }: { file: any; dir: string }): Promise<
    | {
        key: string;
        Location: string;
        allData: any;
      }
    | boolean
  > {
    return new Promise(async (resolve, reject) => {
      try {
        const fileName = `${new Date().getTime()}.pdf`;
        const params = {
          Bucket: `${process.env.AWS_BUCKET_NAME}`,
          Key: `${dir}/${fileName}`,
          Body: file,
          ContentType: "application/pdf",
        };

        const objectSetUp = new PutObjectCommand({
          ...params,
        });
        const data = await new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESSKEYID as string,
            secretAccessKey: process.env.AWS_SECRETACCESSKEY as string,
          },
        }).send(objectSetUp);
        await invalidateFileCache(`${params?.Key}`);

        return resolve({
          key: `${process.env.AWS_CLOUD_FONT}/${params?.Key}`,
          Location: `${params?.Key}`,
          allData: data,
        });
      } catch (error) {
        return resolve(false);
      }
    });
  }
}
