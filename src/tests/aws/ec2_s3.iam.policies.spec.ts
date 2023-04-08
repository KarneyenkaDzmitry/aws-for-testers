/** https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ec2/classes/describesubnetscommand.html */
import {
    EC2Client,
    Instance,
    DescribeInstancesCommand,
    DescribeInstancesCommandInput,
    DescribeInstancesCommandOutput,
} from "@aws-sdk/client-ec2";
import {
    IAMClient,
    GetPolicyCommand,
    GetPolicyCommandInput,
    GetPolicyCommandOutput,
    GetInstanceProfileCommand,
    GetInstanceProfileCommandInput,
    GetInstanceProfileCommandOutput,
    ListAttachedRolePoliciesRequest,
    ListAttachedRolePoliciesCommand,
    ListAttachedRolePoliciesCommandInput,
    ListAttachedRolePoliciesCommandOutput,
} from "@aws-sdk/client-iam";
import cloudximage from "../../data/cloudximage.data";
import { InstanceTypes } from "../../enum/instanceType.enum";
import { parse } from "node:querystring";
const ec2Client = new EC2Client({ region: process.env.AWS_DEFAULT_REGION });
const iamClient = new IAMClient({ region: process.env.AWS_DEFAULT_REGION });

// import { EC2Client, DescribeInstancesCommand, DescribeInstancesCommandOutput, Instance } from "@aws-sdk/client-ec2";

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
    let ec2Response: DescribeInstancesCommandOutput;
    let instances: Instance[] | undefined;
    let AppInstance: Instance;
    let AppInstanceProfileName;
    let iamResponse: GetInstanceProfileCommandOutput;
    let iamGetPolicyResponse: GetPolicyCommandOutput;
    let instanceRoles;

    beforeAll(async () => {
        try {
            const input: DescribeInstancesCommandInput = {
                InstanceIds: [cloudximage.AppInstance.InstanceId],
            };
            const command = new DescribeInstancesCommand(input);
            ec2Response = await ec2Client.send(command);
        } catch (error) {
            throw `Error during sending request to EC2Client: ${error.message}`;
        }
        try {
            instances = ec2Response.Reservations?.map(({ Instances }) => Instances)?.reduce(
                (accum, current) => [...accum, ...current],
                [],
            );
            AppInstance = instances?.find((instance) => {
                return instance.InstanceId === cloudximage.AppInstance.InstanceId;
            });
            AppInstanceProfileName =
                AppInstance.IamInstanceProfile && AppInstance.IamInstanceProfile.Arn
                    ? AppInstance.IamInstanceProfile.Arn.split("/")[1]
                    : undefined;
        } catch (error) {
            throw `Error during parsing request from EC2Client: ${error.message}`;
        }
    });

    it("Reservation should contain two instances", async () => {
        expect(instances?.length).toBe(1);
        expect(AppInstance).not.toBeUndefined();
        expect(AppInstanceProfileName).not.toBeUndefined();
    });

    describe("IAM AppInstance Profile", () => {
        beforeAll(async () => {
            try {
                const input: GetInstanceProfileCommandInput = {
                    InstanceProfileName: AppInstanceProfileName,
                };
                const command = new GetInstanceProfileCommand(input);
                iamResponse = await iamClient.send(command);
                instanceRoles = iamResponse.InstanceProfile?.Roles;
                const policy = parse(instanceRoles[0].AssumeRolePolicyDocument);
            } catch (error) {
                throw `Error during sending request to iamResponse: ${error.message}`;
            }
        });

        it(`should have [${InstanceTypes.T2_MICRO}] InstanceType`, async () => {
            expect(AppInstanceProfileName).not.toBeUndefined();
            expect(AppInstance.InstanceType).toBe(InstanceTypes.T2_MICRO);
        });
    });

    describe("IAM Get Policy By Arn", () => {
        beforeAll(async () => {
            try {
                const input: ListAttachedRolePoliciesCommandInput = {
                    RoleName: instanceRoles[0].RoleName,
                };
                const command = new ListAttachedRolePoliciesCommand(input);
                const response: ListAttachedRolePoliciesCommandOutput = await iamClient.send(command);
                console.log(response);
                // const input1: GetPolicyCommandInput = {
                //     PolicyArn: response.AttachedPolicies,
                // };
                // const command1 = new GetPolicyCommand(input);
                // iamGetPolicyResponse = await iamClient.send(command1);
                console.log(response);
            } catch (error) {
                throw `Error during sending request to iamResponse: ${error.message}`;
            }
        });

        it(`should have [${InstanceTypes.T2_MICRO}] InstanceType`, async () => {
            expect(AppInstanceProfileName).not.toBeUndefined();
            expect(AppInstance.InstanceType).toBe(InstanceTypes.T2_MICRO);
        });
    });
});
