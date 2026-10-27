/*
Streaming Markdown Parser and Renderer
MIT License
Copyright 2024 Damian Tarnawski
https://github.com/thetarnav/streaming-markdown
*/

export const
    DOCUMENT        =  1,
    PARAGRAPH       =  2,
    HEADING_1       =  3,
    HEADING_2       =  4,
    HEADING_3       =  5,
    HEADING_4       =  6,
    HEADING_5       =  7,
    HEADING_6       =  8,
    CODE_BLOCK      =  9,
    CODE_FENCE      = 10,
    CODE_INLINE     = 11,
    ITALIC_AST      = 12,
    ITALIC_UND      = 13,
    STRONG_AST      = 14,
    STRONG_UND      = 15,
    STRIKE          = 16,
    LINK            = 17,
    RAW_URL         = 18,
    IMAGE           = 19,
    BLOCKQUOTE      = 20,
    LINE_BREAK      = 21,
    RULE            = 22,
    LIST_UNORDERED  = 23,
    LIST_ORDERED    = 24,
    LIST_ITEM       = 25,
    CHECKBOX        = 26,
    TABLE           = 27,
    TABLE_ROW       = 28,
    TABLE_CELL      = 29,
    EQUATION_BLOCK  = 30,
    EQUATION_INLINE = 31,
    NEWLINE         = 101,
    MAYBE_URL       = 102,
    MAYBE_TASK      = 103,
    MAYBE_BR        = 104,
    MAYBE_EQ_BLOCK  = 105,
    MAYBE_EQ        = 106

/** @enum {(typeof Token)[keyof typeof Token]} */
export const Token = /** @type {const} */({
    Document:       DOCUMENT,
    Blockquote:     BLOCKQUOTE,
    Paragraph:      PARAGRAPH,
    Heading_1:      HEADING_1,
    Heading_2:      HEADING_2,
    Heading_3:      HEADING_3,
    Heading_4:      HEADING_4,
    Heading_5:      HEADING_5,
    Heading_6:      HEADING_6,
    Code_Block:     CODE_BLOCK,
    Code_Fence:     CODE_FENCE,
    Code_Inline:    CODE_INLINE,
    Italic_Ast:     ITALIC_AST,
    Italic_Und:     ITALIC_UND,
    Strong_Ast:     STRONG_AST,
    Strong_Und:     STRONG_UND,
    Strike:         STRIKE,
    Link:           LINK,
    Raw_URL:        RAW_URL,
    Image:          IMAGE,
    Line_Break:     LINE_BREAK,
    Rule:           RULE,
    List_Unordered: LIST_UNORDERED,
    List_Ordered:   LIST_ORDERED,
    List_Item:      LIST_ITEM,
    Checkbox:       CHECKBOX,
    Table:          TABLE,
    Table_Row:      TABLE_ROW,
    Table_Cell:     TABLE_CELL,
    Equation_Block: EQUATION_BLOCK,
    Equation_Inline:EQUATION_INLINE,
})

/**
 * @param   {Token} type
 * @returns {string    } */
export function token_to_string(type) {
    switch (type) {
    case DOCUMENT:       return "Document"
    case BLOCKQUOTE:     return "Blockquote"
    case PARAGRAPH:      return "Paragraph"
    case HEADING_1:      return "Heading_1"
    case HEADING_2:      return "Heading_2"
    case HEADING_3:      return "Heading_3"
    case HEADING_4:      return "Heading_4"
    case HEADING_5:      return "Heading_5"
    case HEADING_6:      return "Heading_6"
    case CODE_BLOCK:     return "Code_Block"
    case CODE_FENCE:     return "Code_Fence"
    case CODE_INLINE:    return "Code_Inline"
    case ITALIC_AST:     return "Italic_Ast"
    case ITALIC_UND:     return "Italic_Und"
    case STRONG_AST:     return "Strong_Ast"
    case STRONG_UND:     return "Strong_Und"
    case STRIKE:         return "Strike"
    case LINK:           return "Link"
    case RAW_URL:        return "Raw URL"
    case IMAGE:          return "Image"
    case LINE_BREAK:     return "Line_Break"
    case RULE:           return "Rule"
    case LIST_UNORDERED: return "List_Unordered"
    case LIST_ORDERED:   return "List_Ordered"
    case LIST_ITEM:      return "List_Item"
    case CHECKBOX:       return "Checkbox"
    case TABLE:          return "Table"
    case TABLE_ROW:      return "Table_Row"
    case TABLE_CELL:     return "Table_Cell"
    case EQUATION_BLOCK: return "Equation_Block"
    case EQUATION_INLINE:return "Equation_Inline"
    }
}

export const
    HREF     = 1,
    SRC      = 2,
    LANG     = 4,
    CHECKED  = 8,
    START    = 16,
    /* On an Equation_Block, just before its end_token: the block ended without its closer, at
       a blank line or a line that opens a block, so it was not maths (Pandoc). The value is
       its opener, "$$" or "\\[". The default renderer turns the block back into text. */
    UNCLOSED = 32

/** @enum {(typeof Attr)[keyof typeof Attr]} */
export const Attr = /** @type {const} */({
    Href    : HREF,
    Src     : SRC,
    Lang    : LANG,
    Checked : CHECKED,
    Start   : START,
    Unclosed: UNCLOSED,
})

/**
 * @param   {Attr} type
 * @returns {string    } */
export function attr_to_html_attr(type) {
    switch (type) {
    case HREF:     return "href"
    case SRC :     return "src"
    case LANG:     return "class"
    case CHECKED:  return "checked"
    case START:    return "start"
    case UNCLOSED: return "data-unclosed"
    }
}

/**
 * @param   {number} level
 * @returns {Token } */
export const level_to_heading = (level) => {
    switch (level) {
    case 1:  return HEADING_1
    case 2:  return HEADING_2
    case 3:  return HEADING_3
    case 4:  return HEADING_4
    case 5:  return HEADING_5
    default: return HEADING_6
    }
}
export const heading_from_level = level_to_heading

/**
 * @param   {Token} token
 * @returns {number} */
export const heading_to_level = (token) => {
    switch (token) {
    case HEADING_1: return 1
    case HEADING_2: return 2
    case HEADING_3: return 3
    case HEADING_4: return 4
    case HEADING_5: return 5
    case HEADING_6: return 6
    default:        return 0
    }
}

/**
 * @typedef  {object      } Parser
 * @property {Any_Renderer} renderer        - {@link Renderer} interface
 * @property {string      } text            - Text to be added to the last token in the next flush
 * @property {string      } pending         - Characters for identifying tokens
 * @property {Uint32Array } tokens          - Current token and it's parents (a slice of a tree)
 * @property {number      } len             - Number of tokens in types without root
 * @property {number      } token           - Last token in the tree
 * @property {Uint8Array  } spaces
 * @property {string      } indent
 * @property {number      } indent_len
 * @property {number      } fence_end       - For {@link Token.Code_Fence} parsing
 * @property {number      } fence_start
 * @property {number      } blockquote_idx  - For Blockquote parsing
 * @property {string      } hr_char         - For horizontal rule parsing
 * @property {number      } hr_chars        - For horizontal rule parsing
 * @property {number      } table_state
 * @property {number      } link_depth      - Brackets opened inside a Link or Image's text, not yet closed
 * @property {string      } last_char       - Last character of the text already flushed, "" after a token boundary
 * @property {boolean     } math            - Maths is recognised, see {@link Parser_Options}
 * @property {string      } eq_open         - Opener of the formula held back, or of the display block being written: "$", "\\(", "$$", "\\[" or ""
 * @property {string      } eq_text         - TeX of a formula held back until its closer is confirmed
 * @property {boolean     } eq_space        - The held TeX ends on a space, a tab or a newline
 * @property {boolean     } eq_blank        - Only spaces since a newline: in held TeX, or in an Equation_Block's line
 * @property {string      } eq_line         - Start of a formula's line that may still open a block, see {@link line_opens}
 * @property {number      } eq_head         - The held formula's first line, after the opener: 0 only spaces yet, 1 text, 2 none
 * @property {number      } eq_depth        - Braces open in the held TeX: a $ inside them is TeX, \text{in $x$ units}
 * @property {number      } eq_rerun       - Text being given back by a held formula: 0 none, 1 once, 2 twice or more
 * @property {number      } eq_rerun_at     - {@link Parser.eq_rerun} when the held formula was opened
 */

