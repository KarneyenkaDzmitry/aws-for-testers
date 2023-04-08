/** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/ */
import {
    S3Client,
    ListBucketsCommand,
    ListBucketsCommandInput,
    ListBucketsCommandOutput,
    GetBucketAclCommand,
    GetBucketAclCommandInput,
    GetBucketAclCommandOutput,
    GetBucketTaggingCommand,
    GetBucketTaggingCommandInput,
    GetBucketTaggingCommandOutput,
    GetBucketVersioningCommand,
    GetBucketVersioningCommandInput,
    GetBucketVersioningCommandOutput,
    GetBucketEncryptionCommand,
    GetBucketEncryptionCommandInput,
    GetBucketEncryptionCommandOutput,
    GetPublicAccessBlockCommand,
    GetPublicAccessBlockCommandInput,
    GetPublicAccessBlockCommandOutput,
} from "@aws-sdk/client-s3";
import cloudximage from "../../data/cloudximage.data";

const s3Client = new S3Client({ region: process.env.AWS_DEFAULT_REGION });

/**
 * The application is deployed in the public subnet and should be accessible by HTTP from the internet via an Internet gateway by public IP address and FQDN.
 * The application instance should be accessible by SSH protocol.
 * The application should have access to the S3 bucket via an IAM role.
 *
 * S3 bucket requirements:
 * Name: cloudximage-imagestorebucket{unique id}
 * Tags: cloudx
 * Encryption: disabled
 * Versioning: disabled
 * Public access: no
 */
describe("S3 Describe", () => {
    let s3ListBucketsResponse: ListBucketsCommandOutput;
    let s3BucketAclResponse: GetBucketAclCommandOutput;
    let s3BucketTaggingResponse: GetBucketTaggingCommandOutput;
    let s3BucketVersioningResponse: GetBucketVersioningCommandOutput;
    let s3BucketEncryptionResponse: GetBucketEncryptionCommandOutput;
    let s3PublicAccessBlockResponse: GetPublicAccessBlockCommandOutput;
    let s3Bucket;

    describe("S3 Bucket to store images", () => {
        beforeAll(async () => {
            try {
                const input: ListBucketsCommandInput = {};
                const command = new ListBucketsCommand(input);
                s3ListBucketsResponse = await s3Client.send(command);
            } catch (error) {
                throw `Error during sending request to S3Client: ${error.message}`;
            }
            try {
                s3Bucket = s3ListBucketsResponse.Buckets?.find(({ Name }) =>
                    Name.startsWith(cloudximage.S3.StoreBucketName),
                );
            } catch (error) {
                throw `Error during parsing response from S3Client: ${error.message}`;
            }
        });

        it("should be found in Buckets list", async () => {
            expect(s3Bucket).not.toBeUndefined();
        });
    });

    describe("S3 Bucket to store images: ACL", () => {
        beforeAll(async () => {
            try {
                const input: GetBucketAclCommandInput = { Bucket: cloudximage.S3.StoreBucketName };
                const command = new GetBucketAclCommand(input);
                s3BucketAclResponse = await s3Client.send(command);
            } catch (error) {
                throw `Error during sending request to S3Client: ${error.message}`;
            }
        });

        it("should have only one Grantee (Owner) with FULL_CONTROL permissions", async () => {
            expect(s3BucketAclResponse.Grants?.length).toBe(1);
            const grantee = s3BucketAclResponse.Grants ? s3BucketAclResponse.Grants[0] : {};
            expect(grantee.Permission).toBe("FULL_CONTROL");
            expect(grantee.Grantee?.Type).toBe("CanonicalUser");
            expect(grantee.Grantee?.ID).toBe(s3BucketAclResponse.Owner?.ID);
        });
    });

    describe("S3 Bucket to store images: Tagging", () => {
        beforeAll(async () => {
            try {
                const input: GetBucketTaggingCommandInput = { Bucket: cloudximage.S3.StoreBucketName };
                const command = new GetBucketTaggingCommand(input);
                s3BucketTaggingResponse = await s3Client.send(command);
            } catch (error) {
                throw `Error during sending request to S3Client: ${error.message}`;
            }
        });

        it(`should have expected [cloudx] Tag`, async () => {
            expect(s3BucketTaggingResponse).not.toBeUndefined();
            const Tag = s3BucketTaggingResponse.TagSet?.find(({ Key }) => {
                return Key === "cloudx";
            });
            expect(Tag.Value).toBe("qa");
        });

        it(`should have expected [aws:cloudformation:stack-name] Tag`, async () => {
            expect(s3BucketTaggingResponse).not.toBeUndefined();
            const Tag = s3BucketTaggingResponse.TagSet?.find(({ Key }) => {
                return Key === "aws:cloudformation:stack-name";
            });
            expect(Tag.Value).toBe("cloudximage");
        });
    });

    it("S3 Bucket to store images: Versioning", async () => {
        try {
            const input: GetBucketVersioningCommandInput = { Bucket: cloudximage.S3.StoreBucketName };
            const command = new GetBucketVersioningCommand(input);
            s3BucketVersioningResponse = await s3Client.send(command);

            expect(s3BucketVersioningResponse.Status).toBeUndefined();
            expect(s3BucketVersioningResponse.MFADelete).toBeUndefined();
        } catch (error) {
            throw `Error during sending request to S3Client: ${error.message}`;
        }
    });

    it("S3 Bucket to store images: Encryption", async () => {
        try {
            const input: GetBucketEncryptionCommandInput = { Bucket: cloudximage.S3.StoreBucketName };
            const command = new GetBucketEncryptionCommand(input);
            s3BucketEncryptionResponse = await s3Client.send(command);

            const rules = s3BucketEncryptionResponse.ServerSideEncryptionConfiguration?.Rules;
            const isOneRuleEnabled = rules?.some(({ BucketKeyEnabled }) => BucketKeyEnabled);
            expect(isOneRuleEnabled).toBeFalsy();
        } catch (error) {
            throw `Error during sending request to S3Client: ${error.message}`;
        }
    });

    it("S3 Bucket to store images: Public Access Block", async () => {
        try {
            const input: GetPublicAccessBlockCommandInput = { Bucket: cloudximage.S3.StoreBucketName };
            const command = new GetPublicAccessBlockCommand(input);
            s3PublicAccessBlockResponse = await s3Client.send(command);
        } catch (error) {
            expect(error.name).toBe("NoSuchPublicAccessBlockConfiguration");
            expect(error.Code).toBe("NoSuchPublicAccessBlockConfiguration");
            expect(error?.$response.statusCode).toBe(404);
        }
    });
});
