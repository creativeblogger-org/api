import Post from 'App/Models/Post'
import { promises as fsPromises } from 'fs'
import path from 'path'
import { Feed } from 'feed'
import { Marked } from '@ts-stack/markdown'

export default class RssGenerator {
  private convertMarkdownToHtml(content: string): string {
    return Marked.parse(content)
  }

  public generateRss(posts: Post[]) {
    const feed = new Feed({
      title: 'Creative Blogger',
      description: 'Projet collaboratif entre bloggers',
      id: 'https://creativeblogger.org',
      link: 'https://creativeblogger.org',
      language: 'fr',
      image: 'https://creativeblogger.org/assets/logo2-0c8c0aee.png',
      favicon: 'https://creativeblogger.org/assets/logo2-0c8c0aee.png',
      copyright: 'Copyleft, you can use the content',
      updated: new Date(2023, 11, 25),
      generator: 'awesome',
      feedLinks: {
        json: 'https://example.com/json',
        atom: 'https://example.com/atom',
      },
      author: {
        name: 'Creative Blogger Org',
        email: 'contact@creativeblogger.org',
        link: 'https://creativeblogger.org',
      },
    })
    posts.forEach((post) => {
      const htmlContent = this.convertMarkdownToHtml(post.content)
      feed.addItem({
        title: post.title,
        id: `https://creativeblogger.org/posts/${post.slug}`,
        link: `https://creativeblogger.org/posts/${post.slug}`,
        description: post.description,
        content: htmlContent,
        author: [
          {
            name: post.author.username,
            link: `https://creativeblogger.org/users/${post.author.username}`,
          },
        ],
        date: new Date(),
        image: post.image,
      })
    })
    return feed.rss2()
  }

  public async saveRssToFile(rss: string): Promise<void> {
    const rssFilePath = path.join(__dirname, '../../rss.xml')

    await fsPromises.writeFile(rssFilePath, rss, 'utf-8')
  }
}
