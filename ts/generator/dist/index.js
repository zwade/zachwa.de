"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("node:path");
const marked = require("marked");
const sanitize = require("sanitize-html");
const fetch = require("isomorphic-fetch");
const fs = require("node:fs/promises");
;
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const dttwRequest = yield fetch("https://dttw.tech/api/author/zach");
    const dttwResponse = yield dttwRequest.json();
    const dttwPosts = dttwResponse
        .map(({ timestamp, title: { text: title, url }, content }) => {
        const asStandardMarkdown = content
            .replace(/\^\^\^/g, "")
            .replace(/:::aside(.|\n)+:::/g, "");
        const asHTML = marked.marked(asStandardMarkdown);
        const html = sanitize(asHTML);
        return { timestamp: Math.floor(timestamp / 1000), title, url: `https://dttw.tech${url}`, html, kind: "dttw" };
    });
    const wishRequest = yield fetch("https://compassrx.dev/api/posts.json");
    const wishResponse = yield wishRequest.json();
    const wishPosts = wishResponse.map(({ id, slug, title, description, date }) => {
        return {
            timestamp: Math.floor(new Date(date).getTime() / 1000),
            title,
            url: `https://compassrx.dev/blog/${id}/${slug}`,
            html: description,
            kind: "wish"
        };
    });
    const allPosts = [...dttwPosts, ...wishPosts].sort((a, b) => b.timestamp - a.timestamp);
    yield fs.writeFile(path.join(__dirname, "../../../_data/all_posts.json"), JSON.stringify(allPosts));
});
main();
