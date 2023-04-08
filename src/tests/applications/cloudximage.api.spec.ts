import { Request, Response } from "../../core";
import cloudximage from "../../data/cloudximage.data";
import { execSync } from "node:child_process";
import FormData from "form-data";
import { createReadStream } from "fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const appHttpEndpoint = `http://${cloudximage.AppInstance.PublicDns}`;
const image = `reactivejs.jpeg`;
const filepath = path.join(__dirname, "..", "..", "data", "images", image);
const upFileName = randomUUID().slice(-9) + "-" + path.basename(filepath.toString());

describe("cloudximage", () => {
    let request: Request;
    let response: Response;

    describe("Access via HTTP and FQDN", () => {
        it("should return expected result via URL endpoint", async () => {
            request = new Request(appHttpEndpoint);
            response = await request.method("get").send();
            expect(response.status()).toBe(404);
            expect(response.statusText()).toBe("NOT FOUND");
        });

        it("should return Swagger API HTML document via URL endpoint", async () => {
            request = new Request(appHttpEndpoint);
            response = await request.method("get").appendPath("api/ui").send();

            expect(response.status()).toBe(200);
            expect(response.statusText()).toBe("OK");
        });

        it("should return expected result via FQDN endpoint ", async () => {
            const stdout = execSync(`curl --head ${cloudximage.AppInstance.PublicDns}`, { encoding: "utf-8" });
            expect(stdout.includes("404")).toBeTruthy();
            expect(stdout.includes("NOT FOUND")).toBeTruthy();
        });

        it("should return Swagger API HTML document via FQDN endpoint", async () => {
            const stdout = execSync(`curl --head ${cloudximage.AppInstance.PublicDns}/api/ui`, { encoding: "utf-8" });
            expect(stdout.includes("308 PERMANENT REDIRECT")).toBeTruthy();
        });
    });

    /** The second depends on the first one.*/
    describe("API", () => {
        let appImage;

        beforeEach(() => {
            request = new Request(appHttpEndpoint).appendPath("api");
        });

        it("[POST /image] should upload new image", async () => {
            const form = new FormData();
            form.append("upfile", createReadStream(filepath), upFileName);
            response = await request
                .method("post")
                .headers({ "Content-Type": "multipart/form-data" })
                .appendPath("image")
                .body(form)
                .send();
            expect(response.status()).toBe(204);
            expect(response.statusText()).toBe("NO CONTENT");
        });

        it("[GET /image] should return image list", async () => {
            response = await request.method("get").appendPath("image").send();
            expect(response.status()).toBe(200);
            expect(response.statusText()).toBe("OK");
            const content = response.body();
            expect(Array.isArray(content)).toBeTruthy();
            /** [{ "id": 1,
             *     "last_modified": "2023-04-07T09:54:43Z",
             *     "object_key": "images/919b025e-d4d7-4133-ab6b-864c459f7f54-Sberbank-ai.jpg",
             *     "object_size": 557066,
             *     "object_type": "binary/octet-stream" }]
             */
            appImage = content.find((elem) => elem.object_key.endsWith(upFileName));
            expect(appImage).not.toBeUndefined();
        });

        it("[GET /image/{image_id}] should return image by ID", async () => {
            response = await request.method("get").appendPath("image").appendPath(appImage.id).send();
            expect(response.status()).toBe(200);
            expect(response.statusText()).toBe("OK");
        });

        it("[GET /image/file/{image_id}] should return file by image ID", async () => {
            response = await request
                .method("get")
                .appendPath("image")
                .appendPath("file")
                .appendPath(appImage.id)
                .send();
            expect(response.status()).toBe(200);
            expect(response.statusText()).toBe("OK");
        });

        it("[DELETE /image/{image_id}] should delete image by ID", async () => {
            response = await request.method("delete").appendPath("image").appendPath(appImage.id).send();
            expect(response.status()).toBe(204);
            expect(response.statusText()).toBe("NO CONTENT");
        });
    });
});
