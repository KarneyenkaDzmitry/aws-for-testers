# AWS for Testers

### Preconditions

#### Environment variables
 - AWS_ACCESS_KEY_ID
 - AWS_SECRET_ACCESS_KEY
 - AWS_DEFAULT_REGION

#### SSH connection Manually / Programmatically

1. Direct access to the Public Instance
2. Access to Private instance through tunnel(Public Instance)

**For Programmatically access** need to use SSH Client module in your Program Language.<br>
As for JS/TS, I have not found any working clients. Need to investigate further.<br>
**Note:** Even the SSH connection is established, there is only connection to terminal only. <br>
The CLI command may only be invoked. Thus, to exec tests on the Instance, need to make additional <br>
steps such as:<br>

1. Prepare environment;
2. Set Env variables;
3. Clone a Test Repository;
4. Install dependencies;
5. Run tests;
6. Parse output to reveal the result of the run.

## Tasks:

### EC2

1. Verify only that the application in the private Instance is accessible from the SSH in PublicInstance
2. Verify the Private Instance is not accessible from Public Internet.

### VPC
### S3
### RDS
### SNS, SQS
### Serverless
### Monitoring

#### AWS API used: 

- [EC2Client.DescribeInstanceCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ec2/classes/describeinstancescommand.html)
- [EC2Client.DescribeVpcCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ec2/classes/describevpcscommand.html)
- 

#### AssumeRolePolicyDocument
```json
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Effect":"Allow",
      "Principal":{
        "Service":"ec2.amazonaws.com"
      },
      "Action":"sts:AssumeRole"
    }
  ]
}
```
#### Form Data object to upload Image
```typescript
const form = new FormData();
/** First approach */
form.append("upfile", createReadStream(filepath), path.basename(filepath.toString()));
/** Second one */
const content = await readFile(filepath);
const blobImage = Buffer.from(await new Blob([content], { type: "image/jpeg" }).arrayBuffer());
form.append("upfile", blobImage, image);
```


