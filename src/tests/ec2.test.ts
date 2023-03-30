import { EC2Client, DescribeInstancesCommand, DescribeInstancesCommandOutput, Instance } from "@aws-sdk/client-ec2";
import cloudxinfo from "../data/cloudxinfo.data";
import { InstanceTypes } from "../enum/instanceType.enum";
const client = new EC2Client({ region: process.env.AWS_DEFAULT_REGION });

/**
 * Each EC2 instance should have the following configuration:
 * Instance type: t2.micro
 * Instance tags: Name, cloudx
 * Root block device size: 8 GB
 * Instance OS: Amazon Linux
 * The public instance should have public IP assigned
 * The private instance should not have public IP assigned
 *
 * The security groups' configuration:
 * The public instance should be accessible from the internet by SSH (port 22) and HTTP (port 80) only
 * The private instance should be accessible only from the public instance by SSH and HTTP protocols only
 * Both private and public instances should have access to the internet
 */
describe("EC2 Describe", () => {
    let response: DescribeInstancesCommandOutput;
    let instances;
    let PrivateInstance: Instance;
    let PublicInstance: Instance;

    beforeAll(async () => {
        try {
            const input = {};
            const command = new DescribeInstancesCommand(input);
            response = await client.send(command);
        } catch (error) {
            throw `Error during sending request to EC2Client: ${error.message}`;
        }
        try {
            instances = response.Reservations?.map(({ Instances }) => Instances)?.reduce(
                (accum, current) => [...accum, ...current],
                [],
            );

            PublicInstance = instances?.find(
                (instance) => instance.InstanceId === cloudxinfo.PublicInstance.InstanceId,
            );
        } catch (error) {
            throw `Error during parsing request from EC2Client: ${error.message}`;
        }
    });

    it("Reservation should contain two instances", async () => {
        expect(instances?.length).toBe(2);
    });

    describe("PrivateInstance", () => {
        beforeAll(() => {
            try {
                PrivateInstance = instances?.find((instance) => {
                    return instance.InstanceId === cloudxinfo.PrivateInstance.InstanceId;
                });
            } catch (error) {
                throw `Error in PrivateInstance validation: ${error.message}`;
            }
        });

        it(`should have [${InstanceTypes.T2_MICRO}] InstanceType`, async () => {
            expect(PrivateInstance).not.toBeUndefined();
            expect(PrivateInstance.InstanceType).toBe(InstanceTypes.T2_MICRO);
        });

        /** aws:cloudformation:stack-name: cloudxinfo */
        it(`should have expected Name Tag`, async () => {
            expect(PrivateInstance).not.toBeUndefined();
            const Tag = PrivateInstance.Tags?.find(({ Key }) => Key === "Name");
            expect(Tag.Value).toBe("cloudxinfo/PrivateInstance/Instance");
        });

        it(`should have expected PrivateIpAddress`, async () => {
            expect(PrivateInstance).not.toBeUndefined();
            expect(PrivateInstance.ImageId).toBe(cloudxinfo.PrivateInstance.ImageId);
        });

        it(`should have expected PlatformDetails`, async () => {
            expect(PrivateInstance).not.toBeUndefined();
            expect(PrivateInstance.PlatformDetails).toBe(cloudxinfo.PrivateInstance.PlatformDetails);
        });

        it(`should have expected PrivateDnsName`, async () => {
            expect(PrivateInstance).not.toBeUndefined();
            expect(PrivateInstance.PrivateDnsName).toBe(cloudxinfo.PrivateInstance.PrivateDns);
        });

        it(`should have expected PrivateIpAddress`, async () => {
            expect(PrivateInstance).not.toBeUndefined();
            expect(PrivateInstance.PrivateIpAddress).toBe(cloudxinfo.PrivateInstance.PrivateIp);
        });

        it(`should not have expected PublicDnsName`, async () => {
            expect(PrivateInstance).not.toBeUndefined();
            expect(PrivateInstance.PublicDnsName).toBe("");
        });

        it(`should not have expected PublicIpAddress`, async () => {
            expect(PrivateInstance).not.toBeUndefined();
            expect(PrivateInstance.PublicIpAddress).toBeUndefined();
        });
    });

    describe("PublicInstance", () => {
        beforeAll(() => {
            try {
                PublicInstance = instances?.find((instance) => {
                    return instance.InstanceId === cloudxinfo.PublicInstance.InstanceId;
                });
            } catch (error) {
                throw `Error in PrivateInstance validation: ${error.message}`;
            }
        });

        it(`should have [${InstanceTypes.T2_MICRO}] InstanceType`, async () => {
            expect(PublicInstance).not.toBeUndefined();
            expect(PublicInstance.InstanceType).toBe(InstanceTypes.T2_MICRO);
        });

        it(`should have expected PrivateIpAddress`, async () => {
            expect(PublicInstance).not.toBeUndefined();
            expect(PublicInstance.ImageId).toBe(cloudxinfo.PublicInstance.ImageId);
        });

        it(`should have expected PlatformDetails`, async () => {
            expect(PublicInstance).not.toBeUndefined();
            expect(PublicInstance.PlatformDetails).toBe(cloudxinfo.PublicInstance.PlatformDetails);
        });

        it(`should have expected PrivateDnsName`, async () => {
            expect(PublicInstance).not.toBeUndefined();
            expect(PublicInstance.PrivateDnsName).toBe(cloudxinfo.PublicInstance.PrivateDns);
        });

        it(`should have expected PrivateIpAddress`, async () => {
            expect(PublicInstance).not.toBeUndefined();
            expect(PublicInstance.PrivateIpAddress).toBe(cloudxinfo.PublicInstance.PrivateIp);
        });

        it(`should have expected PublicDnsName`, async () => {
            expect(PublicInstance).not.toBeUndefined();
            expect(PublicInstance.PublicDnsName).toBe(cloudxinfo.PublicInstance.PublicDns);
        });

        it(`should not have expected PublicIpAddress`, async () => {
            expect(PublicInstance).not.toBeUndefined();
            expect(PublicInstance.PublicIpAddress).toBe(cloudxinfo.PublicInstance.PublicIp);
        });
    });
});
