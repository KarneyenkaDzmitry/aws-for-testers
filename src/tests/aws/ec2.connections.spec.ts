import {
    EC2InstanceConnectClient,
    SendSerialConsoleSSHPublicKeyCommand,
    SendSerialConsoleSSHPublicKeyCommandInput,
} from "@aws-sdk/client-ec2-instance-connect";
import cloudxinfo from "../../data/cloudxinfo.data";
import { InstanceTypes } from "../../enum/instanceType.enum";
const client = new EC2InstanceConnectClient({ region: process.env.AWS_DEFAULT_REGION });
import fs from "node:fs/promises";
import path from "path";
import { NodeSSH, SSHExecCommandResponse } from "node-ssh";
const sensitivePath = path.join(__dirname, "..", "..", ".sensitive", "cloudxinfo-eu-west-1.pem");
const ssh = new NodeSSH();
import { spawnSync } from "node:child_process";
/**
 *
 * The security groups' configuration:
 * The public instance should be accessible from the internet by SSH (port 22) and HTTP (port 80) only
 * The private instance should be accessible only from the public instance by SSH and HTTP protocols only
 * Both private and public instances should have access to the internet
 */
xdescribe("VPC Describe", () => {
    let response;

    beforeAll(async () => {
        try {
            // const params: SendSerialConsoleSSHPublicKeyCommandInput = {
            //     InstanceId: cloudxinfo.PublicInstance.InstanceId,
            //     SerialPort: 0,
            //     SSHPublicKey:
            // };
            // const command = new SendSerialConsoleSSHPublicKeyCommand(params);
        } catch (error) {
            throw `Error during sending request to EC2Client: ${error.message}`;
        }
        // try {
        // } catch (error) {
        //     throw `Error during parsing request from EC2Client: ${error.message}`;
        // }
    });

    xit("dsaf", async () => {
        console.log(sensitivePath);

        const ec2userSsh = await ssh.connect({
            host: cloudxinfo.PublicInstance.PublicDns,
            username: "ec2user",
            port: 22,
            privateKeyPath: sensitivePath,
            algorithms: "SHA256",
            // // passphrase: "Yes",
            // privateKey: Buffer.from(""),
        });

        const result: SSHExecCommandResponse = await ec2userSsh.execCommand("curl -XGET localhost");
        console.log("STDOUT: " + result.stdout);
        console.log("STDERR: " + result.stderr);

        await ec2userSsh.dispose();
    }, 50000);
});
