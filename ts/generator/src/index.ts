import * as path from "path";

import * as marked from "marked";
import * as sanitize from "sanitize-html";
import * as fetch from "isomorphic-fetch";
import * as fs from "fs-extra";

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

export interface SanitizedPost {
    timestamp: number;
    title: string;
    url: string;
    html: string;
};

const main = async () => {
    const dttwRequest = await fetch("https://dttw.tech/api/author/zach");
    const apiResponse: DttwPost[] = await dttwRequest.json();

    const withHTML = apiResponse
        .map(({ timestamp, title: { text: title, url }, content }): SanitizedPost => {
            const asStandardMarkdown = content
                .replace(/\^\^\^/g, "")
                .replace(/:::aside(.|\n)+:::/g, "");
            console.log(asStandardMarkdown);
            const asHTML = marked(asStandardMarkdown);
            const html = sanitize(asHTML);

            return { timestamp: Math.floor(timestamp / 1000), title, url, html };
        })
        .sort(({ timestamp: t1 }, { timestamp: t2 }) => t2 - t1);

    await fs.writeFile(path.join(__dirname, "../../../_data/dttw_posts.json"), JSON.stringify(withHTML));
}

main();
