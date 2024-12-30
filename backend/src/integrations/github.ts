import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

const createPullRequest = async (data: any) => {
    const response = await octokit.rest.pulls.create(data);
    return response;
}

createPullRequest.schema = {
    owner: "string",
    repo: "string",
    title: "string",
    body: "string",
    head: "string",
    base: "string"
}

export { createPullRequest };