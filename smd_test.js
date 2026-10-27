import * as smd from "./smd.js"

import {test_single_write, test_chunked_write, test_steps, test_time, BR} from "./smd_test_setup.js"

for (let level = 1; level <= 6; level += 1) {

    let heading = smd.heading_from_level(level)
    let hashes = "#".repeat(level)

    test_single_write(`Heading_${level}`,
        hashes+" "+"foo",
        [{
            type    : heading,
            children: ["foo"]
        }]
    )

    test_single_write(`Heading_${level} with Line Italic`,
        hashes+" foo *bar*",
        [{
            type    : heading,
            children: ["foo ", {
                type    : smd.Token.Italic_Ast,
                children: ["bar"]
            }]
        }]
    )

    test_single_write(`Heading_${level} after line break`,
        "\n"+hashes+" "+"foo",
        [{
            type    : heading,
            children: ["foo"]
        }]
    )

    test_single_write(`Heading_${level} ended after newline`,
        hashes+" "+"foo"+"\n"+
        "bar",
        [{
            type    : heading,
            children: ["foo"]
        }, {
            type    : smd.Token.Paragraph,
            children: ["bar"],
        }]
    )

    test_single_write(`Heading_${level} after heading`,
        "# foo"+"\n"+
        hashes+" "+"bar",
        [{
            type    : smd.Token.Heading_1,
            children: ["foo"]
        }, {
            type    : heading,
            children: ["bar"],
        }]
    )
}

test_single_write("Newline",
    "foo\nbar",
    [{
        type    : smd.Token.Paragraph,
        children: ["foo", BR, "bar"],
    }]
)

test_single_write("Newline with Italic",
    "*a\nb*",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Italic_Ast,
            children: ["a", BR, "b"]
        }],
    }]
)

test_single_write("Escaped Newline",
    "a\\\nb",
    [{
        type    : smd.Token.Paragraph,
        children: ["a", BR, "b"],
    }]
)

for (let br of ["<br>", "<br/>", "<br />"]) {
    test_single_write("Line Break ("+br+")",
        "a"+br+"b",
        [{
            type    : smd.Token.Paragraph,
            children: ["a", BR, "b"],
        }]
    )

    test_single_write("Line Break with Italic ("+br+")",
        "*a"+br+"b*",
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : smd.Token.Italic_Ast,
                children: ["a", BR, "b"]
            }],
        }]
    )

    test_single_write("Escaped Line Break ("+br+")",
        "a\\"+br+"b",
        [{
            type    : smd.Token.Paragraph,
            children: ["a"+br+"b"],
        }]
    )
}

for (let br of ["<bra>", "<br//>", "<b"]) {
    test_single_write("Wrong Line Break ("+br+")",
        "a"+br+"b",
        [{
            type    : smd.Token.Paragraph,
            children: ["a"+br+"b"],
        }]
    )
}


test_single_write("Paragraphs",
    "foo\n\nbar",
    [{
        type    : smd.Token.Paragraph,
        children: ["foo"],
    }, {
        type    : smd.Token.Paragraph,
        children: ["bar"],
    }]
)

test_single_write("Paragraph trim leading spaces",
    "  foo",
    [{
        type    : smd.Token.Paragraph,
        children: ["foo"],
    }]
)

test_single_write("Trim too many spaces",
    "foo       bar",
    [{
        type    : smd.Token.Paragraph,
        children: ["foo bar"],
    }]
)

test_single_write("Trim too many spaces in italic",
    "*foo       bar*",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Italic_Ast,
            children: ["foo bar"]
        }],
    }]
)

for (const c of ["*", "-", "_"]) {
    for (let l = 3; l <= 6; l += 1) {
        let rule = ""
        for (let i = 0; i < l; i += 1) {
            if (i % 2 === 0) {
                rule += " " // mix in some spaces
            }
            rule += c
        }

        test_single_write('Horizontal Rule "'+rule+'"',
            rule,
            [{
                type    : smd.Token.Rule,
                children: []
            }]
        )

        test_single_write("Text after Horizontal Rule",
            rule+"\n"+
            "foo",
            [{
                type    : smd.Token.Rule,
                children: []
            }, {
                type    : smd.Token.Paragraph,
                children: ["foo"],
            }]
        )

        test_single_write("Horizontal Rule after list",
            "- foo\n"+
            rule,
            [{
                type    : smd.Token.List_Unordered,
                children: [{
                    type    : smd.Token.List_Item,
                    children: ["foo"],
                }]
            }, {
                type    : smd.Token.Rule,
                children: []
            }]
        )
    }
}

for (let l = 1; l <= 4; l += 1) {
    const c = '`'.repeat(l)

    test_single_write("Code Inline" + " - "+l+" backticks",
        c + "a" + c,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : smd.Token.Code_Inline,
                children: ["a"]
            }],
        }]
    )

    test_single_write("Code Inline trims spaces" + " - "+l+" backticks",
        c + " a " + c,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : smd.Token.Code_Inline,
                children: ["a"]
            }],
        }]
    )

    test_single_write("Code Inline x2" + " - "+l+" backticks",
        c+"a"+c+" "+c+"b"+c,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : smd.Token.Code_Inline,
                children: ["a"]
            }, " ", {
                type    : smd.Token.Code_Inline,
                children: ["b"]
            }],
        }]
    )

    test_single_write("Escaped backtick before Code Inline"+" - "+l+" backticks",
        "\\`"+c+"a"+c+"b`c`",
        [{
            type    : smd.Token.Paragraph,
            children: [
                "`", {
                    type    : smd.Token.Code_Inline,
                    children: ["a"],
                }, "b", {
                    type    : smd.Token.Code_Inline,
                    children: ["c"],
                },
            ],
        }],
    )

    if (l > 1) {
        let m = '`'.repeat(l - 1)

        test_single_write("Code ` Inline" + " - "+l+" backticks",
        c + "a"+m+"b" + c,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : smd.Token.Code_Inline,
                children: ["a"+m+"b"]
            }],
        }])
    }
}

for (let l = 1; l <= 2; l += 1) {
    let c = '`'.repeat(l)

    test_single_write("Code with newline" + " - "+l+" backticks",
        c+"a\nb"+c,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : smd.Token.Code_Inline,
                children: ["a", BR, "b"]
            }],
        }]
    )

    test_single_write("Code with two newlines"+" - "+l+" backticks",
        c+"a"+"\n"+
        "\n"+
        "b"+c+"c"+c,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : smd.Token.Code_Inline,
                children: ["a"]
            }],
        }, {
            type    : smd.Token.Paragraph,
            children: ["b", {
                type    : smd.Token.Code_Inline,
                children: ["c"],
            }],
        }],
    )

    test_single_write("Unfinished code in a list"+" - "+l+" backticks",
        "- "+c+"a\n"+
        "- "+c+"b"+c+"c",
        [{
            type    : smd.Token.List_Unordered,
            children: [{
                type    : smd.Token.List_Item,
                children: [{
                    type    : smd.Token.Code_Inline,
                    children: ["a"]
                }],
            }, {
                type    : smd.Token.List_Item,
                children: [{
                    type    : smd.Token.Code_Inline,
                    children: ["b"],
                }, "c"],
            }],
        }],
    )
}

{
    const markdown = "# Test start\n\n```\nthis is a\nmultiline code\nfunction_call(```\ncode should end after this\n```\n\nPost-code text"
    const expected = [{
        type    : smd.Token.Heading_1,
        children: ["Test start"],
    }, {
        type    : smd.Token.Code_Fence,
        children: ["this is a\nmultiline code\nfunction_call(```\ncode should end after this"],
    }, {
        type    : smd.Token.Paragraph,
        children: ["Post-code text"],
    }]
    test_single_write("Code_Fence issue #40", markdown, expected)
    test_chunked_write("Code_Fence issue #40", markdown, expected)
}

for (let l = 3; l <= 5; l += 1) {

    let fence      = '`'.repeat(l)
    let fence_less = '`'.repeat(l - 1)
    let fence_more = '`'.repeat(l + 1)

    test_single_write("Empty Code_Fence:"+l,
        fence+"\n"+fence,
        [{
            type    : smd.Token.Code_Fence,
            children: []
        }]
    )

    test_single_write("Code_Fence:"+l,
        fence+"\nfoo\n"+fence,
        [{
            type    : smd.Token.Code_Fence,
            children: ["foo"]
        }]
    )

    for (const prefix of ["function_call(", "x", " x", "\nfunction_call("]) {
        const markdown = fence+"\n"+prefix+fence+"\nstill code\n"+fence+"\n\nPost-code text"
        const expected = [{
            type    : smd.Token.Code_Fence,
            children: [prefix+fence+"\nstill code"],
        }, {
            type    : smd.Token.Paragraph,
            children: ["Post-code text"],
        }]
        const title = "Code_Fence:"+l+" mid-line fence after "+JSON.stringify(prefix)
        test_single_write(title, markdown, expected)
        test_chunked_write(title, markdown, expected)
    }

    test_single_write("Code_Fence:"+l+" after paragraph",
        "a"+"\n"+
        fence+"\n"+
        "b"+"\n"+
        fence,
        [{
            type    : smd.Token.Paragraph,
            children: ["a"],
        }, {
            type    : smd.Token.Code_Fence,
            children: ["b"],
        }],
    )

    test_single_write("Code_Fence:"+l+" after heading",
        "# a"+"\n"+
        fence+"\n"+
        "b"+"\n"+
        fence,
        [{
            type    : smd.Token.Heading_1,
            children: ["a"],
        }, {
            type    : smd.Token.Code_Fence,
            children: ["b"],
        }],
    )

    test_single_write("Code_Fence:"+l+" space before close",
        fence+"\nfoo\n "+fence,
        [{
            type    : smd.Token.Code_Fence,
            children: ["foo"]
        }]
    )

    test_single_write("Code_Fence:"+l+" with language",
        fence+"js\nfoo\n"+fence,
        [{
            type    : smd.Token.Code_Fence,
            children: ["foo"],
            attrs   : {[smd.Attr.Lang]: "js"},
        }],
    )

    test_single_write("Code_Fence:"+l+" escaped backticks",
        fence+"\n"+fence_less+"\n"+fence,
        [{
            type    : smd.Token.Code_Fence,
            children: [fence_less],
        }],
    )

    test_single_write("Code_Fence:"+l+" - bad_end_fence:less",
        fence+"\n"+
        fence_less+"\n"+
        fence,
        [{
            type    : smd.Token.Code_Fence,
            children: [fence_less],
        }],
    )

    test_single_write("Code_Fence:"+l+" - bad_end_fence:more",
        fence+"\n"+
        fence_more+"\n"+
        fence,
        [{
            type    : smd.Token.Code_Fence,
            children: [fence_more],
        }],
    )

    test_single_write("Code_Fence:"+l+" - bad_end_fence:char",
        fence+"\n"+
        fence+"b"+"\n"+
        fence,
        [{
            type    : smd.Token.Code_Fence,
            children: [fence+"b"]
        }],
    )

    test_single_write("Code_Fence:"+l+" - bad_end_fence:space",
        fence+"\n"+
        "`".padStart(l)+"\n"+
        fence,
        [{
            type    : smd.Token.Code_Fence,
            children: ["`".padStart(l)],
        }],
    )

    test_single_write("Multiple Code Fence:"+l+" should be separated",
        `${fence}\nFoo\n${fence}\n\nBar\n\n${fence}\nBaz\n${fence}`,
        [{
            type    : smd.Token.Code_Fence,
            children: ["Foo"],
        }, {
            type    : smd.Token.Paragraph,
            children: ["Bar"],
        }, {
            type    : smd.Token.Code_Fence,
            children: ["Baz"],
        }],
    )

    test_single_write("Nested Code Fence:"+l,
        `${fence_more}\nbefore\n${fence}js\nsome js\n${fence}\n${fence_more}`,
        [{
            type    : smd.Token.Code_Fence,
            children: [`before\n${fence}js\nsome js\n${fence}`],
        }],
    )
}


