# Changelog

`@paulrichez/streaming-markdown` is a fork of
[thetarnav/streaming-markdown](https://github.com/thetarnav/streaming-markdown) (`streaming-markdown` on npm),
by Damian Tarnawski. Versions up to 0.2.15 are the original's.

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
