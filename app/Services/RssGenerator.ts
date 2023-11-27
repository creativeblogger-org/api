import Post from 'App/Models/Post'
import { promises as fsPromises } from 'fs'
import path from 'path'

export default class RssGenerator {
  public generateRss(posts: Post[]) {
    const rssItems = posts
      .map((post) => {
        const item = `
          <item>
            <title>${post.title}</title>
            <link>https://creativeblogger.org/posts/${post.slug}</link>
            <description><![CDATA[
            <div style="display: flex; align-items: center;">
             <div style="margin-right: 10px;">
              <img src="${post.image}" alt="${post.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">
             </div>
             <div>
              <h2>${post.description}</h2>
             </div>
            </div>
            ]]>
            </description>
            <pubDate>${post.createdAt}</pubDate>
            <author><![CDATA[${post.author.username}]]></author>
            <category><![CDATA[${post.tags}]]></category>
          </item>
        `
        return item
      })
      .join('')

    const rss = `
      <rss version="2.0">
        <channel>
          <title>Creative Blogger</title>
          <link>https://creativeblogger.org</link>
          <description>Projet collaboratif entre bloggers</description>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          <image>
            <url>https://creativeblogger.org/assets/logo2-0c8c0aee.png</url>
            <title>BDM</title>
            <link>https://creativeblogger.org</link>
            <width>32</width>
            <height>32</height>
          </image> 
          ${rssItems}
        </channel>
      </rss>
    `

    return rss
  }

  public async saveRssToFile(rss: string): Promise<void> {
    const rssFilePath = path.join(__dirname, '../../rss.xml')

    await fsPromises.writeFile(rssFilePath, rss, 'utf-8')
  }
}