for (const indent of [
    "    ",
    "   \t",
    "  \t",
    " \t",
    "\t",
]) {
    const escaped_indent = indent.replace(/\t/g, "\\t")

    test_single_write("Code_Block; indent: '"+escaped_indent+"'",
        indent + "  foo",
        [{
            type    : smd.Token.Code_Block,
            children: ["  foo"]
        }]
    )

    test_single_write("Code_Block multiple lines; indent: '"+escaped_indent+"'",
        indent + "foo\n" +
        indent + "bar",
        [{
            type    : smd.Token.Code_Block,
            children: ["foo\nbar"]
        }]
    )

    test_single_write("Code_Block end; indent: '"+escaped_indent+"'",
        indent+"foo\n" +
        "bar",
        [{
            type    : smd.Token.Code_Block,
            children: ["foo"]
        }, {
            type    : smd.Token.Paragraph,
            children: ["bar"]
        }]
    )
}


for (const {c, italic, strong} of [{
    c: "*",
    italic: smd.Token.Italic_Ast,
    strong: smd.Token.Strong_Ast,
}, {
    c: "_",
    italic: smd.Token.Italic_Und,
    strong: smd.Token.Strong_Und,
}]) {
    const case_1 = ""+c+c+"bold"+c+"bold>em"+c+c+c+""
    const case_2 = ""+c+c+c+"bold>em"+c+"bold"+c+c+""
    const case_3 = ""+c+"em"+c+c+"em>bold"+c+c+c+""
    const case_4 = ""+c+c+c+"bold>em"+c+c+"em"+c+""

    test_single_write("Italic & Bold \""+case_1+"\'",
        case_1,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : strong,
                children: ["bold", {
                    type    : italic,
                    children: ["bold>em"]
                }]
            }]
        }]
    )

    test_single_write("Italic & Bold \""+case_2+"\'",
        case_2,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : strong,
                children: [{
                    type    : italic,
                    children: ["bold>em"]
                },
                "bold"]
            }]
        }]
    )

    test_single_write("Italic & Bold \""+case_3+"\'",
        case_3,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : italic,
                children: ["em", {
                    type    : strong,
                    children: ["em>bold"]
                }]
            }]
        }]
    )

    test_single_write("Italic & Bold \""+case_4+"\'",
        case_4,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : strong,
                children: [{
                    type    : italic,
                    children: ["bold>em"]
                }]
            }, {
                type    : italic,
                children: ["em"]
            }]
        }]
    )
}

for (const {type, c} of [
    {type: smd.Token.Italic_Ast, c: "*" },
    {type: smd.Token.Italic_Und, c: "_" },
    {type: smd.Token.Strong_Ast, c: "**"},
    {type: smd.Token.Strong_Und, c: "__"},
    {type: smd.Token.Strike    , c: "~~"},
]) {
    let e = ""
    for (const char of c) {
        e += "\\" + char
    }

    test_single_write(smd.token_to_string(type),
        c + "foo" + c,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : type,
                children: ["foo"]
            }]
        }]
    )

    test_single_write(smd.token_to_string(type) + " space after begin",
        "a " + c + " b" + c,
        [{
            type    : smd.Token.Paragraph,
            children: ["a " + c + " b" + c]
        }]
    )

    test_single_write(smd.token_to_string(type) + " with Code",
        c + "`foo`" + c,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : type,
                children: [{
                    type    : smd.Token.Code_Inline,
                    children: ["foo"]
                }]
            }]
        }]
    )

    test_single_write(smd.token_to_string(type) + " new Paragraph",
        "foo\n\n"+
        c + "bar" + c,
        [{
            type    : smd.Token.Paragraph,
            children: ["foo"],
        }, {
            type    : smd.Token.Paragraph,
            children: [{
                type    : type,
                children: ["bar"]
            }],
        }]
    )

    test_single_write(`Escape ${smd.token_to_string(type)} Begin`,
        e + "foo",
        [{
            type    : smd.Token.Paragraph,
            children: [c + "foo"]
        }]
    )

    test_single_write(`Escape ${smd.token_to_string(type)} End`,
        c + "foo" + e,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : type,
                children: ["foo" + c]
            }]
        }]
    )
}

test_single_write("Escape Backtick",
    "\\`" + "foo",
    [{
        type    : smd.Token.Paragraph,
        children: ["`" + "foo"]
    }]
)

test_single_write("Escape Backslash",
    "\\\\" + "foo",
    [{
        type    : smd.Token.Paragraph,
        children: ["\\" + "foo"]
    }]
)

test_single_write("Escape normal char",
    "\\a",
    [{
        type    : smd.Token.Paragraph,
        children: ["\\a"]
    }]
)

for (const url of [
    "http://example.com/page",
    "https://example.com/page",
]) {
    test_single_write("Raw URL " + url,
        url,
        [{
            type    : smd.Token.Paragraph,
            children: [{
                type    : smd.Token.Raw_URL,
                attrs   : {[smd.Attr.Href]: url},
                children: [url],
            }]
        }]
    )

    test_single_write("Raw URL in text " + url,
        "foo "+url+" bar",
        [{    type    : smd.Token.Paragraph,
            children: [
                "foo ",
                {    type    : smd.Token.Raw_URL,
                    attrs   : {[smd.Attr.Href]: url},
                    children: [url],
                },
                " bar",
            ]
        }]
    )

    test_single_write("Doesn't match urls in text",
        "foo"+url,
        [{
            type    : smd.Token.Paragraph,
            children: ["foo"+url]
        }],
    )
}

test_single_write("Doesn't match not_urls as urls",
    "http:/wrong.com",
    [{
        type    : smd.Token.Paragraph,
        children: ["http:/wrong.com"]
    }]
)

test_single_write("Link",
    "[title](url)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "url"},
            children: ["title"],
        }]
    }]
)

// Upstream PR #29's case: an underscore inside a word is not emphasis.
test_single_write("Link with Underline",
    "[title_with_underline](url)",
    [{
        type: smd.Token.Paragraph,
        children: [{
            type: smd.Token.Link,
            attrs: { [smd.Attr.Href]: "url" },
            children: ["title_with_underline"],
        }]
    }]
)

test_single_write("Underscores inside a word",
    "snake_case_name",
    [{
        type    : smd.Token.Paragraph,
        children: ["snake_case_name"],
    }]
)

test_single_write("Underscores inside words of a sentence",
    "call my_function_name with a_b",
    [{
        type    : smd.Token.Paragraph,
        children: ["call my_function_name with a_b"],
    }]
)

// A stream splits words and links anywhere: every two-chunk split gives the same tree.
test_chunked_write("Underscores inside words of a sentence",
    "call my_function_name with a_b",
    [{
        type    : smd.Token.Paragraph,
        children: ["call my_function_name with a_b"],
    }]
)

test_chunked_write("Link with brackets in text and underscores",
    "see [[1] read_me.md](url) _now_",
    [{
        type    : smd.Token.Paragraph,
        children: ["see ", {
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "url"},
            children: ["[1] read_me.md"],
        }, " ", {
            type    : smd.Token.Italic_Und,
            children: ["now"],
        }]
    }]
)

test_single_write("Link with Strong in text",
    "[**bold** text](url)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "url"},
            children: [{
                type    : smd.Token.Strong_Ast,
                children: ["bold"],
            }, " text"],
        }]
    }]
)

test_single_write("Link with code",
    "[`title`](url)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "url"},
            children: [{
                type    : smd.Token.Code_Inline,
                children: ["title"],
            }],
        }]
    }]
)

test_single_write("Link new paragraph",
    "foo\n\n"+
    "[title](url)",
    [{
        type    : smd.Token.Paragraph,
        children: ["foo"]
    },{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "url"},
            children: ["title"],
        }]
    }]
)

test_single_write("Image",
    "![title](url)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Image,
            attrs   : {[smd.Attr.Src]: "url"},
            children: ["title"],
        }]
    }]
)

