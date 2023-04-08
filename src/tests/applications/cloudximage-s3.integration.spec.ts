import { randomUUID } from "node:crypto";
import path from "node:path";
import FormData from "form-data";
import { createReadStream } from "fs";
import { S3Client, ListObjectsCommandInput, ListObjectsCommand, ListObjectsCommandOutput } from "@aws-sdk/client-s3";
import { Request, Response } from "../../core";
import cloudximage from "../../data/cloudximage.data";

const s3Client = new S3Client({ region: process.env.AWS_DEFAULT_REGION });

const appEndpoint = `http://${cloudximage.AppInstance.PublicDns}`;
const image = `reactivejs.jpeg`;
const filepath = path.join(__dirname, "..", "..", "data", "images", image);
const upFileName = randomUUID().slice(-9) + path.basename(filepath.toString());

describe("cloudximage", () => {
    let s3ObjectsListResponse: ListObjectsCommandOutput;
    let request: Request;
    let response: Response;
    let appImageList;
    let sssImageList;
    let s3Image;

    /** Disclaimer: All the integration tests are written as depended tests in order of calling */
    describe("REST ft S3 Integration", () => {
        describe("Verify Image List", () => {
            beforeAll(async () => {
                try {
                    const input: ListObjectsCommandInput = {
                        Bucket: cloudximage.S3.StoreBucketName,
                    };
                    const command = new ListObjectsCommand(input);
                    s3ObjectsListResponse = await s3Client.send(command);
                    sssImageList = s3ObjectsListResponse.Contents;
                } catch (error) {
                    throw `Error during sending request to S3Client: ${error.message}`;
                }
            });

            beforeAll(async () => {
                try {
                    request = new Request(appEndpoint);
                    response = await request.method("get").appendPath("/api/image").send();
                    appImageList = response.body();
                } catch (error) {
                    throw `Error during sending request to REST API: ${error.message}`;
                }
            });

            it("should have the same number of images", async () => {
                expect(sssImageList.length).toBe(appImageList.length);
            });
        });

        describe("Verify Image Upload", () => {
            beforeAll(async () => {
                try {
                    const form = new FormData();
                    form.append("upfile", createReadStream(filepath), upFileName);
                    request = new Request(appEndpoint);
                    response = await request
                        .method("post")
                        .headers({ "Content-Type": "multipart/form-data" })
                        .appendPath("/api/image")
                        .body(form)
                        .send();
                } catch (error) {
                    throw `Error during sending request to REST API: ${error.message}`;
                }
            });

            beforeAll(async () => {
                try {
                    const input: ListObjectsCommandInput = {
                        Bucket: cloudximage.S3.StoreBucketName,
                    };
                    const command = new ListObjectsCommand(input);
                    s3ObjectsListResponse = await s3Client.send(command);
                    sssImageList = s3ObjectsListResponse.Contents;
                } catch (error) {
                    throw `Error during sending request to S3Client: ${error.message}`;
                }
                try {
                    /** [{ "id": 1,
                     *     "last_modified": "2023-04-07T09:54:43Z",
                     *     "object_key": "images/919b025e-d4d7-4133-ab6b-864c459f7f54-Sberbank-ai.jpg",
                     *     "object_size": 557066,
                     *     "object_type": "binary/octet-stream" }]
                     */
                    s3Image = sssImageList.find(({ Key }) => Key.endsWith(upFileName));
                } catch (error) {
                    throw `Error during sending request to S3Client: ${error.message}`;
                }
            });

            it("REST API response should have expected status", async () => {
                expect(response.status()).toBe(204);
                expect(response.statusText()).toBe("NO CONTENT");
            });

            it("S3 Image list should be updated", async () => {
                expect(sssImageList.length).toBeGreaterThan(appImageList.length);
                expect(sssImageList.length).toBe(appImageList.length + 1);
            });

            it("Image ends with expected name", async () => {
                expect(s3Image).not.toBeUndefined();
                expect(s3Image.Key.endsWith(upFileName)).toBeTruthy();
            });
        });
    });
});
