import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";
import * as urlencode from "urlencode";

const region = "us-central1";

const supertokenForks = new gcp.artifactregistry.Repository(
  "supertokens-forks",
  {
    location: region,
    repositoryId: "supertokens-forks",
    description: "Forks of supertokens repos",
    format: "DOCKER"
  }
);

new docker.Image("supertokens-mysql", {
  imageName: pulumi.interpolate`${region}-docker.pkg.dev/${gcp.config.project}/${supertokenForks.name}/supertokens-mysql`,
  build: {
    context: "../supertokens-docker-mysql"
  }
});

new docker.Image("supertokens-postgresql", {
  imageName: pulumi.interpolate`${region}-docker.pkg.dev/${gcp.config.project}/${supertokenForks.name}/supertokens-postgresql`,
  build: {
    context: "../supertokens-docker-postgresql"
  }
});

new gcp.artifactregistry.RepositoryIamMember(
  "supertokens-forks-repo-public-access",
  {
    repository: supertokenForks.name,
    location: region,
    role: "roles/artifactregistry.reader",
    member: "allUsers"
  }
);

new gcp.serviceusage.ConsumerQuotaOverride("supertokens-mysql-quota", {
  limit: urlencode.encode("/min/project/user"),
  overrideValue: "100",
  metric: urlencode.encode("artifactregistry.googleapis.com/user_requests"),
  service: "artifactregistry.googleapis.com",
  force: true
});