test_single_write("Image with code",
    "![`title`](url)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Image,
            attrs   : {[smd.Attr.Src]: "url"},
            children: ["`title`"],
        }]
    }]
)

test_single_write("Link with Image",
    "[![title](src)](href)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "href"},
            children: [{
                type    : smd.Token.Image,
                attrs   : {[smd.Attr.Src]: "src"},
                children: ["title"],
            }],
        }]
    }]
)

test_single_write("Escaped link Begin",
    "\\[foo](url)",
    [{
        type    : smd.Token.Paragraph,
        children: ["[foo](url)"]
    }]
)

test_single_write("Escaped link End",
    "[foo\\](url)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Link,
            children: ["foo](url)"],
        }]
    }]
)

test_single_write("Un-Escaped link Both",
    "\\\\[foo\\\\](url)",
    [{
        type    : smd.Token.Paragraph,
        children: ["\\", {
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "url"},
            children: ["foo\\"],
        }]
    }]
)

test_single_write("Link with brackets in text",
    "[a [b] c](url)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "url"},
            children: ["a [b] c"],
        }]
    }]
)

test_single_write("Link with a bracketed number as text",
    "[[1]](url)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "url"},
            children: ["[1]"],
        }]
    }]
)

test_single_write("Link with nested brackets in text",
    "see [a [b [c]] d](url) now",
    [{
        type    : smd.Token.Paragraph,
        children: ["see ", {
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "url"},
            children: ["a [b [c]] d"],
        }, " now"]
    }]
)

test_single_write("Link after a link with brackets",
    "[[1]](a) and [b](c)",
    [{
        type    : smd.Token.Paragraph,
        children: [{
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "a"},
            children: ["[1]"],
        }, " and ", {
            type    : smd.Token.Link,
            attrs   : {[smd.Attr.Href]: "c"},
            children: ["b"],
        }]
    }]
)

test_single_write("Blockquote",
    "> foo",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Paragraph,
            children: ["foo"],
        }]
    }]
)

test_single_write("Blockquote no-space",
    ">foo",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Paragraph,
            children: ["foo"],
        }]
    }]
)

test_single_write("Blockquote Escape",
    "\\> foo",
    [{
        type    : smd.Token.Paragraph,
        children: ["> foo"],
    }]
)

test_single_write("Blockquote line break",
    "> foo\nbar",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Paragraph,
            children: ["foo", BR, "bar"],
        }]
    }]
)

test_single_write("Blockquote continued",
    "> foo\n> bar",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Paragraph,
            children: ["foo", BR, "bar"],
        }]
    }]
)

test_single_write("Blockquote end",
    "> foo\n\nbar",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Paragraph,
            children: ["foo"],
        }]
    }, {
        type    : smd.Token.Paragraph,
        children: ["bar"],
    }]
)

test_single_write("Blockquote heading",
    "> # foo",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Heading_1,
            children: ["foo"],
        }]
    }]
)

test_single_write("Blockquote codeblock",
    "> ```\nfoo\n```",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Code_Fence,
            children: ["foo"],
        }]
    }]
)

test_single_write("Blockquote blockquote",
    "> > foo",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Blockquote,
            children: [{
                type    : smd.Token.Paragraph,
                children: ["foo"],
            }]
        }]
    }]
)

test_single_write("Blockquote up blockquote",
    "> foo\n"+
    "> > bar",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Paragraph,
            children: ["foo"],
        }, {
            type    : smd.Token.Blockquote,
            children: [{
                type    : smd.Token.Paragraph,
                children: ["bar"],
            }]
        }]
    }]
)

test_single_write("Blockquote blockquote down",
    "> > foo\n"+
    "> \n"+
    "> bar",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Blockquote,
            children: [{
                type    : smd.Token.Paragraph,
                children: ["foo"],
            }]
        }, {
            type    : smd.Token.Paragraph,
            children: ["bar"],
        }]
    }]
)

test_single_write("Blockquote blockquote continued",
    "> > foo\n"+
    "> >\n"+
    "> > bar",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Blockquote,
            children: [{
                type    : smd.Token.Paragraph,
                children: ["foo"],
            }, {
                type    : smd.Token.Paragraph,
                children: ["bar"],
            }]
        }]
    }]
)

test_single_write("Blockquote up down",
    "> > foo\n"+
    ">\n"+
    "> > bar",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Blockquote,
            children: [{
                type    : smd.Token.Paragraph,
                children: ["foo"],
            }]
        }, {
            type    : smd.Token.Blockquote,
            children: [{
                type    : smd.Token.Paragraph,
                children: ["bar"],
            }]
        }]
    }]
)

test_single_write("Blockquote with code and line break",
    "> > `a\n"+
    "b`\n"+
    ">\n"+
    "> > c",
    [{
        type    : smd.Token.Blockquote,
        children: [{
            type    : smd.Token.Blockquote,
            children: [{
                type    : smd.Token.Paragraph,
                children: [{
                    type    : smd.Token.Code_Inline,
                    children: ["a", BR, "b"],
                }]
            }]
        }, {
            type    : smd.Token.Blockquote,
            children: [{
                type    : smd.Token.Paragraph,
                children: ["c"],
            }],
        }]
    }]
)

test_single_write("Ordered list",
    "1. hello\n"+
    "2. world\n"+
    "3. wave",
    [{
        type    : smd.Token.List_Ordered,
        children: [{
            type    : smd.Token.List_Item,
            children: ["hello"],
        }, {
            type    : smd.Token.List_Item,
            children: ["world"],
        }, {
            type    : smd.Token.List_Item,
            children: ["wave"],
        }],
    }]
)

