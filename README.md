# DEPRECATED! Please use the new private iris repo

1. Delete your current local iris repo
1. `git clone git@github.com:britannica/iris.git`

# IRIS

### Description

CDN/Media Server infrastructure with the capability of resizing images on the fly. Built using the
[Serverless Framework](https://serverless.com/).


### Usage

| Type                 | URL                            |
| -------------------- | ------------------------------ |
| Original             | /path/to/image.jpg             |
| Resized              | /300x250/path/to/image.jpg     |

**Anatomy of the URL**

`/{width}x{height}/{path_to_original_image}`


**Caveats**

- Maximum `width` is 1920
- Maximum `height` is 1080
- Decimals are not allowed in the `height` and `width`
- Resizing of GIFs is not supported. Attempts to resize a GIF will return the original image.


### Requirements

- [Node](https://nodejs.org/en/)
- [Serverless](https://serverless.com/)


### Local development

1. `npm install`
1. `npm start`

This boots up an instance of `serverless-offline` at `http://localhost:3000`. You can test the resize function by using 
a url like `http://localhost:3000/resizeImage?key=200x200/40/154340-050-3C5A71CD.jpg`. In that url, `200x200` are the dimensions you
are testing and `/40/154340-050-3C5A71CD.jpg` is the path to the original image you are testing.


### Deployments

**1. Build the Lambda function**

The Lambda function uses sharp for image resizing which requires native extensions. In order to run on Lambda, it must be packaged on Amazon Linux. We will use Docker to download Amazon Linux, install Node.js and developer tools, and build the extensions.

Run `make dist`

**2. Deploy the function and provision any necessary infrastructure**

Be sure to set up proper [AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/) 
on your machine, otherwise the Serverless deploy commands will fail.

Run `sls deploy`

During the first deploy, Serverless will provision whatever resources you have listed in your serverless.yml. This will take several minutes. If you're using a custom domain name, see [Setting up a custom domain and SSL certificate](#setting-up-a-custom-domain-and-ssl-certificate) section.

Subsequent deploys will go faster since Serverless will only be uploading your updated .zip file (created by `make dist`).

You can specify a stage while deploying by using the `--stage` flag. e.g. `serverless deploy --stage production`. Defaults to `dev` if no `--stage` is set.

**3. Add IndexDocument and ErrorDocument to S3**

Next, we need to manually upload `index.html`, `404.html`, and `favicon.ico` to our newly created S3 bucket:

1. Go to the [S3 Console](https://s3.console.aws.amazon.com/s3/home)
1. Open our `iris-{stage}-mediaserver-xxxxx` bucket
1. In the upper left, click the "Upload" button
1. Upload the files inside of the `./config/s3-default-documents` directory. **Be sure to make these public!**

This step only needs to happen once.

**That's it!**


### Serverless CLI Reference

https://serverless.com/framework/docs/providers/aws/cli-reference/


### Quick Reference

**Deploy to production**

`serverless deploy --stage production`

For more, see [Serverless CLI documentation for `deploy`](https://serverless.com/framework/docs/providers/aws/cli-reference/deploy/)

**Remove the deployed service**

`serverless remove`

For more, see [Serverless CLI documentation for `remove`](https://serverless.com/framework/docs/providers/aws/cli-reference/remove/)


## Setting up a custom domain and SSL certificate

Cloudfront, by default, will issue a random domain name; something like `abcde12345.cloudfront.net`. Thankfully, it's 
possible to use your own domain name (e.g. cdn.example.com).

We can do this with a few changes to `serverless.yml` and then a new deployment:
1. In the environment variables section, uncomment `CERT_DOMAIN`, `CERT_VALIDATION_DOMAIN`, and `CDN_ARN`
1. Change `CERT_DOMAIN` in your config .json file. This will be the domain that you want secured with a certificate. e.g. `subdomain.example.com`
1. Change `CERT_VALIDATION_DOMAIN` in your config .json file. This is the TLD domain that you will receive a validation email at. Must match the above TLD. e.g. `example.com`
1. In the Resources section, uncomment the `CDNCert` section, as well as the `Aliases` and `ViewerCertificate` options under the `MediaCDN` section
1. `sls deploy`

During this step, Amazon will send an email to you with a link for you to click to validate your domain. If your 
`CERT_VALIDATION_DOMAIN` is `example.com`, they will send a validation email to all of the following addresses:
- administrator@example.com
- hostmaster@example.com
- postmaster@example.com
- webmaster@example.com
- admin@example.com

**IMPORTANT!:** The serverless deployment will hang until you validate your domain, so keep that in mind if you need to
coordinate with other people during this step.

After the domain has been validated, the deployment will continue as normal. Your Cloudfront distribution will restart
during this process, so it will probably take a number of minutes for the deployment to complete.

You should now be able to use your shiny new `cdn.example.com` domain!


### AWS Services Used

- Amazon API Gateway
- Amazon Cloudfront
- Amazon S3
- AWS Lambda 
