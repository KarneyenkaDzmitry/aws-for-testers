/** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ec2/classes/describevpcscommand.html */
import { EC2Client, DescribeVpcsCommand, DescribeVpcsCommandOutput, Vpc } from "@aws-sdk/client-ec2";
import cloudxinfo from "../../data/cloudxinfo.data";
const client = new EC2Client({ region: process.env.AWS_DEFAULT_REGION });

/**
 * Create a manual/automated deployment validation test suite that covers the following requirements:
 * VPC configuration:
 * The application should be deployed in non-default VPC with has 2 subnets: public and private.
 * VPC CIDR Block: 10.0.0.0/16
 * VPC tags: Name, cloudx
 *
 * Subnets and routing configuration:
 * The public instance should be accessible from the internet by Internet Gateway.
 * The public instance should have access to the private instance.
 * The private instance should have access to the internet via NAT Gateway.
 * The private instance should not be accessible from the public internet.
 */
describe("VPC Describe", () => {
    let response: DescribeVpcsCommandOutput;
    let vpc: Vpc | undefined;

    beforeAll(async () => {
        try {
            const input = {
                VpcIds: [cloudxinfo.Vpc.Id],
            };
            const command = new DescribeVpcsCommand(input);
            response = await client.send(command);
        } catch (error) {
            throw `Error during sending request to EC2Client: ${error.message}`;
        }
        try {
            vpc = response.Vpcs ? response.Vpcs[0] : undefined;
        } catch (error) {
            throw `Error during parsing request from EC2Client: ${error.message}`;
        }
    });

    it(`should have expected Id`, async () => {
        expect(vpc).not.toBeUndefined();
        expect(vpc?.VpcId).toBe(cloudxinfo.Vpc.Id);
    });

    it(`should have expected CidrBlock`, async () => {
        expect(vpc).not.toBeUndefined();
        expect(vpc?.CidrBlock).toBe(cloudxinfo.Vpc.CidrBlock);
    });

    it(`should have expected Name Tag`, async () => {
        expect(vpc).not.toBeUndefined();
        const Tag = vpc?.Tags?.find(({ Key }) => {
            return Key === "Name";
        });
        expect(Tag.Value).toBe("cloudxinfo/Network/Vpc");
    });

    it(`should have expected [aws:cloudformation:stack-name] Tag`, async () => {
        expect(vpc).not.toBeUndefined();
        const Tag = vpc?.Tags?.find(({ Key }) => {
            return Key === "aws:cloudformation:stack-name";
        });
        expect(Tag.Value).toBe("cloudxinfo");
    });

    it(`should have expected [cloudx] Tag`, async () => {
        expect(vpc).not.toBeUndefined();
        const Tag = vpc?.Tags?.find(({ Key }) => {
            return Key === "cloudx";
        });
        expect(Tag.Value).toBe("qa");
    });
});