for (const [c, token] of /** @type {const} */([
    ["*",    smd.Token.List_Unordered],
    ["-",    smd.Token.List_Unordered],
    ["+",    smd.Token.List_Unordered],
    ["1.",   smd.Token.List_Ordered],
    ["420.", smd.Token.List_Ordered],
])) {
    let list_name = token === smd.Token.List_Unordered
        ? "List Unordered"
        : "List Ordered"
    let suffix = "; prefix: "+c

    let attrs = c === "420."
        ? {[smd.Attr.Start]: "420"}
        : undefined

    let indent       = " ".repeat(c.length + 1)
    let indent_small = " ".repeat(c.length)

    test_single_write(list_name + suffix,
        c+" foo",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["foo"]
            }]
        }]
    )

    test_single_write(list_name + " with italic" + suffix,
        c+" *foo*",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: [{
                    type    : smd.Token.Italic_Ast,
                    children: ["foo"]
                }]
            }]
        }]
    )

    test_single_write(list_name + " two items" + suffix,
        c+" a\n"+
        c+" b",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a"]
            }, {
                type    : smd.Token.List_Item,
                children: ["b"]
            }]
        }]
    )

    test_single_write(list_name + " with line break" + suffix,
        c+" a\nb",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a", BR, "b"]
            }]
        }]
    )

    test_single_write(list_name + " with two newlines" + suffix,
        c+" a\n\n"+c+" b",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a"]
            }, {
                type    : smd.Token.List_Item,
                children: ["b"]
            }]
        }]
    )

    test_single_write(list_name + " with three newlines" + suffix,
        c+" a\n\n\n"+c+" b",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a"]
            }]
        }, {
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["b"]
            }]
        }]
    )

    test_single_write(list_name + " end" + suffix,
        c+" a\n"+
        "\n"+
        "b",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a"]
            }]
        }, {
            type    : smd.Token.Paragraph,
            children: ["b"]
        }]
    )

    test_single_write(list_name + " after line break" + suffix,
        "a\n"+
        c+" b",
        [{
            type    : smd.Token.Paragraph,
            children: ["a"]
        }, {
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["b"]
            }]
        }]
    )

    test_single_write(list_name + " with unchecked task" + suffix,
        c+" [ ] foo",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: [{
                    type    : smd.Token.Checkbox,
                    children: [],
                }, " foo"]
            }]
        }]
    )

    test_single_write(list_name + " with checked task" + suffix,
        c+" [x] foo",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: [{
                    type    : smd.Token.Checkbox,
                    attrs   : {[smd.Attr.Checked]: ""},
                    children: [],
                }, " foo"]
            }]
        }]
    )

    test_single_write(list_name + " with two tasks" + suffix,
        c+" [ ] foo\n"+
        c+" [x] bar\n",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: [{
                    type    : smd.Token.Checkbox,
                    children: [],
                }, " foo"]
            }, {
                type    : smd.Token.List_Item,
                children: [{
                    type    : smd.Token.Checkbox,
                    attrs   : {[smd.Attr.Checked]: ""},
                    children: [],
                }, " bar"]
            }]
        }]
    )

    test_single_write(list_name + " with link" + suffix,
        c+" [x](url)",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: [{
                    type    : smd.Token.Link,
                    attrs   : {[smd.Attr.Href]: "url"},
                    children: ["x"],
                }]
            }]
        }]
    )

    test_single_write(list_name + " nested list" + suffix,
        c+" a\n"+
        indent+c+" b",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a", {
                    type    : token,
                    attrs   : attrs,
                    children: [{
                        type    : smd.Token.List_Item,
                        children: ["b"]
                    }]
                }]
            }]
        }]
    )

    test_single_write(list_name + " failed nested list" + suffix,
        c+" a\n"+
        indent_small+c+" b",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a"]
            }, {
                type    : smd.Token.List_Item,
                children: ["b"]
            }]
        }]
    )

    test_single_write(list_name + " nested ul multiple items" + suffix,
        c+" a\n"+
        indent+"* b\n"+
        indent+"* c\n",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a", {
                    type    : smd.Token.List_Unordered,
                    children: [{
                        type    : smd.Token.List_Item,
                        children: ["b"]
                    }, {
                        type    : smd.Token.List_Item,
                        children: ["c"]
                    }]
                }]
            }]
        }]
    )

    test_single_write(list_name + " nested and un-nested" + suffix,
        c+" a\n"+
        indent+"* b\n"+
        c+" c\n",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a", {
                    type    : smd.Token.List_Unordered,
                    children: [{
                        type    : smd.Token.List_Item,
                        children: ["b"]
                    }]
                }]
            }, {
                type    : smd.Token.List_Item,
                children: ["c"]
            }]
        }]
    )

    test_single_write("Blockquote in " + list_name + suffix,
        c+" "+"a"+"\n"+
        indent+"> b",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a", {
                    type    : smd.Token.Blockquote,
                    children: [{
                        type    : smd.Token.Paragraph,
                        children: ["b"],
                    }],
                }],
            }],
        }],
    )

    test_single_write("Table in " + list_name + suffix,
        c+" "+"a"+"\n"+
        indent+"| b | c |"+"\n"+
        indent+"| - | - |"+"\n"+
        indent+"| d | e |",
        [{
            type    : token,
            attrs   : attrs,
            children: [{
                type    : smd.Token.List_Item,
                children: ["a", {
                    type    : smd.Token.Table,
                    children: [{
                        type:     smd.Token.Table_Row,
                        children: [
                            {type: smd.Token.Table_Cell, children: [" b "]},
                            {type: smd.Token.Table_Cell, children: [" c "]},
                        ]
                    }, {
                        type:     smd.Token.Table_Row,
                        children: [
                            {type: smd.Token.Table_Cell, children: [" d "]},
                            {type: smd.Token.Table_Cell, children: [" e "]},
                        ]
                    }],
                }],
            }],
        }],
    )

    for (let l = 3; l <= 5; l += 1) {
        let fence = '`'.repeat(l)

        test_single_write("Code_Fence:"+l+" in " + list_name + suffix,
            c+" "+"a"+"\n"+
            indent+fence+"\n"+
            indent+"b"+"\n"+
            indent+"c"+"\n"+
            indent+fence+"\n"+
            "d",
            [{
                type    : token,
                attrs   : attrs,
                children: [{
                    type    : smd.Token.List_Item,
                    children: ["a", {
                        type    : smd.Token.Code_Fence,
                        children: ["b\nc"],
                    }],
                }],
            }, {
                type    : smd.Token.Paragraph,
                children: ["d"],
            }],
        )

        test_single_write("Code_Fence:"+l+" after " + list_name + suffix,
            c+" "+"a"+"\n"+
            fence+"\n"+
            "b"+"\n"+
            fence,
            [{
                type    : token,
                attrs   : attrs,
                children: [{
                    type    : smd.Token.List_Item,
                    children: ["a"],
                }],
            }, {
                type    : smd.Token.Code_Fence,
                children: ["b"],
            }],
        )
    }

    for (let add_newline of /** @type {const} */([0, 1, 2])) {
        /** @type {string} */ let newline = ""
        /** @type {string} */ let newline_title = ""
        switch (add_newline) {
        case 1:
            newline = "\n"
            newline_title = "; newline"
            break
        case 2:
            newline = indent+"\n"
            newline_title = "; indent newline"
            break
        }

        test_single_write(list_name+" after heading"+newline_title+suffix,
            "# a\n"+
            newline+
            c+" b",
            [{
                type    : smd.Token.Heading_1,
                children: ["a"],
            }, {
                type    : token,
                attrs   : attrs,
                children: [{
                    type    : smd.Token.List_Item,
                    children: ["b"]
                }]
            }]
        )

        test_single_write(list_name+" nested after heading"+newline_title+suffix,
            "# a\n"+
            newline+
            c+" b"+"\n"+
            indent+"* c",
            [{
                type    : smd.Token.Heading_1,
                children: ["a"],
            }, {
                type    : token,
                attrs   : attrs,
                children: [{
                    type    : smd.Token.List_Item,
                    children: ["b", {
                        type    : smd.Token.List_Unordered,
                        children: [{
                            type    : smd.Token.List_Item,
                            children: ["c"]
                        }]
                    }]
                }]
            }]
        )

        test_single_write(list_name+" before heading"+newline_title+suffix,
            c+" a\n"+
            newline+
            "# b",
            [{
                type    : token,
                attrs   : attrs,
                children: [{
                    type    : smd.Token.List_Item,
                    children: ["a"]
                }]
            }, {
                type    : smd.Token.Heading_1,
                children: ["b"],
            }]
        )

        test_single_write(list_name+" nested before heading"+newline_title+suffix,
            c+" a\n"+
            indent+"- b"+"\n"+
            newline+
            "## c",
            [{
                type    : token,
                attrs   : attrs,
                children: [{
                    type    : smd.Token.List_Item,
                    children: ["a", {
                        type    : smd.Token.List_Unordered,
                        children: [{
                            type    : smd.Token.List_Item,
                            children: ["b"]
                        }]
                    }]
                }]
            }, {
                type    : smd.Token.Heading_2,
                children: ["c"],
            }]
        )
    }

    // test_single_write(list_name+" single line nesting"+suffix,
    //     c+" * a",
    //     [{
    //         type    : token,
    //         attrs   : attrs,
    //         children: [{
    //             type    : smd.Token.List_Item,
    //             children: [{
    //                 type    : smd.Token.List_Unordered,
    //                 children: [{
    //                     type    : smd.Token.List_Item,
    //                     children: ["a"]
    //                 }]
    //             }]
    //         }]
    //     }]
    // )

    // test_single_write(list_name + " single line nesting continued" + suffix,
    //     c+" * a\n"+
    //     indent+"* b",
    //     [{
    //         type    : token,
    //         attrs   : attrs,
    //         children: [{
    //             type    : smd.Token.List_Item,
    //             children: [{
    //                 type    : smd.Token.List_Unordered,
    //                 children: [{
    //                     type    : smd.Token.List_Item,
    //                     children: ["a"]
    //                 }, {
    //                     type    : smd.Token.List_Item,
    //                     children: ["b"]
    //                 }]
    //             }]
    //         }]
    //     }]
    // )
}

test_single_write("Failed nesting of ul in ol",
    "1. a\n"+
    "  * b",
    [{
        type    : smd.Token.List_Ordered,
        children: [{
            type    : smd.Token.List_Item,
            children: ["a"]
        }]
    }, {
        type    : smd.Token.List_Unordered,
        children: [{
            type    : smd.Token.List_Item,
            children: ["b"]
        }]
    }]
)

// test_single_write("Heading in a list item",
//     "- # foo",
//     [{
//         type    : smd.Token.List_Unordered,
//         children: [{
//             type    : smd.Token.List_Item,
//             children: [{
//                 type    : smd.Token.Heading_1,
//                 children: ["foo"]
//             }]
//         }]
//     }]
// )

test_single_write("Simple Table",
`| Foo | Bar |
| -- | -- |
| A\\|a | Bb |
| aA| bB |`,
[{
    type    : smd.Token.Table,
    children: [{
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" Foo "]},
            {type: smd.Token.Table_Cell, children: [" Bar "]},
        ]
    }, {
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" A|a "]},
            {type: smd.Token.Table_Cell, children: [" Bb "]},
        ]
    }, {
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" aA"]},
            {type: smd.Token.Table_Cell, children: [" bB "]},
        ]
    }]
}])

test_single_write("Table after heading",
`# Heading
| Foo | Bar |
| -- | -- |
| a | b |`,
[{
    type    : smd.Token.Heading_1,
    children: ["Heading"],
}, {
    type    : smd.Token.Table,
    children: [{
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" Foo "]},
            {type: smd.Token.Table_Cell, children: [" Bar "]},
        ],
    }, {
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" a "]},
            {type: smd.Token.Table_Cell, children: [" b "]},
        ],
    }],
}])

test_single_write("Table after paragraph",
`paragraph
| Foo | Bar |
| -- | -- |
| a | b |`,
[{
    type    : smd.Token.Paragraph,
    children: ["paragraph"],
}, {
    type    : smd.Token.Table,
    children: [{
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" Foo "]},
            {type: smd.Token.Table_Cell, children: [" Bar "]},
        ],
    }, {
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" a "]},
            {type: smd.Token.Table_Cell, children: [" b "]},
        ],
    }],
}])

test_single_write("Table Empty Cells",
`||
|-|
||`,
[{
    type    : smd.Token.Table,
    children: [{
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: []},
        ]
    }, {
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: []},
        ]
    }]
}])

test_single_write("Table Escaped Pipe",
`\\| a | b | c |`,
[{
    type    : smd.Token.Paragraph,
    children: ["\| a | b | c |"],
}])

test_single_write("Paragraph after table",
`| A | B |
| -- | -- |
| a | b |

Hello`,
[{
    type    : smd.Token.Table,
    children: [{
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" A "]},
            {type: smd.Token.Table_Cell, children: [" B "]},
        ]
    }, {
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" a "]},
            {type: smd.Token.Table_Cell, children: [" b "]},
        ]
    }]
}, {
    type:     smd.Token.Paragraph,
    children: ["Hello"],
}])

test_single_write("Table after table",
`| A | B |
| - | - |
| a | b |

| C | D |
| - | - |
| c | d |`,
[{
    type    : smd.Token.Table,
    children: [{
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" A "]},
            {type: smd.Token.Table_Cell, children: [" B "]},
        ]
    }, {
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" a "]},
            {type: smd.Token.Table_Cell, children: [" b "]},
        ]
    }]
}, {
    type    : smd.Token.Table,
    children: [{
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" C "]},
            {type: smd.Token.Table_Cell, children: [" D "]},
        ]
    }, {
        type:     smd.Token.Table_Row,
        children: [
            {type: smd.Token.Table_Cell, children: [" c "]},
            {type: smd.Token.Table_Cell, children: [" d "]},
        ]
    }]
}])

