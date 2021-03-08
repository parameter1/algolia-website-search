# Algolia Website Search Monorepo

## Development
To run the lamda example, execute `docker-compose run --rm lambda-example`

Update in AWS Console for Production:
 - run ./scripts/archive.sh to create Archive.zip
 - Log into [AWS Console - CloudWatch Dashboard](https://ca-central-1.console.aws.amazon.com/cloudwatch/home#dashboards:)
 - Click on the [ContentSave](https://ca-central-1.console.aws.amazon.com/cloudwatch/home?region=ca-central-1#dashboards:name=ContentSave) dashboard
 - Click on the function(algolia-website-search-${db}) you would like to update
 - Click **.zip file** under the **Upload from** dropdown.
 - Upload saved Archive.zip to the form