/* The longest formula held back before it is given up as text. An inline formula is
   rarely over 200 characters and a display formula on one line rarely over a few hundred:
   past these, what is held is text, and holding it longer would stall the stream. */
const EQ_INLINE_MAX  = 1024
const EQ_DISPLAY_MAX = 4096

/* Tags of an HTML block that can interrupt a paragraph (part of CommonMark's type 6 list):
   such a line ends a display formula, see line_opens. <x, y> is TeX. */
const HTML_BLOCK_TAGS = [
    "address", "article", "aside", "blockquote", "details", "dialog", "div", "dl", "fieldset",
    "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main",
    "nav", "ol", "p", "pre", "script", "section", "style", "table", "textarea", "ul",
]

/**
 * @typedef  {object  } Parser_Options
 * @property {boolean=} math - Recognise maths: `$x$`, `$$x$$`, `\(x\)`, `\[x\]`. Default `true`.
 *                             When `false`, `$` is text, `\(` and `\[` are Markdown escapes,
 *                             no Equation token is written and nothing is held back.
 */

const TOKEN_ARRAY_CAP = 24

/**
 * Makes a new Parser object.
 * @param   {Any_Renderer   } renderer
 * @param   {Parser_Options=} options
 * @returns {Parser         } */
export function parser(renderer, options) {
    const tokens = new Uint32Array(TOKEN_ARRAY_CAP)
    tokens[0] = DOCUMENT
    return {
        renderer   : renderer,
        text       : "",
        pending    : "",
        tokens     : tokens,
        len        : 0,
        token      : DOCUMENT,
        fence_end: 0,
        blockquote_idx: 0,
        hr_char    : '',
        hr_chars   : 0,
        fence_start: 0,
        spaces     : new Uint8Array(TOKEN_ARRAY_CAP),
        indent     : "",
        indent_len : 0,
        table_state: 0,
        link_depth : 0,
        last_char  : "",
        math       : options?.math !== false,
        eq_open    : "",
        eq_text    : "",
        eq_space   : false,
        eq_blank   : false,
        eq_line    : "",
        eq_head    : 0,
        eq_depth   : 0,
        eq_rerun   : 0,
        eq_rerun_at: 0,
    }
}

/**
 * Finish rendering the markdown - flushes any remaining text.
 * @param   {Parser} p
 * @returns {void  } */
export function parser_end(p) {
    /* A formula still held back is closed by the end ($x$) or was text, which can hold
       back another one ($5 and \(x). Nothing of the end is written into it. */
    while (p.token === MAYBE_EQ) {
        if ("$" === p.eq_open && "$" === p.pending) {
            p.pending = ""
            eq_commit(p)
        } else {
            eq_flush(p)
        }
    }
    /* $$ or \[ with nothing after it, or only spaces on the next line, or the start of a line
       that opens a block: text. A line of TeX after it opens the block. */
    if (p.token === MAYBE_EQ_BLOCK) {
        const after = p.pending.slice(2)
        if (p.eq_line !== "" && 0 === line_opens(p, '\n', true, false)) {
            add_text(p)
            add_token(p, EQUATION_BLOCK)
            p.eq_open  = p.pending.slice(0, 2)
            p.eq_blank = true
            p.pending  = ""
            p.blockquote_idx = 0 // the line is read again
            parser_write(p, after.slice(1))
        } else {
            p.token = p.tokens[p.len]
            p.text += '\\' === p.pending[0] ? '[' : p.pending.slice(0, 2)
            p.pending = ""
            parser_write(p, after)
        }
    }
    /* A display block still being written, at a line's start: the end is no blank line, so
       it ends as in 0.3.1, without UNCLOSED */
    if (p.token === EQUATION_BLOCK && "" === p.eq_line && p.eq_blank) {
        p.text += p.pending
        p.pending = ""
        eq_block_end(p, false)
    }
    if (p.pending.length > 0) {
        parser_write(p, "\n")
    }
}

/**
 * @param   {Parser} p
 * @returns {void  } */
function add_text(p) {
    if (p.text.length === 0) return
    console.assert(p.len > 0, "Never adding text to root")
    p.renderer.add_text(p.renderer.data, p.text)
    p.last_char = p.text.slice(-1)
    p.text = ""
}

/**
 * The character the text ends on, flushed or not: a word goes on across a chunk boundary.
 * @param   {Parser} p
 * @returns {string} */
function text_end(p) {
    return p.text.length > 0 ? p.text.slice(-1) : p.last_char
}

/**
 * @param   {Parser} p
 * @returns {void  } */
function ensure_paragraph(p) {
    switch (p.token) {
    case LINE_BREAK:
    case DOCUMENT:
    case BLOCKQUOTE:
    case LIST_ORDERED:
    case LIST_UNORDERED:
        add_token(p, PARAGRAPH)
    }
}

/**
 * @param   {Parser} p
 * @param   {string} text
 * @returns {void  } */
function push_text(p, text) {
    ensure_paragraph(p)
    p.text += text
}

/**
 * @param   {Parser} p
 * @returns {void  } */
function end_token(p) {
    console.assert(p.len > 0, "No nodes to end")
    p.last_char = ""
    p.len -= 1
    p.token = /** @type {Token} */ (p.tokens[p.len])
    p.renderer.end_token(p.renderer.data)
}

/**
 * @param   {Parser} p
 * @param   {Token } token
 * @returns {void  } */
function add_token(p, token) {
    /*
     If a list doesn't start with a list item
     it means that there was a newline after the list:

     1. foo
     2. bar
     <empty line>
     <not_a_list_item> <- new token
    */
    if ((p.tokens[p.len] === LIST_ORDERED || p.tokens[p.len] === LIST_UNORDERED) &&
        token !== LIST_ITEM
    ) {
        end_token(p)
    }

    p.last_char = ""
    p.len += 1
    p.tokens[p.len] = token
    p.token = token
    p.renderer.add_token(p.renderer.data, token)
}

/**
 * Hold a formula back: the renderer cannot take a token back,
 * so nothing is written until the closer is confirmed.
 * @param   {Parser} p
 * @param   {string} open
 * @returns {void  } */
function eq_hold(p, open) {
    p.token       = MAYBE_EQ
    p.eq_open     = open
    p.eq_text     = ""
    p.eq_space    = false
    p.eq_blank    = false
    p.eq_line     = ""
    p.eq_head     = 0
    p.eq_depth    = 0
    p.eq_rerun_at = p.eq_rerun
    p.pending     = ""
}

/**
 * Add a character to the held TeX, and keep track of where it stands.
 * @param   {Parser} p
 * @param   {string} char
 * @returns {void  } */
function eq_add(p, char) {
    p.eq_text += char
    p.eq_space = ' ' === char || '\t' === char || '\n' === char
    p.eq_blank = '\n' === char || p.eq_blank && p.eq_space
    if (0 === p.eq_head) p.eq_head = '\n' === char ? 2 : p.eq_space ? 0 : 1
}

/**
 * A held formula met its closer: it is maths, written whole.
 * @param   {Parser} p
 * @returns {void  } */
function eq_commit(p) {
    add_text(p)
    add_token(p, "$" === p.eq_open || "\\(" === p.eq_open ? EQUATION_INLINE : EQUATION_BLOCK)
    p.text = p.eq_text
    add_text(p)
    end_token(p)
    p.eq_open = ""
    p.eq_text = ""
    p.eq_line = ""
}

/**
 * End the display block being written (opened by $$ or \[ ending its line, see MAYBE_EQ_BLOCK).
 * Ended without its own closer — at a blank line, or at a line that opens a block — it was not
 * maths, but the renderer has it already: set_attr(UNCLOSED, opener) says so, before end_token.
 * @param   {Parser } p
 * @param   {boolean} unclosed
 * @returns {void   } */
function eq_block_end(p, unclosed) {
    add_text(p)
    if (unclosed) p.renderer.set_attr(p.renderer.data, UNCLOSED, p.eq_open)
    p.eq_open = ""
    end_token(p)
}

/**
 * A held formula has no closer: it was text, given back to the parser as written.
 * @param   {Parser} p
 * @returns {void  } */
