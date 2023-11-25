import Post from 'App/Models/Post';
import { promises as fsPromises } from 'fs';
import path from 'path';
import marked from 'marked';

export default class RssGenerator {      
  public generateRss(posts: Post[]): string {
    const rssItems = posts
      .map((post) => {
        const htmlContent = marked(post.content)
        const item = `
          <item>
            <title>${post.title}</title>
            <link>https://creativeblogger.org/posts/${post.slug}</link>
            <description>${post.description}</description>
            <description>${htmlContent}</description>
            <pubDate>${post.createdAt}</pubDate>
            <author>${post.author.username}</author>
          </item>
        `;
        return item;
      })
      .join('');

    const rss = `
      <rss version="2.0">
        <channel>
          <title>CreativeBlogger</title>
          <link>https://creativeblogger.org</link>
          <description>Coopérativité de blogger</description>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          ${rssItems}
        </channel>
      </rss>
    `;

    return rss;
  }

  public async saveRssToFile(rss: string): Promise<void> {
    const rssFilePath = path.join(__dirname, '../../rss.xml');

    await fsPromises.writeFile(rssFilePath, rss, 'utf-8');
  }
}