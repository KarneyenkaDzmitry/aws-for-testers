import { Request, Response } from "../../core";
import cloudxinfo from "../../data/cloudxinfo.data";

describe("Application: cloudxinfo", () => {
    let request: Request;
    let response: Response;

    it("should return expected result", async () => {
        request = new Request(`http://${cloudxinfo.PublicInstance.PublicDns}`);
        response = await request.method("get").send();

        expect(response.status()).toBe(200);
        expect(response.statusText()).toBe("OK");
        const body = response.body();
        expect(body.region).toBe(process.env.AWS_DEFAULT_REGION);
        expect(body.availability_zone).toContain(process.env.AWS_DEFAULT_REGION);
        expect(body.private_ipv4).toBe(cloudxinfo.PublicInstance.PrivateIp);
    });

    it("should return Swagger API HTML document", async () => {
        request = new Request(`http://${cloudxinfo.PublicInstance.PublicDns}`);
        response = await request.method("get").appendPath("ui").send();

        expect(response.status()).toBe(200);
        expect(response.statusText()).toBe("OK");
    });
});
