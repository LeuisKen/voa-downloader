'use strict';

const fs = require('fs');
const path = require('path');
const fetch = require('isomorphic-fetch');
const cheerio = require('cheerio');

const host = 'http://www.51voa.com/';

async function getText(url) {
    return fetch(url).then(res => res.text());
}

async function getBuffer(url) {
    return fetch(url).then(res => res.buffer());
}

async function main() {
    let audioList = [];
    for (let i = 1; i <= 10; i++) {
        let res = await getText(`${host}/American_Stories_${i}.html`);
        let $ = cheerio.load(res);
        let list = $('.list').find('ul li a');
        for (let i = 0; i < list.length; i++) {
            let title = $(list[i]).text().trim();
            let article = await getText(`${host}${$(list[i]).attr('href')}`);

            let $$ = cheerio.load(article);
            let text = $$('.content').text();
            let link = $$('#mp3').attr('href');

            audioList.push({
                title,
                text,
                link
            });
        }
    }

    fs.mkdirSync(`./dist`);

    for (let i = 0; i < audioList.length; i++) {
        console.log(`${(i / (audioList.length - 1)) * 100}%`);
        let { title, text, link } = audioList[i];
        const dir = path.join(__dirname, `./dist/${title} ${i}`);
        fs.mkdirSync(dir);
        let buffer = await getBuffer(link);
        fs.writeFileSync(`${dir}/audio.mp3`, buffer);
        fs.writeFileSync(`${dir}/text.txt`, text, 'utf8');
    }
}

main();
