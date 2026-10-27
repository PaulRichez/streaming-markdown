# Changelog

`@paulrichez/streaming-markdown` is a fork of
[thetarnav/streaming-markdown](https://github.com/thetarnav/streaming-markdown) (`streaming-markdown` on npm),
by Damian Tarnawski. Versions up to 0.2.15 are the original's.

## 0.3.1

Maths now follows Pandoc's rules, and some text renders differently: pass `parser(renderer, {math: false})`
to turn maths off.

- `$` opens a formula only before a non-space, and closes it only after a non-space and not before a digit.
  `$5 and $10`, `$HOME and $PATH` and `$x$5` are text; `$x$`, `$2^{10}$` and `$\frac{1}{2}$.` are maths.
  `\$` is an escape, inside a formula too.
- A formula is written only once its closer is confirmed, so an `Equation_Inline` or `Equation_Block` token, once
  added, is maths, and its `end_token` is where the formula ends. While streaming, the text after a `$` that
  never closes (a price) appears at the end of its line, its table cell or its paragraph — or sooner, at a `$`
  after a space, a backtick, or past 1024 characters (4096 for display maths), when it is given back as text.
- `parser(renderer, {math: false})`: `$` is text, `\(` and `\[` are Markdown escapes, no `Equation_*` token is
  written and nothing is held back. The default is `true`; `parser(renderer)` keeps maths on.
- `$$…$$` and `\[…\]` on one line, or inside a paragraph, are display maths (`Equation_Block`) ending at their
  closer. Before, `$$x$$` was text and its closing `$$` opened a block that swallowed the rest of the reply.
- A display block opened by `$$` or `\[` at the end of a line now also ends at a blank line, as in Pandoc, and at
  a line that opens a block other than a list item (see below); what follows is Markdown again. Either closer
  still closes it, as before. Its lines are TeX, list items included: `$$\na\n- b\n$$` is one formula. In a
  quote, the quote's `>` starting a line is no longer written into the TeX: `> $$\n> x\n> $$` is `x`.
- An inline formula closes only on its own closer: `\(…\)` on `\)`, `$…$` on `$`. A `\(` that never closes is
  text, `(`, where it used to be an `Equation_Inline` holding the rest of the paragraph.
- A formula stops at a line that opens a block: a quote `>` (other than the `>` continuing the quote it is
  in), a rule (three `-`, `*` or `_`, spaces between, alone on its line) or an ATX heading (1 to 6 `#`, then a
  space). Inline maths also stops where smd opens a table row (`|`) or a list item (`-`, `*` or `+`, or digits
  and `.`, then a space). Display maths also stops at a code fence (```` ``` ```` or `~~~`), an HTML block that
  can interrupt a paragraph (`<` then `/`, `!` or `?`, or a block tag such as `<div>`, `<p>` or `<table>`, then
  a space, `>`, `/` or the line's end) and a `#` alone on its line; and at a list item (`-`, `*` or `+`, or
  digits and `.` or `)`, then a space) only when its opener had text after it on its own line
  (`Since $$a = b`), not when `$$` or `\[` ended its line. A formula still held back there is text; a display
  block already written ends there. Other lines are TeX: `$x =\n2y$`, `$a\n2) b$`, `$$a\n2b &= 3$$`,
  `$$\n|a+b| \le |a|+|b|\n$$` and `$$\n<x, y> = 0\n$$` are maths.
- A formula held back does not cross a list item, a table cell or row, a heading's line or a quote: only in a
  paragraph does it go on to the next line.
- The TeX of a formula arrives intact: no escape, emphasis, code span or space trimming is applied inside it.
- No autolink right after a `$` (GFM): `US$http://…`, `$$http://…` and `\$http://…` are text, maths or not.
- `$$` or `\[` at the very end of the input is text, no longer an empty `Equation_Block`. So is one ending its
  line when a blank line, the end or a line opening a block comes next (`$$\n\nx`): the block is added at its
  first line of TeX.
- Tests: maths in every block, streaming step by step, the limits, and `{math: false}`, written whole, char by
  char and at every two-chunk split.

## 0.3.0

First release of the fork. Same API as `streaming-markdown` 0.2.15: replace the import.

- A bracket inside a link's text no longer ends the link: `[[1]](url)` and `[a [b] c](url)` stay links while
  they stream ([upstream #39](https://github.com/thetarnav/streaming-markdown/issues/39)).
- Backticks in the middle of a line no longer close a code fence, as in `function_call(```
  ([upstream PR #46](https://github.com/thetarnav/streaming-markdown/pull/46), by Jason).
- A blockquote or a table inside a list item now stays in it
  ([upstream PR #42](https://github.com/thetarnav/streaming-markdown/pull/42), by Xuepoo), and a table's rows
  there no longer show their indentation as text.
- An underscore inside a word is no longer emphasis: `snake_case_name`, `[read_me.md](url)` — anywhere, a link's
  text included, and the same when a stream splits the word. Reported by
  [upstream PR #29](https://github.com/thetarnav/streaming-markdown/pull/29), which skipped all emphasis in links
  instead and would have broken `[**bold** text](url)`.
- Tests: every two-chunk split of a stream is checked for the cases above.