function eq_flush(p) {
    const held  = p.eq_text + p.pending
    const rerun = p.eq_rerun
    /* \( and \[ were escapes: ( and [ */
    p.text   += '\\' === p.eq_open[0] ? p.eq_open[1] : p.eq_open
    p.token   = p.tokens[p.len]
    p.eq_open = ""
    p.eq_text = ""
    p.eq_line = ""
    p.pending = ""
    /* Text given back can hold back a formula again (Pandoc retries at the next opener).
       Given back a second time, only a $ formula can, and its TeX has no $ to open another:
       every character is parsed a bounded number of times. */
    p.eq_rerun = 0 === p.eq_rerun_at ? 1 : 2
    parser_write(p, held)
    p.eq_rerun = rerun
}

/**
 * Read one more character of a formula's line, after its indentation, as the start of a block.
 * A line that opens a block ends the paragraph first (Pandoc parses blocks first), and the
 * formula with it. `p.eq_line` keeps what was read of the line while that is not known yet,
 * and stays short: a rule's first three characters, a list number's nine digits, a tag's name.
 *
 * Every formula stops at a quote `>`, a rule (three `-`, `*` or `_`, spaces between, alone on
 * the line) and an ATX heading (1-6 `#`, then a space). Inline maths also stops at the blocks
 * smd opens there: a table row `|`, a list item (`-`, `*`, `+` or digits with `.`, then a
 * space). Display maths also stops at a code fence (``` or ~~~), an HTML block that can
 * interrupt a paragraph (`<` then `/`, `!` or `?`, or a block tag of {@link HTML_BLOCK_TAGS}
 * then a space, `>`, `/` or the end of the line) and a heading's `#` alone on its line; and at
 * a list item (`-`, `*`, `+` or digits with `.` or `)`, then a space) only with `lists`: when
 * the opener had text after it on its own line. Its other lines are TeX: `2b &= 3`, `-x`, `#1`,
 * `<x, y> = 0`, `|a+b|`.
 * @param   {Parser } p
 * @param   {string } char    - The next character, '\n' at the end of the line
 * @param   {boolean} display - Display maths
 * @param   {boolean} lists   - A list item's line opens a block
 * @returns {number } 1 the line opens a block, 0 it cannot, -1 not known yet */
function line_opens(p, char, display, lists) {
    const line  = p.eq_line
    const first = line[0]
    p.eq_line = ""
    switch (first) {
    case undefined:
        if ('>' === char || '|' === char && !display) return 1
        if ("#-*_".includes(char) ||
            lists   && ('+' === char || is_digit(char.charCodeAt(0))) ||
            display && "`~<".includes(char)
        ) break
        return 0
    /* # Heading */
    case '#':
        if (' ' === char || display && '\n' === char) return 1
        if ('#' === char && line.length < 6) break
        return 0
    /* - item, + item, * item, or a rule: --- * * * ___ */
    case '-': case '*': case '_': case '+':
        if (' ' === char && 1 === line.length && '_' !== first && lists) return 1
        if ('+' === first) return 0
        if (' ' === char || '\t' === char || first === char && line.length >= 3) {
            p.eq_line = line
            return -1
        }
        if (first === char) break
        return '\n' === char && line.length >= 3 ? 1 : 0
    /* ``` or ~~~ */
    case '`': case '~':
        if (first !== char) return 0
        if (2 === line.length) return 1
        break
    /* </x <!-- <? or a block tag: <div> <p class="x"> — not <x, y> */
    case '<': {
        if (1 === line.length && ('/' === char || '!' === char || '?' === char)) return 1
        const name = line.slice(1).toLowerCase()
        if (HTML_BLOCK_TAGS.includes(name) &&
            (' ' === char || '\t' === char || '>' === char || '/' === char || '\n' === char)
        ) return 1
        const next = name + char.toLowerCase()
        if (HTML_BLOCK_TAGS.some(tag => tag.startsWith(next))) break
        return 0
    }
    /* 1. item, and 1) item for display maths (smd itself opens no list on 1) */
    default: {
        const last = line[line.length-1]
        if ('.' === last || ')' === last) return ' ' === char ? 1 : 0
        if ('.' === char || ')' === char && display || is_digit(char.charCodeAt(0)) && line.length < 9) break
        return 0
    }
    }
    p.eq_line = line + char
    return -1
}

/**
 * In a quote, a `>` starting a display formula's line is the quote's, as on a paragraph's
 * line, not a block: `> $$\n> x\n> $$` is one formula. It moves `p.blockquote_idx` on.
 * @param   {Parser } p
 * @param   {string } char
 * @returns {boolean} the `>` was the quote's */
function eq_quote(p, char) {
    if ('>' !== char || "" !== p.eq_line) return false
    const idx = idx_of_token(p, BLOCKQUOTE, p.blockquote_idx+1)
    if (-1 === idx) return false
    p.blockquote_idx = idx
    return true
}

/**
 * @param   {Parser} p
 * @param   {number} token
 * @param   {number} start_idx
 * @returns {number} */
function idx_of_token(p, token, start_idx) {
    while (start_idx <= p.len) {
        if (p.tokens[start_idx] === token) {
            return start_idx
        }
        start_idx += 1
    }
    return -1
}

/**
 * End tokens until the parser has the given length.
 * @param   {Parser} p
 * @param   {number} len
 * @returns {void  } */
function end_tokens_to_len(p, len) {

    // TODO: specific token state should be reset only when the token ends
    p.fence_start = 0

    while (p.len > len) {
        end_token(p)
    }
}

/**
 * @param   {Parser} p
 * @param   {number} indent
 * @returns {number} */
function end_tokens_to_indent(p, indent) {

    let idx = 0
    for (let i = 0; i <= p.len; i += 1) {
        indent -= p.spaces[i]
        if (indent < 0) {
            break   
        }
        switch (p.tokens[i]) {
        case CODE_BLOCK:
        case CODE_FENCE:
        case BLOCKQUOTE:
        case LIST_ITEM:
            idx = i
            break
        }
    }

    while (p.len > idx) {end_token(p)}
    
    return indent
}

/**
 * @param   {Parser } p
 * @param   {Token  } list_token
 * @returns {boolean} added a new list */
function continue_or_add_list(p, list_token) {
    /* will create a new list inside the last item
       if the amount of spaces is greater than the last one (with prefix)
       1. foo
          - bar      <- new nested ul
             - baz   <- new nested ul
          12. qux    <- cannot be nested in "baz" or "bar",
                        so it's a new list in "foo"
    */
    let list_idx = -1
    let item_idx = -1

    for (let i = p.blockquote_idx+1; i <= p.len; i += 1) {
        if (p.tokens[i] === LIST_ITEM) {
            if (p.indent_len < p.spaces[i]) {
                item_idx = -1
                break
            }
            item_idx = i
        } else if (p.tokens[i] === list_token) {
            list_idx = i
        }
    }

    if (item_idx === -1) {
        if (list_idx === -1) {
            end_tokens_to_len(p, p.blockquote_idx)
            add_token(p, list_token)
            return true
        }
        end_tokens_to_len(p, list_idx)
        return false
    }
    end_tokens_to_len(p, item_idx)
    add_token(p, list_token)
    return true
}

/**
 * | a | b — a table row without its closing pipe ends with its line, as in GFM: its cell, and
 * anything still open in it, end there, and the next line is the table's again.
 * @param   {Parser } p
 * @returns {boolean} a row was ended */
function table_row_end(p) {
    const row = idx_of_token(p, TABLE_ROW, 1)
    if (-1 === row) return false
    add_text(p)
    end_tokens_to_len(p, row - 1)
    p.table_state = Math.min(p.table_state + 1, 2)
    p.blockquote_idx = 0
    return true
}

/**
 * Create a new list
 * or continue the last one
 * @param   {Parser } p
 * @param   {number } prefix_length
 * @returns {void   } */
function add_list_item(p, prefix_length) {
    add_token(p, LIST_ITEM)
    p.spaces[p.len] = p.indent_len + prefix_length
    clear_root_pending(p)
    p.token = MAYBE_TASK
}

/**
 * @param   {Parser} p
 * @returns {void  } */
function clear_root_pending(p) {
    p.indent = ""
    p.indent_len = 0
    p.pending = ""
}

