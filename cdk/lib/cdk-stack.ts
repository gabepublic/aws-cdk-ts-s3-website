import * as cdk from 'aws-cdk-lib';
//import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
//import {Bucket, BucketAccessControl} from "@aws-cdk/aws-s3";
//import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";
const s3 = cdk.aws_s3;
const s3deploy = cdk.aws_s3_deployment;

import * as path from "path";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ** Create the S3 bucket to store the website file
    // Note: Do not use the websiteIndexDocument or websiteErrorDocument props of 
    // the Bucket construct if you pan to use CloudFront to front the website.
    // Passing these will cause the Bucket to be automatically configured as 
    // “website enabled”, which is not intended for CloudFront setup.
    //       accessControl: s3.BucketAccessControl.PUBLIC_READ,
    const bucket = new s3.Bucket(this, 'aws-cdk-ty-s3-website-bucket', {
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Deploying the website to the S3 bucket
    // After deployment, if you try to access the S3 bucket directly using the 
    // auto-generated URL (e.g., https://<bucket-name>.s3-us-west-2.amazonaws.com/ )
    // from a browser, you will get AccessDenied error, because of the bucket
    // accessControl policy set above
    const deployment = new s3deploy.BucketDeployment(this, 'aws-cdk-ty-s3-website-bucketdeployment', {
      destinationBucket: bucket,
      sources: [s3deploy.Source.asset(path.resolve(__dirname, '..', '..', 'src'))]
    })

    // Create a CDK Output which details the URL of the S3 bucket.
    new cdk.CfnOutput(this, "aws-cdk-ty-s3-website-bucketURL", {
      description: "The S3 Bucket URL:",
      value: bucket.bucketWebsiteUrl
    });
    new cdk.CfnOutput(this, "aws-cdk-ty-s3-website-bucketdomainname", {
      description: "The S3 Bucket Domain Name:",
      value: "http://" + bucket.bucketWebsiteDomainName
    });    
  }
}