test_single_write("Table with nested elements",
`| *Aa* | B<br>b |
| -- | -- |
| \`aA\` | bB |`,
[{
    type    : smd.Token.Table,
    children: [{
        type:     smd.Token.Table_Row,
        children: [{
            type:     smd.Token.Table_Cell,
            children: [
                " ",
                {type: smd.Token.Italic_Ast, children: ["Aa"]},
                " ",
            ]
        }, {
            type:     smd.Token.Table_Cell,
            children: [" B", BR, "b "],
        }],
    }, {
        type:     smd.Token.Table_Row,
        children: [{
            type: smd.Token.Table_Cell,
            children: [
                " ",
                {type: smd.Token.Code_Inline, children: ["aA"]},
                " ",
            ]
        }, {
            type: smd.Token.Table_Cell,
            children: [" bB "],
        }],
    }],
}])

// TODO: multiline cells
// test_single_write("Table with multiline cells",
//     "| h1 | h2 |"+"\n"+
//     "| -- | -- |"+"\n"+
//     "| a  | b  |"+"\n"+
//     "|    | B  |"+"\n",
//     [{
//         type    : smd.Token.Table,
//         children: [{
//             type:     smd.Token.Table_Row,
//             children: [
//                 {type: smd.Token.Table_Cell, children: [" h1 "]},
//                 {type: smd.Token.Table_Cell, children: [" h2 "]},
//             ],
//         }, {
//             type:     smd.Token.Table_Row,
//             children: [
//                 {type: smd.Token.Table_Cell, children: [" a "]},
//                 {type: smd.Token.Table_Cell, children: [" b ", BR, "B "]},
//             ],
//         }],
//     }],
// )

test_single_write("Inline Equation ()",
    "\\(equation\\)",
    [{
        type: smd.Token.Paragraph,
        children: [{
            type: smd.Token.Equation_Inline,
            children: ["equation"],
        }]
    }]
)

test_single_write("Inline Equation () no escape",
    "(equation)",
    [{
        type: smd.Token.Paragraph,
        children: ["(equation)"],
    }]
)

test_single_write("Inline Equation $ prevented by spaces",
    "$ equation $",
    [{
        type    : smd.Token.Paragraph,
        children: ["$ equation $"]
    }]
)

test_single_write("Inline Equation () with spaces",
    "\\( equation \\)",
    [{
        type: smd.Token.Paragraph,
        children: [{
            type: smd.Token.Equation_Inline,
            children: [" equation "],
        }]
    }]
)

test_single_write("Inline Equation $",
    "$equation$",
    [{
        type: smd.Token.Paragraph,
        children: [{
            type: smd.Token.Equation_Inline,
            children: ["equation"],
        }]
    }]
)

test_single_write("Inline Equation $ number",
    "$123$",
    [{
        type: smd.Token.Paragraph,
        children: [{
            type: smd.Token.Equation_Inline,
            children: ["123"],
        }]
    }]
)

test_single_write("Block Equation $$",
    "$$\nequation\n$$",
    [{
        type: smd.Token.Paragraph,
        children: [{
            type: smd.Token.Equation_Block,
            children: ["equation\n"]
        }]
    }]
)

// TODO: escape $$
// test_single_write("Block Equation $$ escape 1",
//     "\\$$\nequation\n$$",
//     [{
//         type: smd.Token.Paragraph,
//         children: ["$", {
//             type: smd.Token.Equation_Inline,
//             children: ["equation\n"]
//         }, "$"]
//     }]
// )

test_single_write("Block Equation []",
    "\\[\nequation\n\\]",
    [{
        type: smd.Token.Paragraph,
        children: [{
            type: smd.Token.Equation_Block,
            children: ["equation\n"],
        }]
    }]
)

test_single_write("Equation_Block [] in Code_Inline",
    "a`\\[b\\]`c",
    [{
        type: smd.Token.Paragraph,
        children: ["a", {
            type: smd.Token.Code_Inline,
            children: ["\\[b\\]"],
        }, "c"],
    }],
)

test_single_write("Equation in text",
    "some text $equation$ more text",
    [{
        type: smd.Token.Paragraph,
        children: [
            "some text ",
            {
                type: smd.Token.Equation_Inline,
                children: ["equation"],
            },
            " more text"
        ]
    }]
)

test_single_write("Equation in text ()",
    "some text \\(equation\\) more text",
    [{
        type: smd.Token.Paragraph,
        children: [
            "some text ",
            {
                type: smd.Token.Equation_Inline,
                children: ["equation"],
            },
            " more text"
        ]
    }]
)

// No closer: the formula was held back, and is given back as text at the end.
test_single_write("Equation in text $ no closing",
    "some text $equation more text",
    [{
        type: smd.Token.Paragraph,
        children: ["some text $equation more text"]
    }]
)

test_single_write("Dollar sign followed by digit is not equation",
    "$123 is not an equation",
    [{
        type: smd.Token.Paragraph,
        children: ["$123 is not an equation"]
    }]
)

test_single_write("Dollar sign followed by comma is not equation",
    "$,000 is not an equation",
    [{
        type: smd.Token.Paragraph,
        children: ["$,000 is not an equation"]
    }]
)

test_single_write("Dollar sign followed by period is not equation",
    "$.99 is not an equation",
    [{
        type: smd.Token.Paragraph,
        children: ["$.99 is not an equation"]
    }]
)

test_single_write("Multiple currency values in text",
    "The items cost $10, $20, and $30 respectively.",
    [{
        type: smd.Token.Paragraph,
        children: ["The items cost $10, $20, and $30 respectively."]
    }]
)

test_single_write("Mixed currency and equation usage",
    "Price: $50 where $x^2$ is the formula",
    [{
        type: smd.Token.Paragraph,
        children: [
            "Price: $50 where ",
            {
                type: smd.Token.Equation_Inline,
                children: ["x^2"]
            },
            " is the formula"
        ]
    }]
)

test_single_write("Currency at end of line",
    "Total cost: $99\nNext line",
    [{
        type: smd.Token.Paragraph,
        children: ["Total cost: $99", BR, "Next line"]
    }]
)

test_single_write("Dollar sign followed by various delimiters",
    "$: a, $; b, $) c, $? d, $] e",
    [{
        type: smd.Token.Paragraph,
        children: ["$: a, $; b, $) c, $? d, $] e"]
    }]
)

test_single_write("Valid equation after text without space",
    "Value$x=y$formula",
    [{
        type: smd.Token.Paragraph,
        children: [
            "Value",
            {
                type: smd.Token.Equation_Inline,
                children: ["x=y"]
            },
            "formula"
        ]
    }]
)

test_single_write("Escaped dollar sign",
    "\\$foo$",
    [{
        type: smd.Token.Paragraph,
        children: ["$foo$"]
    }]
)

/*
 Maths, by Pandoc's rules. A renderer cannot take a token back, so a formula is held
 back — nothing of it is written — until its closer is confirmed: an Equation token,
 once added, is maths, and its end_token says the formula is closed.
 Every case is checked whole, char by char, and on every two-chunk split.
*/

/** @typedef {import("./smd_test_setup.js").Children} Children */
/** @typedef {import("./smd_test_setup.js").Test_Renderer_Node} Test_Renderer_Node */

/** @type {(...children: Children) => Test_Renderer_Node} */
const math_p      = (...children) => ({type: smd.Token.Paragraph, children})
/** @type {(tex: string) => Test_Renderer_Node} */
const math_inline = (tex) => ({type: smd.Token.Equation_Inline, children: [tex]})
/** @type {(tex: string) => Test_Renderer_Node} */
const math_block  = (tex) => ({type: smd.Token.Equation_Block, children: [tex]})
/** @type {(text: string) => Test_Renderer_Node} */
const math_code   = (text) => ({type: smd.Token.Code_Inline, children: [text]})

/**
 * @param   {string             } title
 * @param   {string             } markdown
 * @param   {Children           } expected
 * @param   {smd.Parser_Options=} options
 * @returns {void               } */
function test_math(title, markdown, expected, options) {
    test_single_write(title, markdown, expected, options)
    test_chunked_write(title, markdown, expected, options)
}

/* Display maths on one line ends at its closer */
test_math("Math: $$…$$ on one line",
    "$$x^2$$\n",
    [math_p(math_block("x^2"))])
test_math("Math: $$…$$ on one line swallows nothing after it",
    "$$x^2$$\n\nafter",
    [math_p(math_block("x^2")), math_p("after")])
test_math("Math: $$…$$ on one line, text on the next",
    "$$a$$\nb",
    [math_p(math_block("a"), BR, "b")])
test_math("Math: \\[…\\] on one line",
    "\\[x\\]\n\nafter",
    [math_p(math_block("x")), math_p("after")])
test_math("Math: $$…$$ inside a paragraph is display maths",
    "text $$x$$ text",
    [math_p("text ", math_block("x"), " text")])
test_math("Math: \\[…\\] inside a paragraph is display maths",
    "text \\[x\\] text",
    [math_p("text ", math_block("x"), " text")])
test_math("Math: $$…$$ on one line keeps its TeX",
    "$$\\frac{a}{b} \\\\ c_1 * d*e \\{f\\}$$",
    [math_p(math_block("\\frac{a}{b} \\\\ c_1 * d*e \\{f\\}"))])
test_math("Math: $$ without a closer is text",
    "costs $$ and more",
    [math_p("costs $$ and more")])
test_math("Math: \\[ without a closer is an escaped bracket",
    "\\[x\n\ny",
    [math_p("[x"), math_p("y")])

/* Display maths over lines, written from its opener: either closer closes it, as in 0.3.0,
   and a whitespace-only line ends it, as a blank line ends display maths in Pandoc */
test_math("Math: $$ block over lines",
    "$$\nequation\n$$\n\nafter",
    [math_p(math_block("equation\n")), math_p("after")])
test_math("Math: \\[ block over lines",
    "\\[\nequation\n\\]\n\nafter",
    [math_p(math_block("equation\n")), math_p("after")])
test_math("Math: a $$ block also closes on \\]",
    "$$\na\\]b\n$$",
    [math_p(math_block("a"), "b", BR, "$$")])
test_math("Math: a \\[ block also closes on $$",
    "\\[\na$$b\n\\]",
    [math_p(math_block("a"), "b", BR, "]")])