/**
 * @param   {number} charcode
 * @returns {boolean} */
function is_digit(charcode) {
    switch (charcode) {
    case 48: case 49: case 50: case 51: case 52:
    case 53: case 54: case 55: case 56: case 57:
        return true
    default:
        return false
    }
}

/**
 * @param   {number} charcode
 * @returns {boolean} */
function is_alnum(charcode) {
    return is_digit(charcode)                 || // 0-9
           (charcode >= 65 && charcode <= 90) || // A-Z
           (charcode >= 97 && charcode <= 122)   // a-z
}

/**
 * Parse and render another chunk of markdown.
 * @param   {Parser} p
 * @param   {string} chunk
 * @returns {void  } */
export function parser_write(p, chunk) {
    for (const char of chunk) {

        /*
         Handle newlines
        */
        if (p.token === NEWLINE) {
            switch (char) {
            case ' ':
                p.indent_len += 1
                continue
            case '\t':
                p.indent_len += 4
                continue
            }
            
            let indent = end_tokens_to_indent(p, p.indent_len)
            
            p.indent_len = 0
            p.token = p.tokens[p.len]

            if (indent > 0) {
                parser_write(p, " ".repeat(indent))
            }
        }

        const pending_with_char = p.pending + char

        /*
        Token specific checks
        */
        switch (p.token) {
        case LINE_BREAK:
        case DOCUMENT:
        case BLOCKQUOTE:
        case LIST_ORDERED:
        case LIST_UNORDERED:
            console.assert(p.text.length === 0, "Root should not have any text")

            /* A rule's line is held in pending until its end: reading pending[0] there would
               flatten that growing string on every character, quadratic over the line */
            switch (p.hr_chars > 0 ? p.hr_char : p.pending[0]) {
            case undefined:
                p.pending = char
                continue
            case ' ':
                console.assert(p.pending.length === 1)
                p.pending = char
                p.indent += ' '
                p.indent_len += 1
                continue
            case '\t':
                console.assert(p.pending.length === 1)
                p.pending = char
                p.indent += '\t'
                p.indent_len += 4
                continue
            case '\n':
                console.assert(p.pending.length === 1)
                /*
                 Lists can have an empty line in between items:
                 1. foo
                 <empty>
                 2. bar
                */
                if (p.tokens[p.len] === LIST_ITEM && p.token === LINE_BREAK) {
                    end_token(p)
                    clear_root_pending(p)
                    p.pending = char
                    continue
                }
                /*
                 Exit out of tokens
                 And ignore newlines in root
                */
                end_tokens_to_len(p, p.blockquote_idx)
                clear_root_pending(p)
                p.blockquote_idx = 0
                p.fence_start = 0
                p.pending = char
                continue
            /* Heading */
            case '#':
                switch (char) {
                case '#':
                    if (p.pending.length < 6) {
                        p.pending = pending_with_char
                        continue
                    }
                    break // fail
                case ' ':
                    end_tokens_to_indent(p, p.indent_len)
                    add_token(p, heading_from_level(p.pending.length))
                    clear_root_pending(p)
                    continue
                }
                break // fail
            /* Blockquote */
            case '>': {
                const next_blockquote_idx = idx_of_token(p, BLOCKQUOTE, p.blockquote_idx+1)

                /*
                Only when there is no blockquote to the right of blockquote_idx
                a new blockquote can be created
                */
                if (next_blockquote_idx === -1) {
                    end_tokens_to_indent(p, p.indent_len)
                    p.blockquote_idx += 1
                    p.fence_start = 0
                    add_token(p, BLOCKQUOTE)
                } else {
                    p.blockquote_idx = next_blockquote_idx
                }

                clear_root_pending(p)
                p.pending = char
                continue
            }
            /* Horizontal Rule
               "-- - --- - --"
            */
            case '-':
            case '*':
            case '_':
                if (p.hr_chars === 0) {
                    console.assert(p.pending.length === 1, "Pending should be one character")
                    p.hr_chars = 1
                    p.hr_char = p.pending
                }

                if (p.hr_chars > 0) {
                    switch (char) {
                    case p.hr_char:
                        p.hr_chars += 1
                        p.pending = pending_with_char
                        continue
                    case ' ':
                        p.pending = pending_with_char
                        continue
                    case '\n':
                        if (p.hr_chars < 3) break
                        end_tokens_to_indent(p, p.indent_len)
                        p.renderer.add_token(p.renderer.data, RULE)
                        p.renderer.end_token(p.renderer.data)
                        clear_root_pending(p)
                        p.hr_chars = 0
                        continue
                    }

                    p.hr_chars = 0
                }

                /* Unordered list
                /  * foo
                /  * *bar*
                /  * **baz**
                /*/
                if ('_' !== p.pending[0] &&
                    ' ' === p.pending[1]
                ) {
                    continue_or_add_list(p, LIST_UNORDERED)
                    add_list_item(p, 2)
                    parser_write(p, pending_with_char.slice(2))
                    continue
                }

                break // fail
            /* Code Fence */
            case '`':
                /*  ``?
                      ^
                */
                if (p.pending.length < 3) {
                    if ('`' === char) {
                        p.pending = pending_with_char
                        p.fence_start = pending_with_char.length
                        continue
                    }
                    p.fence_start = 0
                    break // fail
                }

                switch (char) {
                case '`':
                    /*  ````?
                           ^
                    */
                    if (p.pending.length === p.fence_start) {
                        p.pending = pending_with_char
                        p.fence_start = pending_with_char.length
                    }
                    /*  ```code`
                               ^
                    */
                    else {
                        add_token(p, PARAGRAPH)
                        clear_root_pending(p)
                        p.fence_start = 0
                        parser_write(p, pending_with_char)
                    }
                    continue
                case '\n': {
                    /*  ```lang\n
                                ^
                    */
                    end_tokens_to_indent(p, p.indent_len)
        
                    add_token(p, CODE_FENCE)
                    if (p.pending.length > p.fence_start) {
                        p.renderer.set_attr(p.renderer.data, LANG, p.pending.slice(p.fence_start))
                    }
                    clear_root_pending(p)
                    p.token = NEWLINE
                    continue
                }
                default:
                    /*  ```lang\n
                            ^
                    */
                    p.pending = pending_with_char
                    continue
                }
            /*
            List Unordered for '+'
            The other list types are handled with HORIZONTAL_RULE
            */
            case '+':
                if (' ' !== char) break // fail

                continue_or_add_list(p, LIST_UNORDERED)
                add_list_item(p, 2)
                continue
            /* List Ordered */
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
                /*
                12. foo
                   ^
                */
                if ('.' === p.pending[p.pending.length-1]) {
                    if (' ' !== char) break // fail

                    if (continue_or_add_list(p, LIST_ORDERED) && p.pending !== "1.") {
                        p.renderer.set_attr(p.renderer.data, START, p.pending.slice(0, -1))
                    }
                    add_list_item(p, p.pending.length+1)
                    continue
                } else {
                    const char_code = char.charCodeAt(0)
                    if (46 === char_code || // '.'
                        is_digit(char_code) // 0-9
                    ) {
                        p.pending = pending_with_char
                        continue
                    }
                }
                break // fail
            /* Table */
            case '|':
                end_tokens_to_indent(p, p.indent_len)

                add_token(p, TABLE)
                add_token(p, TABLE_ROW)

                p.pending = ""
                parser_write(p, char)

                continue
            }

            let to_write = pending_with_char

            /* Add a line break and continue in previous token */
            if (p.token === LINE_BREAK) {
                p.token = p.tokens[p.len]
                p.renderer.add_token(p.renderer.data, LINE_BREAK)
                p.renderer.end_token(p.renderer.data)
                /* x$\nhttp:// — a line break ends the $ before it (no autolink right after
                   a $), not the word: snake\n_case_name is text, as in 0.3.0 */
                if ('$' === p.last_char) p.last_char = ""
            }
            /* Code Block */
            else if (p.indent_len >= 4) {
                /*
                Case where there are additional spaces
                after the indent that makes the code block
                _________________________
                       code
                ^^^^----indent
                    ^^^-part of code
                _________________________
                 \t   code
                ^^-----indent
                   ^^^-part of code
                */
                let code_start = 0
                for (; code_start < 4; code_start += 1) {
                    if (p.indent[code_start] === '\t') {
                        code_start = code_start+1
                        break
                    }
                }
                to_write = p.indent.slice(code_start) + pending_with_char
                add_token(p, CODE_BLOCK)
            }
            /* Paragraph */
            else {
                add_token(p, PARAGRAPH)
            }

            clear_root_pending(p)
            parser_write(p, to_write)
            continue
        case TABLE:
            /* > | b | — in a quote, the line's > is the quote's, as on a paragraph's line */
            if ('>' === char && /^ *$/.test(p.pending)) {
                const quote = idx_of_token(p, BLOCKQUOTE, p.blockquote_idx+1)
                if (-1 !== quote) {
                    p.blockquote_idx = quote
                    continue
                }
            }
            if (p.table_state === 1) {
                switch (char) {
                case '-':
                case ' ':
                case '|':
                case ':':
                    p.pending = pending_with_char
                    continue
                /* |---|---| is the delimiter row; a blank line ends the table (below) */
                case '\n':
                    p.table_state = 2
                    if (/^ *$/.test(p.pending)) {
                        p.pending = char
                    } else {
                        p.pending = ""
                        p.blockquote_idx = 0
                    }
                    continue
                default: {
                    /* | b | — no delimiter row: a row of the table all the same (the table
                       is already written). Any other line ends the table and is read again. */
                    const line = p.pending + char
                    p.pending = ""
                    if ('|' === line.trimStart()[0]) {
                        p.table_state = 2
                    } else {
                        end_token(p)
                        p.table_state = 0
                    }
                    parser_write(p, line)
                    continue
                }
                }
            } else {
                /*
                - item
                  | a | b |
                ^^ a row's indentation, inside a list item: not text
                */
                if (' ' === char && /^ *$/.test(p.pending)) {
                    p.pending = pending_with_char
                    continue
                }
                if ('|' === char && /^ +$/.test(p.pending)) {
                    p.pending = char
                    continue
                }
                /* a whitespace-only line is a blank line: it ends the table (below) */
                if ('\n' === char && /^ +$/.test(p.pending)) {
                    p.pending = char
                    continue
                }
                /* x — a line that does not start with | ends the table, and is read again */
                if ('|' !== char && '\n' !== char && /^ *$/.test(p.pending)) {
                    const line = p.pending + char
                    p.pending = ""
                    end_token(p)
                    p.table_state = 0
                    parser_write(p, line)
                    continue
                }
                switch (p.pending) {
                case "|":
                    add_token(p, TABLE_ROW)
                    p.pending = ""
                    parser_write(p, char)
                    continue
                case "\n": {
                    end_token(p)
                    /* a blank line also ends a quote whose > it did not have */
                    const quote = idx_of_token(p, BLOCKQUOTE, p.blockquote_idx+1)
                    if (-1 !== quote) end_tokens_to_len(p, quote - 1)
                    p.pending = ""
                    p.table_state = 0
                    p.blockquote_idx = 0
                    parser_write(p, char)
                    continue
                }
                }
            }
            break
        case TABLE_ROW:
            switch (p.pending) {
            case "":
                break
            case "|":
                add_token(p, TABLE_CELL)
                end_token(p)
                p.pending = ""
                parser_write(p, char)
                continue
            case "\n":
                end_token(p)
                p.table_state = Math.min(p.table_state+1, 2)
                p.pending = ""
                p.blockquote_idx = 0
                parser_write(p, char)
                continue
            default:
                add_token(p, TABLE_CELL)
                parser_write(p, char)
                continue
            }
            break
        case TABLE_CELL:
            if (p.pending === "|") {
                add_text(p)
                end_token(p)
                p.pending = ""
                parser_write(p, char)
                continue
            }
            break
        case CODE_BLOCK:
            switch (pending_with_char) {
            case "\n    ":
            case "\n   \t":
            case "\n  \t":
            case "\n \t":
            case "\n\t":
                p.text += "\n"
                p.pending = ""
                continue
            case "\n":
            case "\n ":
            case "\n  ":
            case "\n   ":
                p.pending = pending_with_char
                continue
            default:
                if (p.pending.length !== 0) {
                    add_text(p)
                    end_token(p)
                    p.pending = char
                } else {
                    p.text += char
                }
                continue
            }
        case CODE_FENCE:
            switch (char) {
            case '`':
                /*  ```\n<code>\n``??
                |                 ^
                */
                p.pending = pending_with_char
                continue
            case '\n':
                /*  ```\n<code>\n```\n
                |                    ^
                */
                // Only a line-start fence can close the block. Before the
                // first content character, fence_end is still zero.
                if ((p.pending[0] === '\n' || p.fence_end === 0) &&
                    pending_with_char.length === p.fence_start + p.fence_end + 1
                ) {
                    add_text(p)
                    end_token(p)
                    p.pending = ""
                    p.fence_start = 0
                    p.fence_end = 0
                    p.token = NEWLINE
                    continue
                }
                p.token = NEWLINE
                break
            case ' ':
                /*  ```\n<code>\n ??
                |                ^  (space after newline is allowed)
                */
                if (p.pending[0] === '\n') {
                    p.pending = pending_with_char
                    p.fence_end += 1
                    continue
                }
                break
            }
            // any other char
            p.text   += p.pending
            p.pending = char
            p.fence_end = 1
            continue
        case CODE_INLINE:
            switch (char) {
            case '`':
                if (pending_with_char.length ===
                    p.fence_start + Number(p.pending[0] === ' ') // 0 or 1 for space
                ) {
                    add_text(p)
                    end_token(p)
                    p.pending = ""
                    p.fence_start = 0
                } else {
                    p.pending = pending_with_char
                }
                continue
            case '\n':
                p.text += p.pending
                p.pending = ""
                if (table_row_end(p)) continue
                p.token = LINE_BREAK
                p.blockquote_idx = 0
                add_text(p)
                continue
            /* Trim space before ` */
            case ' ':
                p.text += p.pending
                p.pending = char
                continue
            default:
                p.text += pending_with_char
                p.pending = ""
                continue
            }
        /* Checkboxes */
        case MAYBE_TASK:
            switch (p.pending.length) {
            case 0:
                if ('[' !== char) break // fail
                p.pending = pending_with_char
                continue
            case 1:
                if (' ' !== char && 'x' !== char) break // fail
                p.pending = pending_with_char
                continue
            case 2:
                if (']' !== char) break // fail
                p.pending = pending_with_char
                continue
            case 3:
                if (' ' !== char) break // fail
                p.renderer.add_token(p.renderer.data, CHECKBOX)
                if ('x' === p.pending[1]) {
                    p.renderer.set_attr(p.renderer.data, CHECKED, "")
                }
                p.renderer.end_token(p.renderer.data)
                p.pending = " "
                continue
            }

            p.token = p.tokens[p.len]
            p.pending = ""
            parser_write(p, pending_with_char)
            continue
        case STRONG_AST:
        case STRONG_UND: {
            /** @type {string} */ let symbol = '*'
            /** @type {Token } */ let italic = ITALIC_AST
            if (p.token === STRONG_UND) {
                symbol = '_'
                italic = ITALIC_UND
            }

            if (symbol === p.pending) {
                add_text(p)
                /* **Bold**
                          ^
                */
                if (symbol === char) {
                    end_token(p)
                    p.pending = ""
                    continue
                }
                /* **Bold*Bold->Em*
                          ^
                */
                add_token(p, italic)
                p.pending = char
                continue
            }

            break
        }
        case ITALIC_AST:
        case ITALIC_UND: {
            /** @type {string} */ let symbol = '*'
            /** @type {Token } */ let strong = STRONG_AST
            if (p.token === ITALIC_UND) {
                symbol = '_'
                strong = STRONG_UND
            }

            switch (p.pending) {
            case symbol:
                if (symbol === char) {
                    /* Decide between ***bold>em**em* and **bold*bold>em***
                                                 ^                       ^
                       With the help of the next character
                    */
                    if (p.tokens[p.len-1] === strong) {
                        p.pending = pending_with_char
                    }
                    /* *em**bold
                           ^
                    */
                    else {
                        add_text(p)
                        add_token(p, strong)
                        p.pending = ""
                    }
                }
                /* *em*foo
                       ^
                */
                else {
                    add_text(p)
                    end_token(p)
                    p.pending = char
                }
                continue
            case symbol+symbol:
                const italic = p.token
                add_text(p)
                end_token(p)
                end_token(p)
                /* ***bold>em**em* or **bold*bold>em***
                               ^                      ^
                */
                if (symbol !== char) {
                    add_token(p, italic)
                    p.pending = char
                } else {
                    p.pending = ""
                }
                continue
            }
            break
        }
        case STRIKE:
            if ("~~" === pending_with_char) {
                add_text(p)
                end_token(p)
                p.pending = ""
                continue
            }
            break
        case MAYBE_EQ_BLOCK: {
            /*
             \[?  or  $$?
               ^        ^
            */
            if (2 === p.pending.length) {
                /* \[ or $$ ends its line: held until the next line says (below) */
                if (char === '\n' && idx_of_token(p, TABLE_CELL, 1) === -1) {
                    p.pending = pending_with_char
                    p.eq_line = ""
                    p.blockquote_idx = 0
                }
                /* $$x$$ or \[x\] on one line, or inside a paragraph
                     ^       ^
                */
                else if (char !== '\n' && p.eq_rerun < 2) {
                    eq_hold(p, p.pending)
                    parser_write(p, char)
                }
                /* | a $$ — a table row ends with its line: there, it is text.
                   And text given back twice holds no such formula (see eq_flush) */
                else {
                    p.token = p.tokens[p.len]
                    p.text += '\\' === p.pending[0] ? '[' : p.pending
                    p.pending = ""
                    parser_write(p, char)
                }
                continue
            }
            /*
             $$\n  x
                   ^ the block is added at the first character of TeX on the next line.
             A whitespace-only line, the end, or a line that opens a block comes first:
             the opener was text, and what follows is Markdown.
            */
            if ("" === p.eq_line && (' ' === char || '\t' === char) || eq_quote(p, char)) {
                p.pending = pending_with_char
                continue
            }
            const opens = "" === p.eq_line && '\n' === char ? 1 : line_opens(p, char, true, false)
            if (-1 === opens) {
                p.pending = pending_with_char
                continue
            }
            const open  = p.pending.slice(0, 2)
            const after = p.pending.slice(2) + char
            p.pending = ""
            if (1 === opens) {
                p.token = p.tokens[p.len]
                p.text += '\\' === open[0] ? '[' : open
                parser_write(p, after)
            } else {
                add_text(p)
                add_token(p, EQUATION_BLOCK)
                p.eq_open  = open
                p.eq_blank = true
                p.blockquote_idx = 0 // the line is read again
                parser_write(p, after.slice(1))
            }
            continue
        }
        case EQUATION_BLOCK:
            /* \] or $$: either closes it */
            if ("\\]" === pending_with_char || "$$" === pending_with_char) {
                eq_block_end(p, false)
                p.pending = ""
                continue
            }
            /* > x — in a quote, its own marker (see eq_quote) */
            if (p.eq_blank && eq_quote(p, char)) continue
            /* A line that opens a block — a heading, a fence, a quote, HTML, a rule — ends it,
               and what follows is Markdown again. A list item's line is TeX: the opener ended
               its line. The line is held until it is known (see line_opens). */
            if (p.eq_line !== "" || p.eq_blank && ' ' !== char && '\t' !== char && '\n' !== char) {
                /* the newline and indentation before it are the formula's */
                if ("" === p.eq_line) {
                    p.text += p.pending
                    p.pending = ""
                }
                const opens = line_opens(p, char, true, false)
                if (-1 === opens) {
                    p.pending += char
                    continue
                }
                const line = p.pending + char
                p.pending = ""
                if (1 === opens) {
                    eq_block_end(p, true)
                    p.token = LINE_BREAK // the quote's markers on the line are read already
                    parser_write(p, line)
                } else {
                    /* TeX: written on as usual */
                    p.eq_blank = false
                    p.text += line.slice(0, -1)
                    parser_write(p, char)
                }
                continue
            }
            /* A whitespace-only line ends it, as a blank line ends display maths in Pandoc:
               what follows is Markdown again */
            if ('\n' === char) {
                if (p.eq_blank) {
                    p.text += p.pending
                    eq_block_end(p, true)
                    p.pending = char
                    p.token = LINE_BREAK // the quote's markers on the line are read already
                    continue
                }
                p.eq_blank = true
                p.blockquote_idx = 0
            } else if (' ' !== char && '\t' !== char) {
                p.eq_blank = false
            }
            break
        case MAYBE_EQ: {
            /*
             $x$  \(x\)  $$x$$  \[x\]
             held back, nothing written, until the closer is confirmed
            */
            const open    = p.eq_open
            const display = "$$" === open || "\\[" === open
            if ('\\' === p.pending) {
                p.pending = ""
                /* \(x\)  \[x\]
                      ^      ^
                */
                if (')' === char && "\\(" === open ||
                    ']' === char && "\\[" === open
                ) {
                    eq_commit(p)
                    continue
                }
                /* \$ \\ \, — an escaped pair is TeX, never a closer */
                eq_add(p, '\\')
                if ('\n' !== char) {
                    eq_add(p, char)
                    continue
                }
            }
            else if ('$' === p.pending) {
                p.pending = ""
                /* $$x$$
                       ^
                */
                if ("$$" === open) {
                    if ('$' === char) {
                        eq_commit(p)
                        continue
                    }
                    eq_add(p, '$')
                }
                /* $x$?
                     ^ a closer followed by a digit is not one ($x$5): the formula was text
                */
                else {
                    if (is_digit(char.charCodeAt(0))) {
                        p.pending = '$'
                        eq_flush(p)
                    } else {
                        eq_commit(p)
                    }
                    parser_write(p, char)
                    continue
                }
            }
            if (/* No formula is that long: past it, what is held is text */
                p.eq_text.length >= (display ? EQ_DISPLAY_MAX : EQ_INLINE_MAX) ||
                /* A line that opens a block ends the paragraph, and the formula was text.
                   Read from its first character until it is known: $x =\n2y$ is maths,
                   $a\n- b$ is not. A list item stops display maths only when the opener had
                   text after it: Since $$a = b\n- one */
                (p.eq_line !== "" || p.eq_blank && ' ' !== char && '\t' !== char && '\n' !== char) &&
                1 === line_opens(p, char, display, !display || 1 === p.eq_head)
            ) {
                eq_flush(p)
                parser_write(p, char)
                continue
            }
            switch (char) {
            case '\\':
                p.pending = char
                continue
            case '$':
                if ("$$" === open) {
                    p.pending = char
                    continue
                }
                /* $\text{in $x$ units}$ — a $ inside braces is TeX
                               ^
                */
                if ("$" !== open || p.eq_depth > 0) break
                /* $x $ — a closer must follow a non-space: the formula was text
                     ^
                */
                if (p.eq_space) {
                    eq_flush(p)
                    parser_write(p, char)
                } else {
                    p.pending = char
                }
                continue
            /* $5 for `a$b` — code binds tighter than a formula not yet confirmed */
            case '`':
                eq_flush(p)
                parser_write(p, char)
                continue
            /* | $5 | (y$) | — a cell ends at its pipe, and a formula left open in it was text */
            case '|':
                if (idx_of_token(p, TABLE_CELL, 1) === -1) break
                eq_flush(p)
                parser_write(p, char)
                continue
            /* A blank line ends a paragraph, and the line ends a list item, a table row,
               a heading or a quote: a formula left open was text. Only a paragraph's
               formula goes on to the next line. */
            case '\n':
                if (!p.eq_blank && PARAGRAPH === p.tokens[1]) break
                eq_flush(p)
                parser_write(p, char)
                continue
            /* braces, not escaped (\{ is added with its backslash above): never below 0 */
            case '{':
                p.eq_depth += 1
                break
            case '}':
                if (p.eq_depth > 0) p.eq_depth -= 1
                break
            }
            eq_add(p, char)
            continue
        }
        /* Raw URLs */
        case MAYBE_URL:
            if ("http://"  === pending_with_char ||
                "https://" === pending_with_char
            ) {
                add_text(p)
                add_token(p, RAW_URL)
                p.pending = pending_with_char
                p.text    = pending_with_char
            }
            else
            if ("http:/" [p.pending.length] === char ||
                "https:/"[p.pending.length] === char
            ) {
                p.pending = pending_with_char
            }
            else {
                p.token = p.tokens[p.len]
                parser_write(p, char)
            }
            continue
        case LINK:
        case IMAGE:
            if ("]" === p.pending && p.link_depth > 0) {
                /*
                [a [b] c](url)
                     ^ closes a bracket the text opened: text, not the end of the text
                */
                p.link_depth -= 1
                break
            }
            if ("]" === p.pending) {
                /*
                [Link](url)
                     ^
                */
                add_text(p)
                if ('(' === char) {
                    p.pending = pending_with_char
                } else {
                    end_token(p)
                    p.pending = char
                }
                continue
            }
            if (']' === p.pending[0] &&
                '(' === p.pending[1]
            ) {
                /*
                [Link](url)
                          ^
                */
                if (')' === char) {
                    const type = p.token === LINK ? HREF : SRC
                    const url = p.pending.slice(2)
                    p.renderer.set_attr(p.renderer.data, type, url)
                    end_token(p)
                    p.pending = ""
                } else {
                    p.pending += char
                }
                continue
            }
            break
        case RAW_URL:
            /* http://example.com?
                                 ^
            */
            if (' ' === char ||
                '\n'=== char ||
                '\\'=== char
            ) {
                p.renderer.set_attr(p.renderer.data, HREF, p.pending)
                add_text(p)
                end_token(p)
                p.pending = char
            } else {
                p.text   += char
                p.pending = pending_with_char
            }
            continue
        case MAYBE_BR:
            if (pending_with_char.startsWith("<br")) {
                if (/* "<br" */
                    pending_with_char.length === 3 ||
                    /* "<br " */
                    char === ' ' ||
                    /* "<br/" | "<br /" */
                    char === '/' && (pending_with_char.length === 4 ||
                                     p.pending[p.pending.length-1] === ' ')
                ) {
                    p.pending = pending_with_char
                    continue
                }

                /* "<br>" | "<br/>" */
                if (char === '>') {
                    add_text(p)
                    p.token = p.tokens[p.len]
                    p.renderer.add_token(p.renderer.data, LINE_BREAK)
                    p.renderer.end_token(p.renderer.data)
                    if ('$' === p.last_char) p.last_char = "" // as after a newline
                    p.pending = ""
                    continue
                }
            }
            // Fail
            p.token = p.tokens[p.len]
            p.text += '<'
            p.pending = p.pending.slice(1)
            parser_write(p, char)
            continue
        }

        /*
        Common checks
        */
        switch (p.pending[0]) {
        /* Escape character */
        case '\\':
            if (p.token === IMAGE ||
                p.token === EQUATION_BLOCK ||
                p.token === EQUATION_INLINE)
                break

            /* Without maths, \( and \[ are escapes like any other */
            if (p.math) {
                /* \(EQUATION_INLINE\)
                    ^ held back until \) (not in text given back twice, see eq_flush)
                */
                if ('(' === char && p.eq_rerun < 2) {
                    eq_hold(p, "\\(")
                    continue
                }
                if ('[' === char) {
                    p.token = MAYBE_EQ_BLOCK
                    p.pending = pending_with_char
                    continue
                }
            }

            switch (char) {
            case '\n':
                // Escaped newline has the same affect as unescaped one
                p.pending = char
                continue
            default:
                let charcode = char.charCodeAt(0)
                p.pending = ""
                p.text += is_digit(charcode)                 || // 0-9
                          (charcode >= 65 && charcode <= 90) || // A-Z
                          (charcode >= 97 && charcode <= 122)   // a-z
                            ? pending_with_char
                            : char
                continue
            }
        /* Newline */
        case '\n':
            if (table_row_end(p)) {
                p.pending = ""
                parser_write(p, char)
                continue
            }
            switch (p.token) {
            case IMAGE:
            case EQUATION_BLOCK:
            case EQUATION_INLINE:
                break
            case HEADING_1:
            case HEADING_2:
            case HEADING_3:
            case HEADING_4:
            case HEADING_5:
            case HEADING_6:
                add_text(p)
                end_tokens_to_len(p, p.blockquote_idx)
                p.blockquote_idx = 0
                p.pending = char
                continue
            default:
                add_text(p)
                p.pending = char
                p.token = LINE_BREAK
                p.blockquote_idx = 0
                continue
            }
            break
        /* <br> */
        case '<':
            if (p.token !== IMAGE &&
                p.token !== EQUATION_BLOCK &&
                p.token !== EQUATION_INLINE
            ) {
                add_text(p)
                p.pending = pending_with_char
                p.token = MAYBE_BR
                continue
            }
            break
        /* `Code Inline` */
        case '`':
            if (p.token === IMAGE) break

            if ('`' === char) {
                p.fence_start += 1
                p.pending = pending_with_char
            } else {
                p.fence_start += 1 // started at 0, and first wasn't counted
                add_text(p)
                add_token(p, CODE_INLINE)
                p.text = ' ' === char || '\n' === char ? "" : char // trim leading space
                p.pending = ""
            }
            continue
        case '_':
        case '*': {
            if (p.token === IMAGE ||
                p.token === EQUATION_BLOCK ||
                p.token === EQUATION_INLINE ||
                p.token === STRONG_AST)
             break

            /* snake_case_name
                    ^ an underscore inside a word is not emphasis (CommonMark: `_` does not
                      open intraword), in a link's text as anywhere: [read_me.md](url)
            */
            if ('_' === p.pending[0] && /[\p{L}\p{N}]/u.test(text_end(p))) break

            /** @type {Token} */ let italic = ITALIC_AST
            /** @type {Token} */ let strong = STRONG_AST
            const symbol = p.pending[0]
            if ('_' === symbol) {
                italic = ITALIC_UND
                strong = STRONG_UND
            }

            if (p.pending.length === 1) {
                /* **Strong**
                    ^
                */
                if (symbol === char) {
                    p.pending = pending_with_char
                    continue
                }
                /* *Em*
                    ^
                */
                if (' ' !== char && '\n' !== char) {
                    add_text(p)
                    add_token(p, italic)
                    p.pending = char
                    continue
                }
            } else {
                /* ***Strong->Em***
                     ^
                */
                if (symbol === char) {
                    add_text(p)
                    add_token(p, strong)
                    add_token(p, italic)
                    p.pending = ""
                    continue
                }
                /* **Strong**
                     ^
                */
                if (' ' !== char && '\n' !== char) {
                    add_text(p)
                    add_token(p, strong)
                    p.pending = char
                    continue
                }
            }

            break
        }
        case '~':
            if (p.token !== IMAGE &&
                p.token !== STRIKE
            ) {
                if ("~" === p.pending) {
                    /* ~~Strike~~
                        ^
                    */
                    if ('~' === char) {
                        p.pending = pending_with_char
                        continue
                    }
                } else {
                    /* ~~Strike~~
                    |    ^
                    */
                    if (' ' !== char && '\n' !== char) {
                        add_text(p)
                        add_token(p, STRIKE)
                        p.pending = char
                        continue
                    }
                }
            }
            break
        /* $eq$ | $$eq$$ — without maths, $ is text */
        case '$':
            if (p.math &&
                p.token !== IMAGE &&
                p.token !== STRIKE &&
                p.token !== EQUATION_BLOCK &&
                "$" === p.pending
            ) {
                /* $$EQUATION_BLOCK$$
                    ^
                */
                if ('$' === char) {
                    p.token = MAYBE_EQ_BLOCK
                    p.pending = pending_with_char
                    continue
                }
                /* $ x — the opener must be followed by a non-space
                    ^
                */
                else if (' ' === char || '\t' === char || '\n' === char) {
                    break
                }
                /* $EQUATION_INLINE$
                    ^ held back until the closer is confirmed: $5 and $10 is text
                */
                else {
                    eq_hold(p, "$")
                    parser_write(p, char)
                    continue
                }
            }
            break
        /* [Image](url) */
        case '[':
            if (p.token !== IMAGE &&
                p.token !== LINK &&
                p.token !== EQUATION_BLOCK &&
                p.token !== EQUATION_INLINE &&
                ']' !== char
            ) {
                add_text(p)
                add_token(p, LINK)
                p.link_depth = 0
                p.pending = char
                continue
            }
            /* [a [b] c](url)
                  ^ a bracket inside the text: counted, so its `]` does not end the text
            */
            if (p.token === LINK || p.token === IMAGE) {
                p.link_depth += 1
            }
            break
        /* ![Image](url) */
        case '!':
            if (!(p.token === IMAGE) &&
                '[' === char
            ) {
                add_text(p)
                add_token(p, IMAGE)
                p.link_depth = 0
                p.pending = ""
                continue
            }
            break
        /* Trim spaces */
        case ' ':
            if (p.pending.length === 1 && ' ' === char) {
                continue
            }
            break
        }

        /* foo http://...
        |      ^  not right after a $ (GFM: US$http://, $$http://), maths or not
        */
        if (p.token !== IMAGE &&
            p.token !== LINK &&
            p.token !== EQUATION_BLOCK &&
            p.token !== EQUATION_INLINE &&
            'h' === char &&
           (" " === p.pending ||
            ""  === p.pending && '$' !== text_end(p))
        ) {
            p.text   += p.pending
            p.pending = char

            p.token = MAYBE_URL
            continue
        }

        /*
        No check hit
        */
        p.text += p.pending
        p.pending = char
    }

    add_text(p)
}


