/** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ec2/classes/describesubnetscommand.html */
import {
    EC2Client,
    DescribeSubnetsCommand,
    DescribeSubnetsCommandInput,
    DescribeSubnetsCommandOutput,
    Subnet,
} from "@aws-sdk/client-ec2";
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
 * The public instance should be accessible from the internet by Internet Gateway. - API tests
 * The public instance should have access to the private instance. - SSH connection
 * The private instance should have access to the internet via NAT Gateway. SSH connection to the Instance and call any HTTP request
 * The private instance should not be accessible from the public internet. - HTTP request to the Instance? or Validate that it does not have a Public IP
 */
describe("VPC Subnets Describe", () => {
    let response: DescribeSubnetsCommandOutput;
    let subnets: Subnet[] | undefined;
    let PrivateSubnet: Subnet;
    let PublicSubnet: Subnet;

    beforeAll(async () => {
        try {
            const input: DescribeSubnetsCommandInput = {
                Filters: [
                    {
                        Name: "vpc-id",
                        Values: [cloudxinfo.Vpc.Id],
                    },
                ],
            };
            const command = new DescribeSubnetsCommand(input);
            response = await client.send(command);
        } catch (error) {
            throw `Error during sending request to EC2Client: ${error.message}`;
        }
        try {
            subnets = response?.Subnets ? response?.Subnets : [];
        } catch (error) {
            throw `Error during parsing request from EC2Client: ${error.message}`;
        }
    });

    it(`should have two subnets`, async () => {
        expect(subnets).not.toBeUndefined();
        expect(subnets?.length).toBe(2);
    });

    describe("PrivateSubnet", () => {
        beforeAll(() => {
            try {
                PrivateSubnet = subnets?.find((subnet) => {
                    return subnet?.Tags.find(({ Value }) => {
                        return Value === "Private";
                    });
                });
            } catch (error) {
                throw `Error in PrivateSubnet validation: ${error.message}`;
            }
        });

        it(`should have expected CidrBlock`, async () => {
            expect(PrivateSubnet).not.toBeUndefined();
            expect(PrivateSubnet?.CidrBlock).toBe("10.0.128.0/17");
        });

        it(`should have expected AvailabilityZone`, async () => {
            expect(PrivateSubnet).not.toBeUndefined();
            expect(PrivateSubnet?.AvailabilityZone).toContain(process.env.AWS_DEFAULT_REGION);
        });

        it(`should have expected VpcId`, async () => {
            expect(PrivateSubnet).not.toBeUndefined();
            expect(PrivateSubnet?.VpcId).toContain(cloudxinfo.Vpc.Id);
        });

        it(`should have expected Name Tag`, async () => {
            expect(PrivateSubnet).not.toBeUndefined();
            const Tag = PrivateSubnet?.Tags?.find(({ Key }) => {
                return Key === "Name";
            });
            expect(Tag.Value).toBe("cloudxinfo/Network/Vpc/PrivateSubnetSubnet1");
        });

        it(`should have expected [aws:cloudformation:stack-name] Tag`, async () => {
            expect(PrivateSubnet).not.toBeUndefined();
            const Tag = PrivateSubnet?.Tags?.find(({ Key }) => {
                return Key === "aws:cloudformation:stack-name";
            });
            expect(Tag.Value).toBe("cloudxinfo");
        });

        it(`should have expected [cloudx] Tag`, async () => {
            expect(PrivateSubnet).not.toBeUndefined();
            const Tag = PrivateSubnet?.Tags?.find(({ Key }) => {
                return Key === "cloudx";
            });
            expect(Tag.Value).toBe("qa");
        });
    });

    describe("PublicSubnet", () => {
        beforeAll(() => {
            try {
                PublicSubnet = subnets?.find((subnet) => {
                    return subnet?.Tags.find(({ Value }) => {
                        return Value === "Public";
                    });
                });
            } catch (error) {
                throw `Error in PublicSubnet validation: ${error.message}`;
            }
        });

        it(`should have expected CidrBlock`, async () => {
            expect(PublicSubnet).not.toBeUndefined();
            expect(PublicSubnet?.CidrBlock).toBe("10.0.0.0/17");
        });

        it(`should have expected AvailabilityZone`, async () => {
            expect(PublicSubnet).not.toBeUndefined();
            expect(PublicSubnet?.AvailabilityZone).toContain(process.env.AWS_DEFAULT_REGION);
        });

        it(`should have expected VpcId`, async () => {
            expect(PublicSubnet).not.toBeUndefined();
            expect(PublicSubnet?.VpcId).toContain(cloudxinfo.Vpc.Id);
        });

        it(`should have expected Name Tag`, async () => {
            expect(PublicSubnet).not.toBeUndefined();
            const Tag = PublicSubnet?.Tags?.find(({ Key }) => {
                return Key === "Name";
            });
            expect(Tag.Value).toBe("cloudxinfo/Network/Vpc/PublicSubnetSubnet1");
        });

        it(`should have expected [aws:cloudformation:stack-name] Tag`, async () => {
            expect(PublicSubnet).not.toBeUndefined();
            const Tag = PublicSubnet?.Tags?.find(({ Key }) => {
                return Key === "aws:cloudformation:stack-name";
            });
            expect(Tag.Value).toBe("cloudxinfo");
        });

        it(`should have expected [cloudx] Tag`, async () => {
            expect(PublicSubnet).not.toBeUndefined();
            const Tag = PublicSubnet?.Tags?.find(({ Key }) => {
                return Key === "cloudx";
            });
            expect(Tag.Value).toBe("qa");
        });
    });
});