test_math("Math: a \\[ block closed by $$, then Markdown",
    "\\[\nx^2\n$$\n\nNext paragraph with *emphasis*.\n\n- item",
    [math_p(math_block("x^2\n")), math_p("Next paragraph with ", {
        type    : smd.Token.Italic_Ast,
        children: ["emphasis"],
    }, "."), {
        type    : smd.Token.List_Unordered,
        children: [{type: smd.Token.List_Item, children: ["item"]}],
    }])
test_math("Math: a $$ block closed by \\], then Markdown",
    "$$\nx^2\n\\]\n\nNext paragraph.",
    [math_p(math_block("x^2\n")), math_p("Next paragraph.")])
test_math("Math: a blank line ends an unclosed block",
    "$$\nE = mc^2\n\nThe answer continues.\n\n- item",
    [math_p(math_block("E = mc^2\n")), math_p("The answer continues."), {
        type    : smd.Token.List_Unordered,
        children: [{type: smd.Token.List_Item, children: ["item"]}],
    }])
test_math("Math: a whitespace-only line ends an unclosed block",
    "\\[\nx\n \nafter",
    [math_p(math_block("x\n ")), math_p("after")])
test_math("Math: $ inside a $$ block is TeX",
    "$$\na $x$ b\n$$",
    [math_p(math_block("a $x$ b\n"))])

/* The block is added at the first character of TeX on the line after the opener. A blank
   line or the end comes first: the opener was text (Pandoc writes no maths there) */
test_math("Math: a blank line after $$: the opener was text",
    "$$\n\nx\n$$",
    [math_p("$$"), math_p("x", BR, "$$")])
test_math("Math: a blank line after \\[: the opener was text",
    "\\[\n\nx\n\\]",
    [math_p("["), math_p("x", BR, "]")])
test_math("Math: a whitespace-only line after $$: the opener was text",
    "$$\n \nx\n$$",
    [math_p("$$"), math_p("x", BR, "$$")])
test_math("Math: a blank line after $$ ending a line of text",
    "costs $$\n\nmore",
    [math_p("costs $$"), math_p("more")])
test_math("Math: $$ and a newline at the end",
    "$$\n",
    [math_p("$$")])
test_math("Math: \\[, a newline and spaces at the end",
    "\\[\n  ",
    [math_p("[")])
test_math("Math: $$ and a line of TeX at the end",
    "$$\n-",
    [math_p(math_block("-"))])
test_math("Math: blank lines around the TeX: no empty formula",
    "Solve:\n\n$$\n\n\\int_0^1 f(x)\\,dx\n\n$$\n\nDone.",
    [math_p("Solve:"), math_p("$$"), math_p("\\int_0^1 f(x),dx"), math_p("$$"), math_p("Done.")])
test_steps("Math: a $$ block is added at its first character of TeX", [
    ["$$\n",   [math_p()]],
    ["  ",     [math_p()]],
    ["x",      [math_p(math_block(" "))]],
    ["^2\n",   [math_p(math_block(" x^2"))]],
    ["$$",     [math_p(math_block(" x^2\n"))]],
])

/* Inline maths with $: the opener before a non-space, the closer after a non-space
   and not before a digit */
test_math("Math: $x$",
    "$x$",
    [math_p(math_inline("x"))])
test_math("Math: two formulas",
    "$a+b$ and $c$",
    [math_p(math_inline("a+b"), " and ", math_inline("c"))])
test_math("Math: a formula then a period",
    "$\\frac{1}{2}$.",
    [math_p(math_inline("\\frac{1}{2}"), ".")])
test_math("Math: a formula starting with a digit",
    "$2^{10} = 1024$",
    [math_p(math_inline("2^{10} = 1024"))])
test_math("Math: prices are text",
    "$5 and $10",
    [math_p("$5 and $10")])
test_math("Math: a price then a period",
    "costs $5.",
    [math_p("costs $5.")])
test_math("Math: a space after the opener",
    "$ x$",
    [math_p("$ x$")])
test_math("Math: a space before the closer",
    "$x $",
    [math_p("$x $")])
// The second $ follows a space: not a closer, so the first gives up (Pandoc); the second
// opens a formula of its own that never closes. Everything is text.
test_math("Math: shell variables are text",
    "$HOME and $PATH are set",
    [math_p("$HOME and $PATH are set")])
test_math("Math: a closer followed by a digit",
    "$x$5",
    [math_p("$x$5")])
test_math("Math: a $ after a space gives the formula up, and may open the next",
    "$a $b$",
    [math_p("$a ", math_inline("b"))])
test_math("Math: \\$ is an escape, not a delimiter",
    "\\$x\\$ and \\$5",
    [math_p("$x$ and $5")])
test_math("Math: \\$ inside a formula is TeX, not a closer",
    "$a\\$b$",
    [math_p(math_inline("a\\$b"))])
test_math("Math: TeX arrives intact",
    "$a\\,b \\\\ c*d*e_1 \\{x\\}$",
    [math_p(math_inline("a\\,b \\\\ c*d*e_1 \\{x\\}"))])
test_math("Math: text given back is still markdown",
    "$5 and **bold** _em_",
    [math_p("$5 and ", {
        type    : smd.Token.Strong_Ast,
        children: ["bold"],
    }, " ", {
        type    : smd.Token.Italic_Und,
        children: ["em"],
    })])
test_math("Math: prices in list items",
    "- $5 each\n- $6 each",
    [{
        type    : smd.Token.List_Unordered,
        children: [{
            type    : smd.Token.List_Item,
            children: ["$5 each"],
        }, {
            type    : smd.Token.List_Item,
            children: ["$6 each"],
        }],
    }])
test_math("Math: a formula over one newline",
    "$a\nb$",
    [math_p(math_inline("a\nb"))])

/* \( closes only on \), $ only on $ */
test_math("Math: \\(…\\) keeps its TeX",
    "\\(a_1 * b_2 \\\\ \\{c\\}\\)",
    [math_p(math_inline("a_1 * b_2 \\\\ \\{c\\}"))])
test_math("Math: \\( is not closed by $",
    "\\(a$b\\)",
    [math_p(math_inline("a$b"))])
test_math("Math: $ is not closed by \\)",
    "$a\\)b$",
    [math_p(math_inline("a\\)b"))])
test_math("Math: \\( without a closer is an escaped parenthesis",
    "\\(a and more",
    [math_p("(a and more")])

/* Code is not maths */
test_math("Math: $ in inline code",
    "`$x$` and `$$`",
    [math_p(math_code("$x$"), " and ", math_code("$$"))])
test_math("Math: $$ in a code fence",
    "```\n$$\nx\n$$\n```",
    [{
        type    : smd.Token.Code_Fence,
        children: ["$$\nx\n$$"],
    }])
test_math("Math: inline code after a held $",
    "$5 for `a$b`",
    [math_p("$5 for ", math_code("a$b"))])

/* A blank line ends the paragraph, and a formula left open in it was text */
test_math("Math: a blank line ends a $ formula",
    "$a\n\nb$",
    [math_p("$a"), math_p("b$")])
test_math("Math: a blank line ends a \\( formula",
    "\\(a\n\nb\\)",
    [math_p("(a"), math_p("b)")])
test_math("Math: a blank line ends a $$ formula opened on a line",
    "$$a\n\nb",
    [math_p("$$a"), math_p("b")])
test_math("Math: a $ does not mute the next paragraph",
    "$HOME is set\n\nNext *para*",
    [math_p("$HOME is set"), math_p("Next ", {
        type    : smd.Token.Italic_Ast,
        children: ["para"],
    })])

/* While streaming */
test_steps("Math: a $ formula is written once its closer is confirmed", [
    ["a $x",  [math_p("a ")]],
    ["$",     [math_p("a ")]],                       // $x$5 would not be maths
    [" b\n",  [math_p("a ", math_inline("x"), " b")]],
])
test_steps("Math: a formula closed by the end of the input", [
    ["$x$",   [math_p()]],
    [null,    [math_p(math_inline("x"))]],
])
test_steps("Math: a closer followed by a digit gives the text back", [
    ["$x$",   [math_p()]],
    ["5",     [math_p("$x")]],
    [null,    [math_p("$x$5")]],
])
test_steps("Math: a $ after a space gives the text back at once", [
    ["$HOME and ", [math_p()]],
    ["$",          [math_p("$HOME and ")]],
])
test_steps("Math: a $ formula without a closer is text by the paragraph's end", [
    ["$5 and more", [math_p()]],
    ["\n",          [math_p()]],
    ["\n",          [math_p("$5 and more")]],
    ["next\n",      [math_p("$5 and more"), math_p("next")]],
])
test_steps("Math: a \\( formula is written on its closer", [
    ["\\(x",  [math_p()]],
    ["\\)",   [math_p(math_inline("x"))]],
])
test_steps("Math: a $$ formula on one line is written on its closer", [
    ["$$x^2$", [math_p()]],
    ["$",      [math_p(math_block("x^2"))]],
])

/*
 Maths off — parser(renderer, {math: false}): $ is text, \( and \[ are Markdown escapes,
 no Equation token is written and nothing is held back. On is the default.
*/
const MATH_OFF = {math: false}

test_math("Maths on, explicitly",
    "$x$",
    [math_p(math_inline("x"))],
    {math: true})
test_math("Maths off: $x$ is text",
    "$x$",
    [math_p("$x$")],
    MATH_OFF)
test_math("Maths off: $$x$$ is text",
    "$$x$$",
    [math_p("$$x$$")],
    MATH_OFF)
test_math("Maths off: \\(x\\) is escaped parentheses",
    "\\(x\\)",
    [math_p("(x)")],
    MATH_OFF)
test_math("Maths off: \\[x\\] is escaped brackets",
    "\\[x\\]",
    [math_p("[x]")],
    MATH_OFF)
test_math("Maths off: prices are text",
    "$5 and $10",
    [math_p("$5 and $10")],
    MATH_OFF)