/**
 * @template T
 * @callback Renderer_Add_Token
 * @param   {T    } data
 * @param   {Token} type
 * @returns {void } */

/**
 * @template T
 * @callback Renderer_End_Token
 * @param   {T    } data
 * @returns {void } */

/**
 * @template T
 * @callback Renderer_Add_Text
 * @param   {T     } data
 * @param   {string} text
 * @returns {void  } */

/**
 * @template T
 * @callback Renderer_Set_Attr
 * @param   {T     } data
 * @param   {Attr  } type
 * @param   {string} value
 * @returns {void  } */

/**
 * The renderer interface.
 * @template T
 * @typedef  {object               } Renderer
 * @property {T                    } data      User data object. Available as first param in callbacks.
 * @property {Renderer_Add_Token<T>} add_token When the tokens starts.
 * @property {Renderer_End_Token<T>} end_token When the token ends.
 * @property {Renderer_Add_Text <T>} add_text  To append text to current token. Can be called multiple times or none.
 * @property {Renderer_Set_Attr <T>} set_attr  Set additional attributes of current token eg. the link url.
 */

/** @typedef {Renderer<any>} Any_Renderer */


/**
 * @typedef  {object} Default_Renderer_Data
 * @property {HTMLElement[]} nodes
 * @property {number       } index
 *
 * @typedef {Renderer          <Default_Renderer_Data>} Default_Renderer
 * @typedef {Renderer_Add_Token<Default_Renderer_Data>} Default_Renderer_Add_Token
 * @typedef {Renderer_End_Token<Default_Renderer_Data>} Default_Renderer_End_Token
 * @typedef {Renderer_Add_Text <Default_Renderer_Data>} Default_Renderer_Add_Text
 * @typedef {Renderer_Set_Attr <Default_Renderer_Data>} Default_Renderer_Set_Attr
 */

