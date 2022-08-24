# aws-cdk-ts-s3-website

Deploying static website to AWS S3 only using: the manual method from aws 
console, and the CDK typescript method.

**Note**: Amazon S3 website endpoints do not support HTTPS. If we want to use 
HTTPS, then we need to use the Amazon CloudFront as the public entry point
to serve the website hosted on Amazon S3.
See [Github: aws-cdk-ts-s3-cloudfront-website](https://github.com/gabepublic/aws-cdk-ts-s3-cloudfront-website)) 


## Prerequisite

- [Setup AWS CLI](https://digitalcompanion.gitbook.io/home/setup/aws/cli-and-cloudshell#aws-cli)

- [Setup AWS CDK](https://digitalcompanion.gitbook.io/home/setup/aws/cli-and-cloudshell#cdk)


## Setup

- Clone this repo

- **Note**: the `src` folder contains a very simple web site that we will deploy
  to AWS S3
  
- CDK has been "bootstrap"; otherwise 
  see [Bootstrapping](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)
  - This is a one time setup for the AWS Account; run the CDK Bootstrap, as follow: 
```
// Get acct-number from AWS console or
$ aws sts get-caller-identity
// Get the default region for the profile
$ aws configure get region

$ cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```
  - Bootstrap creates two resources: 
    - S3 bucket for CDK staging (e.g., `cdk-hnb659fds-assets-349<truncate>-us-west-2`)
    - CloudFormation stack called `CDKToolkit`
    - Five IAM Roles:
      - cdk-<uniqueId>-cfn-exec-role-<account-no>-<region>
      - cdk-<uniqueId>-deploy-role-<account-no>-<region>
      - cdk-<uniqueId>-file-publishing-role-<account-no>-<region>
      - cdk-<uniqueId>-image-publishing-role-<account-no>-<region>
      - cdk-<uniqueId>-lookup-role-<account-no>-<region>
  - During cleanup, these resources need be deleted; especially the S3 bucket 
    and the CloudFormation stack, `CDKToolkit`, otherwise the next 
    `cdk deploy` will fail indicating that the account has not been "bootstrap",
    but attempt to cdk bootstrap will look like success with "no change" shown
    on the output, but the S3 bucket is not created and the `cdk deploy` will 
    still fail, as shown in 
    [Troubleshsooting - cdk deploy error: fail: No bucket named; Is account <acct#> bootstrapped?](https://digitalcompanion.gitbook.io/home/setup/aws/cli-and-cloudshell#troubleshooting).
    The reason is because cdk bootstrap still detects the CloudFormation 
    resource, i.e., "CDKToolkit".


## Deploy

### Manual using AWS Console

**Source**: [Tutorial: Configuring a static website on Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html)

Also see "References" below for other useful guidelines.

- Sign in to the AWS Management Console and go to the Amazon S3 console at
  [https://console.aws.amazon.com/s3/](https://console.aws.amazon.com/s3/).
  The default S3 console page should be the "Buckets" page showing the list of
  existing buckets.

- Create a new bucket:
  - enter the Bucket name (for example, `example.com`). For more info:
    - For bucket to work with CloudFront, the name must conform to DNS naming 
      requirements.
    - see bucket [Naming rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)
    - see bucket [Restrictions and limitations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/BucketRestrictions.html)
  - choose the Region to create the bucket
  - accept the default settings and create the bucket, choose Create.

- Enable website hosting from the newly created bucket:
  - choose the name of the bucket to enable static website hosting for
  - choose Properties.
  - from the "Static website hosting" panel, choose Edit.
  - for the "Static website hosting" selections, choose Enable.
  - in Index document, enter the file name of the index document, 
    typically `index.html`. Note: the index document name is case sensitive and 
    must exactly match the file name of the HTML index document that you plan 
    to upload to your S3 bucket.
  - to provide the custom error document for 4XX class errors, enter the custom
    error document file name.
  - choose Save changes.
  - Amazon S3 is enabled to serve the static website from the bucket. At the 
    bottom of the page, under Static website hosting, the website endpoint for 
    the bucket can be found. Use this endpoint to test the website.

- Unblock public access settings:
  - By default, Amazon S3 blocks public access to your account and buckets; even
    though the bucket has been enabled for website hosting
  - To "custom unblock", choose Permissions tab
  - From the "Block public access (bucket settings)" panel, choose Edit
  - Clear the "Block all public access" checkbox, and choose Save changes.
  - Confirm

- Add a bucket policy to grant public read access to your bucket. When you grant
  public read access, anyone on the internet can access your bucket:
  - Under Bucket Policy panel, choose Edit.
  - To grant public read access for the website, paste the following Bucket 
    policy into the editor:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::Bucket-Name/*"
            ]
        }
    ]
}
```    

- Upload an index and error documents, and other dependencies:
  - from the Object tab, click Upload files: `index.html`, `error.html`,
    `favicon-32px.png` and `styles.css`.

- Test by entering the website endpoint to the browser. The endpoint can be 
  found from the "Properties tab > Static website hosting panel > Bucket website
  endpoint".

  
### Automate using CDK method

Source: [Deploying a static website using S3 and CloudFront](https://aws-cdk.com/deploying-a-static-website-using-s3-and-cloudfront/)

- **Assumptions**:
  - AWS CLI setup & configured
  - AWS CDK setup & configured

- **CDK deployment application** - Pre-built and included in this repo. The 
  step-by-step instructions are provided below, as folows:
  - Create CDK application template
```
$ cd <project-folder>/aws-cdk-ts-s3-website
$ mkdir cdk && cd cdk
$ cdk init app --language typescript
```
  - The CDK deployment application is the Infrastructure as Code, and 
    it consists of codes (i.e., typescript) utilizing the AWS CDK libraries 
    to instruct the AWS services in setting up and configuring the AWS resources.
  - For this example, the codes have been added to the following files,
    after initial template creation: `./cdk/bin/cdk.ts` and 
    `./cdk/lib/cdk-stack.ts`
  - The codes included with this repo should work without further modification.

- Build the CDK app
```
$ cd <project-folder>/aws-cdk-ts-s3-website/cdk
$ npm install
```

- Next, deploying the website to S3 using CDK

- Synthesize an AWS CloudFormation template
```
$ cd <project-folder>/aws-cdk-ts-s3-website/cdk
$ cdk synth
Resources:
  awscdktys3websitebucket22756C2E:
    Type: AWS::S3::Bucket
    Properties:
      AccessControl: PublicRead
      Tags:
        - Key: aws-cdk:auto-delete-objects
          Value: "true"
        - Key: aws-cdk:cr-owned:e243344b
          Value: "true"
      WebsiteConfiguration:
        ErrorDocument: error.html
        IndexDocument: index.html
    UpdateReplacePolicy: Delete
    DeletionPolicy: Delete
[...]
Rules:
  CheckBootstrapVersion:
    Assertions:
      - Assert:
          Fn::Not:
            - Fn::Contains:
                - - "1"
                  - "2"
                  - "3"
                  - "4"
                  - "5"
                - Ref: BootstrapVersion
        AssertDescription: CDK bootstrap stack version 6 required. Please run 'cdk bootstrap' with a recent version of the CDK CLI.
```
    
- Deploy
```
$ cd <project-folder>/aws-cdk-ts-s3-website/cdk
$ cdk deploy

✨  Synthesis time: 7.74s

This deployment will make potentially sensitive changes according to your current security approval level (--require-approval broadening).
Please confirm you intend to make the following modifications:

IAM Statement Changes
┌───┬────────────────────────────────┬────────┬────────────────────────────────┬────────────────────────────────┬───────────┐
│   │ Resource                       │ Effect │ Action                         │ Principal                      │ Condition │
├───┼────────────────────────────────┼────────┼────────────────────────────────┼────────────────────────────────┼───────────┤
│ + │ ${Custom::CDKBucketDeployment8 │ Allow  │ sts:AssumeRole                 │ Service:lambda.amazonaws.com   │           │
│   │ 693BB64968944B69AAFB0CC9EB8756 │        │                                │                                │           │
│   │ C/ServiceRole.Arn}             │        │                                │                                │           │
├───┼────────────────────────────────┼────────┼────────────────────────────────┼────────────────────────────────┼───────────┤
│ + │ ${Custom::S3AutoDeleteObjectsC │ Allow  │ sts:AssumeRole                 │ Service:lambda.amazonaws.com   │           │
│   │ ustomResourceProvider/Role.Arn │        │                                │                                │           │
│   │ }                              │        │                                │                                │           │
├───┼────────────────────────────────┼────────┼────────────────────────────────┼────────────────────────────────┼───────────┤
│ + │ ${aws-cdk-ty-s3-website-bucket │ Allow  │ s3:DeleteObject*               │ AWS:${Custom::S3AutoDeleteObje │           │
│   │ .Arn}                          │        │ s3:GetBucket*                  │ ctsCustomResourceProvider/Role │           │
│   │ ${aws-cdk-ty-s3-website-bucket │        │ s3:List*                       │ .Arn}                          │           │
│   │ .Arn}/*                        │        │                                │                                │           │
│ + │ ${aws-cdk-ty-s3-website-bucket │ Allow  │ s3:Abort*                      │ AWS:${Custom::CDKBucketDeploym │           │
│   │ .Arn}                          │        │ s3:DeleteObject*               │ ent8693BB64968944B69AAFB0CC9EB │           │
│   │ ${aws-cdk-ty-s3-website-bucket │        │ s3:GetBucket*                  │ 8756C/ServiceRole}             │           │
│   │ .Arn}/*                        │        │ s3:GetObject*                  │                                │           │
│   │                                │        │ s3:List*                       │                                │           │
│   │                                │        │ s3:PutObject                   │                                │           │
│   │                                │        │ s3:PutObjectLegalHold          │                                │           │
│   │                                │        │ s3:PutObjectRetention          │                                │           │
│   │                                │        │ s3:PutObjectTagging            │                                │           │
│   │                                │        │ s3:PutObjectVersionTagging     │                                │           │
├───┼────────────────────────────────┼────────┼────────────────────────────────┼────────────────────────────────┼───────────┤
│ + │ ${aws-cdk-ty-s3-website-bucket │ Allow  │ s3:GetObject                   │ AWS:*                          │           │
│   │ .Arn}/*                        │        │                                │                                │           │
├───┼────────────────────────────────┼────────┼────────────────────────────────┼────────────────────────────────┼───────────┤
│ + │ arn:${AWS::Partition}:s3:::{"F │ Allow  │ s3:GetBucket*                  │ AWS:${Custom::CDKBucketDeploym │           │
│   │ n::Sub":"cdk-hnb659fds-assets- │        │ s3:GetObject*                  │ ent8693BB64968944B69AAFB0CC9EB │           │
│   │ ${AWS::AccountId}-${AWS::Regio │        │ s3:List*                       │ 8756C/ServiceRole}             │           │
│   │ n}"}                           │        │                                │                                │           │
│   │ arn:${AWS::Partition}:s3:::{"F │        │                                │                                │           │
│   │ n::Sub":"cdk-hnb659fds-assets- │        │                                │                                │           │
│   │ ${AWS::AccountId}-${AWS::Regio │        │                                │                                │           │
│   │ n}"}/*                         │        │                                │                                │           │
└───┴────────────────────────────────┴────────┴────────────────────────────────┴────────────────────────────────┴───────────┘
IAM Policy Changes
┌───┬───────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┐
│   │ Resource                                                  │ Managed Policy ARN                                        │
├───┼───────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ + │ ${Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8 │ arn:${AWS::Partition}:iam::aws:policy/service-role/AWSLam │
│   │ 756C/ServiceRole}                                         │ bdaBasicExecutionRole                                     │
├───┼───────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ + │ ${Custom::S3AutoDeleteObjectsCustomResourceProvider/Role} │ {"Fn::Sub":"arn:${AWS::Partition}:iam::aws:policy/service │
│   │                                                           │ -role/AWSLambdaBasicExecutionRole"}                       │
└───┴───────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Do you wish to deploy these changes (y/n)? y
CdkStack: deploying...
[0%] start: Publishing 990410bab4a39b07c4495c3b8fae2f3f8847daabc9e3fc1debf3fa050c25e302:current_account-current_region
[0%] start: Publishing b7f327b4415410f319943b754edb274645a9d6850369ae4da9ba209858099210:current_account-current_region
[0%] start: Publishing f98b78092dcdd31f5e6d47489beb5f804d4835ef86a8085d0a2053cb9ae711da:current_account-current_region
[0%] start: Publishing a45af0f103767cdfa62f52478cd2e33a0c44babd71e5a1e4d8068557f006ba09:current_account-current_region
[0%] start: Publishing ff834787ba68a959da6121bba92b2b17155fd7580a93cfa4eca9445eda33ab90:current_account-current_region
[20%] success: Published f98b78092dcdd31f5e6d47489beb5f804d4835ef86a8085d0a2053cb9ae711da:current_account-current_region
[40%] success: Published a45af0f103767cdfa62f52478cd2e33a0c44babd71e5a1e4d8068557f006ba09:current_account-current_region
[60%] success: Published b7f327b4415410f319943b754edb274645a9d6850369ae4da9ba209858099210:current_account-current_region
[80%] success: Published 990410bab4a39b07c4495c3b8fae2f3f8847daabc9e3fc1debf3fa050c25e302:current_account-current_region
[100%] success: Published ff834787ba68a959da6121bba92b2b17155fd7580a93cfa4eca9445eda33ab90:current_account-current_region
CdkStack: creating CloudFormation changeset...

 ✅  CdkStack

✨  Deployment time: 104.72s

Outputs:
CdkStack.awscdktys3websitebucketURL = http://cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k.s3-website-us-west-2.amazonaws.com
CdkStack.awscdktys3websitebucketdomainname = http://cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k.s3-website-us-west-2.amazonaws.com
Stack ARN:
arn:aws:cloudformation:us-west-2:349327579537:stack/CdkStack/a3aade50-226c-11ed-bed8-0299bb440511

✨  Total time: 112.46s
```


## TEST

- Check AWS S3 console, a new bucket 
  `cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k` has been 

- Open browser and the "Welcome" page is displayed when go to the following: 
  - `http://cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k.s3-website-us-west-2.amazonaws.com`
  - `http://cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k.s3-website-us-west-2.amazonaws.com/index.html`

- Open browser and the error page, showing "Ooop!!" is displayed when go to the 
  following:
  - `http://cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k.s3-website-us-west-2.amazonaws.com/dummry`

- On the S3 console, the following is shown:
  - Objects tab: four files
  - Properties tab > Static website hosting:
    - Static website hosting: Enabled
    - Hosting type: Bucket hosting
    - Bucket website endpoint: http://cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k.s3-website-us-west-2.amazonaws.com/
    
  - Permissions tab: 
    - Permissions overview > Access: Public
    - Block public access (bucket settings) > Block all public access: Off
    - Bucket policy:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k/*"
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::349327579537:role/CdkStack-CustomS3AutoDeleteObjectsCustomResourcePr-1LS0U5IUQ8O0Y"
            },
            "Action": [
                "s3:DeleteObject*",
                "s3:GetBucket*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k",
                "arn:aws:s3:::cdkstack-awscdktys3websitebucket22756c2e-187rc8tp7sn0k/*"
            ]
        }
    ]
}
```

## CLEANUP

- Cleanup all artifacts created by CDK
```
$ cd <project-folder>/aws-cdk-ts-s3-website/cdk
$ cdk destroy
```

- Additional cleanup not done by the the `cdk destroy`:
  - CloudWatch Log group; go to AWS Console "CloudWatch > Logs > Log groups"
    and delete two log groups created by `cdk deploy` but not deleted:
    - `/aws/lambda/<stack-name>-CustomCDKBucketDeployment<unique-id>`
    - `/aws/lambda/<stack-name>-CustomS3AutoDeleteObjectsCustomResourcePr-<unique-id>`


## References

- [AWS: Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

- [AWS: Your first AWS CDK app](https://docs.aws.amazon.com/cdk/v2/guide/hello_world.html)

