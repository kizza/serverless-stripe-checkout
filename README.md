# Serverless Marco Polo

An example of the serverless framework deploying a lambda to publish a message to an SNS topic ("Marco"), which is in
turn put on a SQS queue, and read by a second lambda ("Polo").

## Usage

Populate `.env` and `.env.prod` files as per the `.env.example`.

Create domains with the following:
```
node_modules/.bin/serverless create_domain
```

Deploy to various stages with the following:

```
yarn deploy --stage dev
yarn deploy --stage prod
```

Hit the endpoint provided for the `/marco` lambda, then check the polo logs (via Cloudwatch or `yarn logs --function polo`

## Discussion

Uses `serverless-esbuild` with config file `config.esbuild.js` for greater flexibility over the inbuilt `esbuild`.
This implementation uses es modulesbundles and implements `dotenv` variables.
