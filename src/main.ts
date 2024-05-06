import * as core from '@actions/core'
import Parser from 'rss-parser'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const url = core.getInput('feed-url', { required: true })
    const num = Number(core.getInput('num')) || 5
    const feed = await new Parser().parseURL(url)
    const token = core.getInput('token', { required: true })
    const Octokit = await new Promise<any>(resolve => {
      import('@octokit/core').then(({ Octokit }) => {
        resolve(Octokit)
      })
    })

    const octokit = new Octokit({
      auth: token
    })
    const lines = feed.items
      .slice(0, num)
      .map(item => {
        return '- [' + item.title + '](' + item.link + ')'
      })
      .join('\n')

    const owner = (process.env.GITHUB_REPOSITORY as string).split('/')[0]
    const repo = (process.env.GITHUB_REPOSITORY as string).split('/')[1]

    const { data } = await octokit.request(
      'GET /repos/:owner/:repo/contents/:path',
      {
        owner,
        repo,
        path: 'README.md'
      }
    )

    const content = Buffer.from(data.content, 'base64').toString('utf8')
    const newContent = content.replace(/\{FEED\}/, lines)

    await octokit.request('PUT /repos/:owner/:repo/contents/:path', {
      owner,
      repo,
      path: 'README.md',
      message: 'Update README.md',
      content: Buffer.from(newContent).toString('base64'),
      sha: data.sha
    })
  } catch (error) {
    console.log(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