test_math("Maths off: $$ over lines is text",
    "$$\nx\n$$",
    [math_p("$$", BR, "x", BR, "$$")],
    MATH_OFF)
test_math("Maths off: \\[ over lines is an escaped bracket",
    "\\[\nx\n\\]",
    [math_p("[", BR, "x", BR, "]")],
    MATH_OFF)
test_math("Maths off: what would be TeX is Markdown",
    "$a*b*c$",
    [math_p("$a", {
        type    : smd.Token.Italic_Ast,
        children: ["b"],
    }, "c$")],
    MATH_OFF)
test_math("Maths off: every delimiter in a sentence",
    "text $x$ and $$y$$ and \\(z\\) and \\[w\\] end",
    [math_p("text $x$ and $$y$$ and (z) and [w] end")],
    MATH_OFF)

test_steps("Maths off: the text after $5 is written at once", [
    ["costs $5 ",  [math_p("costs $5")]],
    ["and more\n", [math_p("costs $5 and more")]],
    [null,         [math_p("costs $5 and more")]],
], MATH_OFF)
test_steps("Maths on: the text after $5 waits for a closer", [
    ["costs $5 ",  [math_p("costs ")]],
    ["and more\n", [math_p("costs ")]],
    [null,         [math_p("costs $5 and more")]],
])
test_steps("Maths off: \\( is written at once", [
    ["\\(x",  [math_p("(")]],
    ["\\)",   [math_p("(x)")]],
], MATH_OFF)

/*
 A held formula stays inside its block: Pandoc parses blocks first, so a formula never
 crosses a list item, a table row or cell, a heading's line, a rule or a quote. Only a
 paragraph's formula goes on to the next line, and not over a line that opens a block —
 a line read from its first character until that is known (see line_opens in smd.js).
*/
/** @type {(...items: (string | Children)[]) => Test_Renderer_Node} */
const math_list = (...items) => ({type: smd.Token.List_Unordered, children: items.map(
    item => ({type: smd.Token.List_Item, children: typeof item === "string" ? [item] : item}))})
/** @type {(...cells: string[]) => Test_Renderer_Node} */
const math_row  = (...cells) => ({type: smd.Token.Table_Row, children: cells.map(
    cell => ({type: smd.Token.Table_Cell, children: [cell]}))})
/** @type {(...rows: Test_Renderer_Node[]) => Test_Renderer_Node} */
const math_table = (...rows) => ({type: smd.Token.Table, children: rows})

test_math("Math: a formula does not cross list items",
    "- Price: $5\n- Area (m$^2$)",
    [math_list("Price: $5", ["Area (m", math_inline("^2"), ")"])])
test_math("Math: a formula does not cross table rows",
    "| Plan | Price |\n|---|---|\n| Basic | $5 |\n| Pro | 12 € |\n| Team | (y$) |",
    [math_table(
        math_row(" Plan ",  " Price "),
        math_row(" Basic ", " $5 "),
        math_row(" Pro ",   " 12 € "),
        math_row(" Team ",  " (y$) "))])
test_math("Math: a formula does not cross table cells",
    "| $a | b$ |",
    [math_table(math_row(" $a ", " b$ "))])
test_math("Math: a formula does not cross into a list item's next line",
    "- Price $5\n  and more (x$)",
    [math_list(["Price $5", BR, "and more (x$)"])])
test_math("Math: a formula does not cross a heading's line",
    "## Costs $5\nBody line (x$)",
    [{type: smd.Token.Heading_2, children: ["Costs $5"]}, math_p("Body line (x$)")])
test_math("Math: a formula does not cross a rule",
    "Price $5\n---\nnext x$ y",
    [math_p("Price $5"), {type: smd.Token.Rule, children: []}, math_p("next x$ y")])
test_math("Math: a formula does not cross a quote's paragraphs",
    "> costs $5.\n>\n> next x$ y",
    [{type: smd.Token.Blockquote, children: [math_p("costs $5."), math_p("next x$ y")]}])
test_math("Math: a list under a paragraph ends its formula",
    "Plans start at $5:\n- Storage\n- Support (x$)",
    [math_p("Plans start at $5:"), math_list("Storage", "Support (x$)")])
test_math("Math: a display formula goes on over lines that look like blocks",
    "$$\\begin{aligned}\na &= 1 \\\\\n2b &= 3\n\\end{aligned}$$",
    [math_p(math_block("\\begin{aligned}\na &= 1 \\\\\n2b &= 3\n\\end{aligned}"))])

/* An inline formula goes on over a line that only starts like a block: what opens one is
   - + * then a space, 1-6 # then a space, digits with . then a space, a rule, > or | —
   not 2) b, on which smd opens no list */
for (const [markdown, tex] of [
    ["$a\n2) b$",  "a\n2) b"],
    ["$x =\n2y$",  "x =\n2y"],
    ["$a +\n-b$",  "a +\n-b"],
    ["$a\n+b$",    "a\n+b"],
    ["$a\n#b$",    "a\n#b"],
    ["$a\n_b$",    "a\n_b"],
    ["$a\n*b$",    "a\n*b"],
    ["$a\n-\nb$",  "a\n-\nb"],
    ["$a\n--b$",   "a\n--b"],
    ["$a\n2.5b$",  "a\n2.5b"],
    ["$a\n####### b$", "a\n####### b"],
]) {
    test_math("Math: a formula goes on over a line that opens no block: " + JSON.stringify(markdown),
        markdown,
        [math_p(math_inline(tex))])
}
test_math("Math: a list item's line ends a formula",
    "$a\n- b$",
    [math_p("$a"), math_list("b$")])
test_math("Math: an ordered list item's line ends a formula",
    "$a\n1. b$",
    [math_p("$a"), {type: smd.Token.List_Ordered, children: [{type: smd.Token.List_Item, children: ["b$"]}]}])
test_math("Math: a heading's line ends a formula",
    "$a\n# b$",
    [math_p("$a"), {type: smd.Token.Heading_1, children: ["b$"]}])
test_math("Math: a quote's line ends a formula",
    "$a\n> b$",
    [math_p("$a"), {type: smd.Token.Blockquote, children: [math_p("b$")]}])
test_math("Math: a table row's line ends a formula",
    "$a\n|b$",
    [math_p("$a"), math_table(math_row("b$"))])
test_steps("Math: a line's start is held until it is known", [
    ["Costs $5\n", [math_p("Costs ")]],
    ["-",          [math_p("Costs ")]],
    [" Storage\n", [math_p("Costs $5"), math_list("Storage")]],
])

/* A display formula opened inside a paragraph, with text after its opener, stops at a list
   item (2) b included), a heading, a rule, a quote, a code fence, an HTML block and a `#`
   alone on its line: it is given back as text, as an unclosed one is. A | line is TeX: |x| */
test_math("Math: a list ends a display formula opened in a paragraph",
    "Since $$a = b\n- one\n- two\nand $$c$$ holds.",
    [math_p("Since $$a = b"), math_list("one", ["two", BR, "and ", math_block("c"), " holds."])])
test_math("Math: a list ends a \\[ formula opened in a paragraph",
    "The range \\[0, 1) is half-open:\n- 0 is in\n- 1 is out",
    [math_p("The range [0, 1) is half-open:"), math_list("0 is in", "1 is out")])
test_math("Math: an ordered list ends a display formula",
    "Since $$a\n1. b",
    [math_p("Since $$a"), {type: smd.Token.List_Ordered, children: [{type: smd.Token.List_Item, children: ["b"]}]}])
test_math("Math: a 2) list item ends a display formula",
    "Since $$a\n2) b$$",
    [math_p("Since $$a", BR, "2) b$$")])
test_math("Math: a heading ends a display formula",
    "We get \\[x = 1\n## Next section\nThe value \\] is set",
    [math_p("We get [x = 1"), {type: smd.Token.Heading_2, children: ["Next section"]},
        math_p("The value ] is set")])
test_math("Math: a # alone on its line ends a display formula",
    "Since $$a\n#\nb$$",
    [math_p("Since $$a", BR, "#", BR, "b$$")])
test_math("Math: a | line is TeX in a display formula",
    "Since $$a\n|x| = 1$$",
    [math_p("Since ", math_block("a\n|x| = 1"))])
test_math("Math: a rule ends a display formula",
    "Formula $$a\n---\nb$$ end",
    [math_p("Formula $$a"), {type: smd.Token.Rule, children: []}, math_p("b$$ end")])
test_math("Math: a spaced rule ends a display formula",
    "Formula $$a\n* * *\nb",
    [math_p("Formula $$a"), {type: smd.Token.Rule, children: []}, math_p("b")])
test_math("Math: a quote ends a display formula",
    "Since $$a\n> q",
    [math_p("Since $$a"), {type: smd.Token.Blockquote, children: [math_p("q")]}])
test_math("Math: a code fence ends a display formula",
    "Since $$a\n```\ncode\n```",
    [math_p("Since $$a"), {type: smd.Token.Code_Fence, children: ["code"]}])
// smd has no ~~~ fence nor HTML block: the line is Markdown text, but the formula stops there
test_math("Math: a ~~~ fence ends a display formula",
    "Since $$a\n~~~\ncode",
    [math_p("Since $$a", BR, {type: smd.Token.Strike, children: ["~", BR, "code"]})])
test_math("Math: an HTML block ends a display formula",
    "Since $$a\n<div>x</div>",
    [math_p("Since $$a", BR, "<div>x</div>")])
test_math("Math: a block tag alone on its line ends a display formula",
    "$$ x\n<div>\ny$$",
    [math_p("$$ x", BR, "<div>", BR, "y$$")])
test_math("Math: </, <! and <? end a display formula",
    "Since $$a\n</p>\n$$b\n<!-- c\n$$d\n<?e",
    [math_p("Since $$a", BR, "</p>", BR, "$$b", BR, "<!-- c", BR, "$$d", BR, "<?e")])
test_math("Math: a tag that cannot interrupt a paragraph is TeX",
    "Since $$a\n<x, y> = 0\n<pa\n<span>$$",
    [math_p("Since ", math_block("a\n<x, y> = 0\n<pa\n<span>"))])
