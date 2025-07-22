import * as path from "node:path";

import * as marked from "marked";
import * as sanitize from "sanitize-html";
import * as fetch from "isomorphic-fetch";
import * as fs from "node:fs/promises";

interface DttwPost {
    timestamp: number;
    guid: string;
    title: {
        text: string;
        url: string;
    };
    slug: string;
    content: string;
}

interface WishPost {
    id: string;
    slug: string;
    title: string;
    body: string;
    image: string;
    description: string;
    date: string;
    kind: string;
    author: string;
    ogImage?: string;
    hidden?: boolean;
}

export interface SanitizedPost {
    timestamp: number;
    title: string;
    url: string;
    html: string;
    kind: "dttw" | "wish"
};

const main = async () => {
    const dttwRequest = await fetch("https://dttw.tech/api/author/zach");
    const dttwResponse: DttwPost[] = await dttwRequest.json();

    const dttwPosts = dttwResponse
        .map(({ timestamp, title: { text: title, url }, content }): SanitizedPost => {
            const asStandardMarkdown = content
                .replace(/\^\^\^/g, "")
                .replace(/:::aside(.|\n)+:::/g, "");
            const asHTML = marked.marked(asStandardMarkdown) as string;
            const html = sanitize(asHTML);

            return { timestamp: Math.floor(timestamp / 1000), title, url: `https://dttw.tech${url}`, html, kind: "dttw" };
        })


    const wishRequest = await fetch("https://compassrx.dev/api/posts.json");
    const wishResponse: WishPost[] = await wishRequest.json();
    const wishPosts = wishResponse.map(({ id, slug, title, description, date }): SanitizedPost => {
        return {
            timestamp: Math.floor(new Date(date).getTime() / 1000),
            title,
            url: `https://compassrx.dev/blog/${id}/${slug}`,
            html: description,
            kind: "wish"
        }
    })

    const allPosts = [...dttwPosts, ...wishPosts].sort((a, b) => b.timestamp - a.timestamp);

    await fs.writeFile(path.join(__dirname, "../../../_data/all_posts.json"), JSON.stringify(allPosts));
}

main();
