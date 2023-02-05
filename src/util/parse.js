/* eslint-disable no-unused-vars */
import { getSVGFromName } from "./emojis";

const patterns = [
    {
        reg: /^(.*)(\n|$)/,
        hasNestedParsing: true,
        onlyFirst: true,
        string: '<div class="paragraph">$</div>',
        around: '',
    },
    {
        reg: /`{3}.*?\n(.+?)`{3}/s,
        hasNestedParsing: false,
        string: '<div class="block-code">$</div>',
        around: '&#96;&#96;&#96;',
    },
    {
        reg: /`([^\n]+?)`/,
        hasNestedParsing: false,
        string: '<span class="inline-code">$</span>',
        around: '&#96;',
    },
    {
        reg: /\*{2}(.+?)\*{2}/,
        hasNestedParsing: true,
        string: '<b>$</b>',
        around: '&#42;&#42;'
    },
    {
        reg: /_{2}(.+?)_{2}/,
        hasNestedParsing: true,
        string: '<u>$</u>',
        around: '&#95;&#95;'
    },
    {
        reg: /\*([^\n]+?)\*/,
        hasNestedParsing: true,
        string: '<i>$</i>',
        around: '&#42;'
    },
    {
        reg: /_([^\n]+?)_/,
        hasNestedParsing: true,
        string: '<i>$</i>',
        around: '&#95;'
    },
    {
        reg: /~~([^\n]+?)~~/,
        hasNestedParsing: true,
        string: '<s>$</s>',
        around: '&#126;&#126;'
    },
    {
        reg: /&lt;((?:@).+?)&gt;/,
        hasNestedParsing: false,
        string: '<a href="/user/$" target="_blank">$</a>',
        around: ''
    },
    {
        reg: /:([A-Za-z0-9\-_]+?):/,
        isCustomRendering: true,
        render: ([e]) => {
            const svg = getSVGFromName(e);
            if (svg) {
                return `<img src="${svg}" alt=":${e}:" width="auto" height="18" class="emoji">`;
            }
            return `:${e}:`;
        }
    },
    {
        reg: /(\[(.+?)\]\((.*?)\))/,
        isCustomRendering: true,
        render: ([_, label, link]) => {
            return `<a href="${link}" target="_blank">${label}</a>`;
        }
    },
    {
        reg: /((?:http|ftp|https)(?:[^ \n]+)\.(?:gif|jpg|jpeg|tiff|png))/,
        hasNestedParsing: false,
        string: `<img width="100%" style="max-width:200px;max-height:200px;" src="$" onerror="var a=document.createElement('a');a.href='$';a.textContent='$';this.outerHTML=a.outerHTML;this.xfine=true;if(this.xload){this.xload();}" />`,
    },
    {
        reg: /((?:http|ftp|https)(?:.*?))(?:\s|$)/,
        hasNestedParsing: false,
        string: '<a href="$" target="_blank">$</a>'
    }
];

const escape = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

export function parse(source, isNested = false) {
    const result = [];
    let text = !isNested ? source.replace(/[&<>]/g, (t) => escape[t] || '') : source;

    while (text.length > 0) {
        let i = 0;
        let current = patterns[0];
        let best;
        let match;

        do {
            if (isNested && current.onlyFirst) {
                i++;
                current = patterns[i];
                continue;
            }

            match = current.reg.exec(text);

            if (match && (!best || best.index > match.index)) {
                best = {
                    index: match.index,
                    type: i,
                    hasNestedParsing: current.hasNestedParsing,
                    isCustomRendering: current.isCustomRendering,
                    length: match[0].length,
                    match: match.slice(1)
                };
            }

            i++;
            current = patterns[i];
        } while (i < patterns.length);

        if (!best) {
            result.push({ type: -1, content: text });
            return result;
        }
        if (best.index > 0) {
            result.push({
                type: -1,
                content: text.substring(0, best.index)
            });
        }
        result.push({
            type: best.type,
            content: best.hasNestedParsing
                ? parse(best.match.join(''), true)
                : best.isCustomRendering
                    ? best.match
                    : best.match[0]
        });
        text = text.substring(best.index + best.length);

    }

    return result;
}

export function render(result) {
    let p;
    return result.map((i) => {
        if (i.type === -1) {
            return i.content;
        }
        p = patterns[i.type];
        if (p.isCustomRendering) {
            return p.render(i.content);
        }
        return p.string.replace(/\$/g, p.hasNestedParsing ? render(i.content) : i.content);


    }).join('');
}

export function parseAndRender (txt) {
    return render(parse(txt));
}