test_math("Math: a display formula goes on over TeX lines that start like blocks",
    "Since $$a\n2b\n-x\n#1\n< y\n+z\n--\n~x$$",
    [math_p("Since ", math_block("a\n2b\n-x\n#1\n< y\n+z\n--\n~x"))])
test_steps("Math: a list after a display opener streams item by item", [
    ["Since $$a = b\n", [math_p("Since ")]],
    ["- one\n",         [math_p("Since $$a = b"), math_list("one")]],
    ["- two\n",         [math_p("Since $$a = b"), math_list("one", "two")]],
])

/* When $$ or \[ ends its line, its lines are TeX, a list item's and a | line's included; a
   fence, a heading, a quote, HTML or a rule still ends it, and what follows is Markdown */
test_math("Math: absolute values at a line's start are TeX",
    "$$\n|a+b| \\le |a|+|b|\n$$",
    [math_p(math_block("|a+b| \\le |a|+|b|\n"))])
test_math("Math: a $$ block goes on over list items",
    "$$\na\n- b\n2. c\n$$",
    [math_p(math_block("a\n- b\n2. c\n"))])
test_math("Math: a $$ followed by spaces only goes on over list items",
    "$$ \na\n- b\n$$",
    [math_p(math_block(" \na\n- b\n"))])
test_math("Math: a $$ block goes on over TeX lines that start like blocks",
    "$$\nx\n-y\n#1\n--\n~x\n``x\n< y\n$$",
    [math_p(math_block("x\n-y\n#1\n--\n~x\n``x\n< y\n"))])
test_math("Math: a heading ends a $$ block",
    "$$\nE = mc^2\n# Heading\n",
    [math_p(math_block("E = mc^2\n")), {type: smd.Token.Heading_1, children: ["Heading"]}])
test_math("Math: a rule ends a $$ block",
    "$$\nx\n---\ny",
    [math_p(math_block("x\n")), {type: smd.Token.Rule, children: []}, math_p("y")])
test_math("Math: a code fence ends a \\[ block",
    "\\[\nx\n```\ncode\n```",
    [math_p(math_block("x\n")), {type: smd.Token.Code_Fence, children: ["code"]}])
test_math("Math: an inner product is TeX in a $$ block",
    "$$\n<x, y> = 0\n$$",
    [math_p(math_block("<x, y> = 0\n"))])
test_math("Math: a block tag ends a $$ block",
    "$$\nx\n<DIV class=\"a\">\ny",
    [math_p(math_block("x\n"), BR, "<DIV class=\"a\">", BR, "y")])
test_math("Math: a heading on the line after $$: the opener was text",
    "$$\n# h\n",
    [math_p("$$"), {type: smd.Token.Heading_1, children: ["h"]}])
test_math("Math: a quote on the line after $$: the opener was text",
    "$$\n> x\n$$",
    [math_p("$$"), {type: smd.Token.Blockquote, children: [math_p("x", BR, "$$")]}])

/* In a quote, the > starting a line is the quote's, not a block: the formula goes on */
/** @type {(...children: Children) => Test_Renderer_Node} */
const math_quote = (...children) => ({type: smd.Token.Blockquote, children})
test_math("Math: a $$ block in a quote",
    "> $$\n> x\n> $$",
    [math_quote(math_p(math_block(" x\n ")))])
test_math("Math: a $$ block in a quote, then a blank quote line",
    "> $$\n> x\n>\n> after",
    [math_quote(math_p(math_block(" x\n")), math_p("after"))])
test_math("Math: a $$ block in a quote, with a lazy line",
    "> $$\nx\n> $$",
    [math_quote(math_p(math_block("x\n ")))])
test_math("Math: a $$ block in a quote ends at a heading",
    "> $$\n> x\n> # h",
    [math_quote(math_p(math_block(" x\n ")), {type: smd.Token.Heading_1, children: ["h"]})])
test_math("Math: a nested quote ends a $$ block in a quote",
    "> $$\n> > x",
    [math_quote(math_p("$$"), math_quote(math_p("x")))])
test_math("Math: a $$ block in a list in a quote",
    "> - $$\n>   x\n>   $$",
    [math_quote(math_list([math_block(" x\n ")]))])

/* Text given back is parsed again, so a later formula in the paragraph is still maths
   (Pandoc retries at the next opener) */
test_math("Math: a price, then \\(…\\) formulas",
    "If each item costs $5 and you buy \\(n\\) items, the total is \\(5n\\) dollars.",
    [math_p("If each item costs $5 and you buy ", math_inline("n"),
        " items, the total is ", math_inline("5n"), " dollars.")])
test_math("Math: a price, an unclosed \\(, then a $ formula",
    "$5 for \\(n items, total $5n$",
    [math_p("$5 for (n items, total ", math_inline("5n"))])

/* While streaming: a price holds back one line, or one cell, not what follows it */
test_steps("Math: a list after a price streams item by item", [
    ["Plans start at $5 and include:\n", [math_p("Plans start at ")]],
    ["- Storage\n",                      [math_p("Plans start at $5 and include:"), math_list("Storage")]],
    ["- Support\n",                      [math_p("Plans start at $5 and include:"), math_list("Storage", "Support")]],
])
test_steps("Math: a table after a price streams row by row", [
    ["| Plan | Price |\n|---|---|\n", [math_table(math_row(" Plan ", " Price "))]],
    ["| Basic | $5 |\n",              [math_table(math_row(" Plan ", " Price "), math_row(" Basic ", " $5 "))]],
    ["| Pro | 12 € |\n",              [math_table(math_row(" Plan ", " Price "), math_row(" Basic ", " $5 "),
                                                 math_row(" Pro ", " 12 € "))]],
])

/* No formula is that long: held past 1024 characters (4096 for display), it was text */
test_math("Math: a formula of 1000 characters",
    "$" + "x".repeat(1000) + "$",
    [math_p(math_inline("x".repeat(1000)))])
test_math("Math: a formula past 1024 characters is text",
    "$" + "x".repeat(1100) + "$",
    [math_p("$" + "x".repeat(1100) + "$")])
// Whole and char by char only: every two-chunk split of 4 KB is 4000 parses of 4 KB.
test_single_write("Math: a display formula of 4000 characters",
    "$$" + "x".repeat(4000) + "$$",
    [math_p(math_block("x".repeat(4000)))])
test_single_write("Math: a display formula past 4096 characters is text",
    "$$" + "x".repeat(4200) + "$$",
    [math_p("$$" + "x".repeat(4200) + "$$")])
test_steps("Math: a price in a long paragraph shows as text past the limit", [
    ["costs $5 " + "word ".repeat(250), [math_p(("costs $5 " + "word ".repeat(250)).trimEnd())]],
])

/* The work stays linear: text given back a second time holds no \( \[ $$ formula */
test_math("Math: unclosed \\( and $ in turn",
    "\\( $a ".repeat(200),
    [math_p("( $a ".repeat(200))])
test_time("Math: unclosed \\( and $ in turn, 48 KB",
    "\\( $a ".repeat(8000), 1000)
test_time("Math: unclosed \\( and \\[ in turn, 94 KB",
    "\\( \\[ ".repeat(16000), 500)
test_time("Math: a price over 32000 lines, 625 KB",
    "Costs $5 per unit\n" + "word word word word\n".repeat(32000), 2000)

/* The end of the input closes or gives back what is held, and nothing of it is written
   into a formula. $$ or \[ with nothing after it is text. */
for (const [mode, options] of /** @type {const} */ ([["on", undefined], ["off", MATH_OFF]])) {
    test_math("Maths "+mode+": the end after a backslash in a held formula",
        "x $5 ![img \\",
        [math_p("x $5 ", {type: smd.Token.Image, children: ["img \\"]})],
        options)
    test_math("Maths "+mode+": the end after a backslash after $$",
        "$$1![\\",
        [math_p("$$1", {type: smd.Token.Image, children: ["\\"]})],
        options)
    test_math("Maths "+mode+": $$ at the end",
        "costs $$",
        [math_p("costs $$")],
        options)
    test_math("Maths "+mode+": \\[ at the end",
        "costs \\[",
        [math_p("costs [")],
        options)

    /* No autolink right after a $ (GFM), maths or not */
    test_math("Maths "+mode+": no autolink after $$",
        "$$http://ex.com x",
        [math_p("$$http://ex.com x")],
        options)
    test_math("Maths "+mode+": no autolink after US$",
        "US$http://ex.com x",
        [math_p("US$http://ex.com x")],
        options)
    test_math("Maths "+mode+": no autolink after \\$",
        "\\$http://ex.com x",
        [math_p("$http://ex.com x")],
        options)
    test_math("Maths "+mode+": an autolink on the line after a $",
        "x$\nhttp://ex.com",
        [math_p("x$", BR, {
            type    : smd.Token.Raw_URL,
            attrs   : {[smd.Attr.Href]: "http://ex.com"},
            children: ["http://ex.com"],
        })],
        options)
    test_math("Maths "+mode+": an autolink after a $ and a <br>",
        "x$<br>http://ex.com",
        [math_p("x$", BR, {
            type    : smd.Token.Raw_URL,
            attrs   : {[smd.Attr.Href]: "http://ex.com"},
            children: ["http://ex.com"],
        })],
        options)
    /* A line break ends the $ before it, not the word: as in 0.3.0, the underscore is
       inside the word and opens nothing */
    test_math("Maths "+mode+": an underscore after a line break inside a word",
        "snake\n_case_name and snake<br>_case_name",
        [math_p("snake", BR, "_case_name and snake", BR, "_case_name")],
        options)
    test_math("Maths "+mode+": an autolink after $ and a space",
        "$ http://ex.com x",
        [math_p("$ ", {
            type    : smd.Token.Raw_URL,
            attrs   : {[smd.Attr.Href]: "http://ex.com"},
            children: ["http://ex.com"],
        }, " x")],
        options)
}
