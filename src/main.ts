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
    const token =
      core.getInput('github_token') || (process.env.GITHUB_TOKEN as string)
    const request = await new Promise<any>(r => import('@octokit/request'))
    const orequest = request.defaults({
      headers: {
        authorization: `token ${token}`
      }
    })
    const lines = feed.items
      .slice(0, num)
      .map(item => {
        return '- [' + item.title + '](' + item.link + ')'
      })
      .join('\n')
    console.log(lines)

    // const owner = (process.env.GITHUB_REPOSITORY as string).split('/')[0]
    // const repo = (process.env.GITHUB_REPOSITORY as string).split('/')[1]

    // const { data } = await orequest('GET /repos/:owner/:repo/contents/:path', {
    //   owner,
    //   repo,
    //   path: 'README.md'
    // })

    // const content = Buffer.from(data.content, 'base64').toString('utf8')
    // console.log(content)
    // const newContent = content.replace(/\{FEED\}/, lines)
    // console.log(newContent)

    // await orequest('PUT /repos/:owner/:repo/contents/:path', {
    //   owner,
    //   repo,
    //   path: 'README.md',
    //   message: 'Update README.md',
    //   content: Buffer.from(newContent).toString('base64'),
    //   sha: data.sha
    // })

    // console.log(content, newContent)
  } catch (error) {
    console.log(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
