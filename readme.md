# Streaming *Markdown*

[![version](https://img.shields.io/npm/v/@paulrichez/streaming-markdown?logo=npm)](https://www.npmjs.com/package/@paulrichez/streaming-markdown) [![github](https://img.shields.io/badge/GitHub-streaming--markdown-orange?logo=github)](https://github.com/PaulRichez/streaming-markdown)

**Experiment making a streaming markdown parser *à la ChatGPT.***

> [!NOTE]
> **This is a fork.** `@paulrichez/streaming-markdown` is a maintained fork of
> [**thetarnav/streaming-markdown**](https://github.com/thetarnav/streaming-markdown) by
> [Damian Tarnawski](https://github.com/thetarnav), the original author, published as
> [`streaming-markdown`](https://www.npmjs.com/package/streaming-markdown) on npm. The original has had no
> release since 0.2.15 (May 2025), so this fork carries the fixes below on top of it, under the same MIT
> license. The API is the original's plus one optional argument, `parser(renderer, options)`; maths follows
> Pandoc's rules and can be turned off, see [`parser` options](#parser-options).
>
> Fixed in the fork (see [CHANGELOG.md](./CHANGELOG.md)):
> - a bracket inside a link's text no longer ends the link: `[[1]](url)`, `[a [b] c](url)`
>   ([upstream #39](https://github.com/thetarnav/streaming-markdown/issues/39));
> - backticks in the middle of a line no longer close a code fence
>   ([upstream PR #46](https://github.com/thetarnav/streaming-markdown/pull/46), by its author);
> - a blockquote or a table inside a list item stays in it
>   ([upstream PR #42](https://github.com/thetarnav/streaming-markdown/pull/42), by its author, plus the
>   table's row indentation);
> - an underscore inside a word is no longer emphasis: `snake_case_name`, `[read_me.md](url)`
>   ([upstream PR #29](https://github.com/thetarnav/streaming-markdown/pull/29) reported it);
> - maths follows Pandoc's rules: `$5 and $10` is text, `$$x$$` on one line is display maths, and a formula is
>   written only once its closer is confirmed.
>
> It is maintained for [aparté](https://apartejs.dev)'s `@aparte/plugin-streaming-markdown`, and usable on its
> own like the original. Issues about the fork go to
> [this repository](https://github.com/PaulRichez/streaming-markdown/issues).

---

## Installation

Install `@paulrichez/streaming-markdown` package from npm.

```bash
npm install @paulrichez/streaming-markdown
```

*Or just copy [**`smd.js`**](https://github.com/PaulRichez/streaming-markdown/blob/main/smd.js) file to your project.*

Or use the [CDN link](https://www.jsdelivr.com/package/npm/@paulrichez/streaming-markdown).\
It's a minified *(3kB Gzip)* version of the package, with only the necessary functions exported.\
See the exports in [`smd_min_entry.js`](https://github.com/PaulRichez/streaming-markdown/blob/main/smd_min_entry.js).\
The package uses ES module exports, so you need to use `type="module"` in your script tag.

```html
<script type="module">
    import * as smd from "https://cdn.jsdelivr.net/npm/@paulrichez/streaming-markdown/smd.min.js"
    // ...
</script>
```

## Usage

First create new markdown `Parser` by calling `parser` function.\
Its first argument is a `Renderer` object, which is an interface to render the parsed markdown tokens to the DOM.\
There are two built-in renderers—`default_renderer` and `logger_renderer`—that you can try at first.

```js
import * as smd from "@paulrichez/streaming-markdown"

const element  = document.getElementById("markdown")
const renderer = smd.default_renderer(element)
const parser   = smd.parser(renderer)
```

### `parser` options

An optional second argument, `Parser_Options`, sets what the parser recognises.

```js
const parser = smd.parser(renderer, {math: false})
```

| Field  | Type      | Default | Description |
| ------ | --------- | ------- | ----------- |
| `math` | `boolean` | `true`  | Recognise maths: `$x$` and `\(x\)` as `Equation_Inline`, `$$x$$` and `\[x\]` as `Equation_Block`.<br>`false`: `$` is text, `\(` and `\[` are Markdown escapes, and no `Equation_*` token is written. |

With maths on, `$` follows [Pandoc's rules](https://pandoc.org/MANUAL.html#math): the opener is followed by a
non-space, the closer follows a non-space and is not followed by a digit, so `$5 and $10` is text. A `$`
inside braces is TeX, not the closer: `$\text{in $x$ units}$` is one formula.
A formula is held back until its closer is confirmed, then written as one token, and its `end_token` is where
it ends: nothing written is ever taken back. The text after a `$` that never closes appears at the end of its
line, cell or paragraph, or past 1024 characters (4096 for display maths). A formula held back does not cross a
list item, a table cell, a heading's line or a quote.

A formula stops at a line that opens a block: a quote `>` (not the one continuing its own quote), a rule or
an ATX heading (`#` to `######`, then a space). Inline maths also stops at a table row `|` and a list item
(`-`, `*`, `+` or `1.`, then a space). Display maths also stops at a code fence (```` ``` ```` or `~~~`), an
HTML block that can interrupt a paragraph (`</`, `<!`, `<?`, or a block tag such as `<div>` or `<p>`) and a `#`
alone on its line; and at a list item (`-`, `*`, `+`, `1.` or `1)`, then a space) only when its opener had text
after it on its own line (`Since $$a = b`). A formula still held back there is text. Other lines are TeX:
`$x =\n2y$`, `$$\n|a+b| \le |a|+|b|\n$$` and `$$\n<x, y> = 0\n$$` are maths.

A display block opened by `$$` or `\[` at the end of a line is written as it streams, from its first line of
TeX: its lines are TeX, list items and `|` lines included, and it ends at `$$`, `\]`, a blank line or a line
that opens another block. A blank line, the end, or such a line right after the opener makes the opener text.
Ended by a blank line or such a line, without its closer, it was not maths: the renderer gets
`set_attr(Attr.Unclosed, opener)` before its `end_token` (see [attributes](#attributes)). A `$$` or `\[` ending a
table row's line is text.

### `write` function

Then, you can start streaming markdown to the `Parser` by calling `parser_write` function with the chunk of markdown string.

```js
smd.parser_write(parser, "# Streaming Markdown\n\n")
```

*You can write **as many times as you want** to stream the markdown.*

The parser is optimistic.
When it sees the start of an inline code block or code block,
it will immediately style the element accordingly.

E.g. `` `print("hello wor `` should be rendered as `<code>print("hello wor</code>`

While the text is streamed in, the user should be able to select the text that has already been streamed in and copy it.
*(The parser is only adding new elements to the DOM, not modifying the existing ones.)*

### `end` function

Finally, you can end the stream by calling `end` function.

It will reset the `Parser` state and flush the remaining markdown.

```js
smd.parser_end(parser)
```

### Renderer interface

| Field name  | Type                   | Description |
| ----------- | ---------------------- | ----------- |
| `data`      | `T`                    | User data object.<br>Available as first param in callbacks. |
| `add_token` | `Renderer_Add_Token<T>`| When the tokens starts. |
| `end_token` | `Renderer_End_Token<T>`| When the token ends. |
| `add_text`  | `Renderer_Add_Text<T>` | To append text to current token.<br>Can be called multiple times or none. |
| `set_attr`  | `Renderer_Set_Attr<T>` | Set additional attributes of current token eg. the link url. |

### Attributes

`set_attr(data, type, value)` is called on the current token with one of `Attr`:

| `Attr`     | On               | Value |
| ---------- | ---------------- | ----- |
| `Href`     | `Link`, `Raw_URL`| The url. |
| `Src`      | `Image`          | The url. |
| `Lang`     | `Code_Fence`     | The language after the opening fence. |
| `Checked`  | `Checkbox`       | `""`, when the box is checked. |
| `Start`    | `List_Ordered`   | The first number, when it is not 1. |
| `Unclosed` | `Equation_Block` | The opener, `"$$"` or `"\\["`. Called just before the block's `end_token` when it ended without its closer, at a blank line or a line that opens a block: it was not maths, and should be shown as text. The default renderer replaces the element with its opener (`[` for `\[`), a newline and its TeX. |

## Markdown features

- [x] Paragraphs
- [x] Line breaks
    - [x] don't end tokens
    - [x] Escaping line breaks
- [x] Trim unnecessary spaces
- [x] Headers
    - [ ] ~~Alternate syntax~~ *(not planned)*
- [x] Code Block with indent
- [x] Code Block with triple backticks
    - [x] language attr
    - [x] with many backticks
- [x] `` `inline code` `` with backticks
    - [x] with many backticks
    - [x] trim spaces ` code `
- [x] *italic* with single asterisks
- [x] **Bold** with double asterisks
- [x] _italic_ with underscores
- [x] __Bold__ with double underscores
- [x] Special cases:
    - [x] **bold*bold>em***
    - [x] ***bold>em*bold**
    - [x] *em**em>bold***
    - [x] ***bold>em**em*
- [x] \* or \_ cannot be surrounded by spaces
- [x] Strikethrough ~~example~~
- [x] Escape characters (e.g. \* or \_ with \\\* or \\\_)
- [x] \[Link\](url)
    - [x] `href` attr
- [ ] Raw URLs
    - [ ] http://example.com
    - [ ] https://example.com
    - [ ] www.example.com
    - [ ] example@fake.com
    - [ ] mailto:example@fake.com
- [x] Autolinks
    - [ ] www.example.com
    - [x] http://example.com
    - [x] https://example.com
    - [ ] example@fake.com
    - [ ] mailto:example@fake.com
- [ ] Reference-style Links
- [x] Images
    - [x] `src` attr
- [x] Horizontal rules
    - [x] With `---`
    - [x] With `***`
    - [x] With `___`
- [x] Unordered lists
- [x] Ordered lists
    - [x] `start` attr
- [x] Task lists
- [x] Nested lists
- [ ] One-line nested lists
- [ ] Adding Elements in Lists
- [x] Blockquotes
- [x] Tables
    - [ ] Align cols right/center
    - [ ] Multiline cells
- [ ] Subscript
- [ ] Superscript
- [ ] Emoji Shortcodes
- [ ] Html tags (e.g. `<div>`, `<span>`, `<a>`, `<img>`, etc.)
    - [x] Line breaks `<br>`, `<br/>`
- [x] LaTex tags for blocks `\[...\]`, `$$...$$` and inline `\(...\)` or `$...$`
    - [x] Pandoc's rules for `$` (`$5 and $10` is text)
    - [x] Off with `parser(renderer, {math: false})`

If you think that something is missing or doesn't work, please [make an issue](https://github.com/PaulRichez/streaming-markdown/issues).

## Credits

Written by [Damian Tarnawski](https://github.com/thetarnav) as
[thetarnav/streaming-markdown](https://github.com/thetarnav/streaming-markdown). This fork is maintained by
[Paul Richez](https://github.com/PaulRichez); the upstream contributions it carries keep their authors in the
git history. MIT license, see [license](./license).

🔴Ⓜ️⬇️