/**
 * @param   {HTMLElement     } root
 * @returns {Default_Renderer} */
export function default_renderer(root) {
    return {
        add_token: default_add_token,
        end_token: default_end_token,
        add_text:  default_add_text,
        set_attr:  default_set_attr,
        data    : {
            nodes: /**@type {*}*/([root,,,,,]),
            index: 0,
        },
    }
}

/** @type {Default_Renderer_Add_Token} */
export function default_add_token(data, type) {

    /**@type {Element}*/ let parent = data.nodes[data.index]

    /**@type {HTMLElement}*/ let slot

    switch (type) {
    case DOCUMENT: return // document is provided
    case BLOCKQUOTE:    slot = document.createElement("blockquote");break
    case PARAGRAPH:     slot = document.createElement("p")         ;break
    case LINE_BREAK:    slot = document.createElement("br")        ;break
    case RULE:          slot = document.createElement("hr")        ;break
    case HEADING_1:     slot = document.createElement("h1")        ;break
    case HEADING_2:     slot = document.createElement("h2")        ;break
    case HEADING_3:     slot = document.createElement("h3")        ;break
    case HEADING_4:     slot = document.createElement("h4")        ;break
    case HEADING_5:     slot = document.createElement("h5")        ;break
    case HEADING_6:     slot = document.createElement("h6")        ;break
    case ITALIC_AST:
    case ITALIC_UND:    slot = document.createElement("em")        ;break
    case STRONG_AST:
    case STRONG_UND:    slot = document.createElement("strong")    ;break
    case STRIKE:        slot = document.createElement("s")         ;break
    case CODE_INLINE:   slot = document.createElement("code")      ;break
    case RAW_URL:
    case LINK:          slot = document.createElement("a")         ;break
    case IMAGE:         slot = document.createElement("img")       ;break
    case LIST_UNORDERED:slot = document.createElement("ul")        ;break
    case LIST_ORDERED:  slot = document.createElement("ol")        ;break
    case LIST_ITEM:     slot = document.createElement("li")        ;break
    case CHECKBOX:
        let checkbox = slot = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.disabled = true
        break
    case CODE_BLOCK:
    case CODE_FENCE:
        parent = parent.appendChild(document.createElement("pre"))
        slot   = document.createElement("code")
        break
    case TABLE:
        slot = document.createElement("table")
        break
    case TABLE_ROW:
        switch (parent.children.length) {
        case 0:
            parent = parent.appendChild(document.createElement("thead"))
            break
        case 1:
            parent = parent.appendChild(document.createElement("tbody"))
            break
        default:
            parent = parent.children[1]
        }
        slot = document.createElement("tr")
        break
    case TABLE_CELL:
        slot = document.createElement(parent.parentElement?.tagName === "THEAD" ? "th" : "td")
        break
    case EQUATION_BLOCK:  slot = document.createElement("equation-block"); break
    case EQUATION_INLINE: slot = document.createElement("equation-inline"); break
    }

    data.nodes[++data.index] = parent.appendChild(slot)
}

