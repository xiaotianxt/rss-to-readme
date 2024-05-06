import * as core from '@actions/core'
import Parser from 'rss-parser'

const parser = new Parser()
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const url = core.getInput('feed-url')
    const feed = await parser.parseURL(url)

    console.log(feed)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