/** @type {Default_Renderer_End_Token} */
export function default_end_token(data) {
    data.index -= 1
}

/** @type {Default_Renderer_Add_Text} */
export function default_add_text(data, text) {
    data.nodes[data.index].appendChild(document.createTextNode(text))
}

/** @type {Default_Renderer_Set_Attr} */
export function default_set_attr(data, type, value) {
    const node = data.nodes[data.index]
    /* A display block that was not maths is text again, its opener first: $$ as written,
       \[ as the escaped bracket it was, [ */
    if (UNCLOSED === type) {
        node.replaceWith(document.createTextNode(("\\[" === value ? "[" : value) + "\n" + node.textContent))
        return
    }
    node.setAttribute(attr_to_html_attr(type), value)
}


/**
 * @typedef {undefined} Logger_Renderer_Data
 *
 * @typedef {Renderer          <Logger_Renderer_Data>} Logger_Renderer
 * @typedef {Renderer_Add_Token<Logger_Renderer_Data>} Logger_Renderer_Add_Token
 * @typedef {Renderer_End_Token<Logger_Renderer_Data>} Logger_Renderer_End_Token
 * @typedef {Renderer_Add_Text <Logger_Renderer_Data>} Logger_Renderer_Add_Text
 * @typedef {Renderer_Set_Attr <Logger_Renderer_Data>} Logger_Renderer_Set_Attr
 */

/** @returns {Logger_Renderer} */
export function logger_renderer() {
    return {
        data:      undefined,
        add_token: logger_add_token,
        end_token: logger_end_token,
        add_text:  logger_add_text,
        set_attr:  logger_set_attr,
    }
}

/** @type {Logger_Renderer_Add_Token} */
export function logger_add_token(data, type) {
    console.log("add_token:", token_to_string(type))
}

/** @type {Logger_Renderer_End_Token} */
export function logger_end_token(data) {
    console.log("end_token")
}

/** @type {Logger_Renderer_Add_Text} */
export function logger_add_text(data, text) {
    console.log('add_text: "%s"', text)
}

/** @type {Logger_Renderer_Set_Attr} */
export function logger_set_attr(data, type, value) {
    console.log('set_attr: %s="%s"', attr_to_html_attr(type), value)
}
