/*
 * Copyright (c) 2016-2026 Aaron Wang <aaronwqt@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import { h } from "~/utilities"

import { setupSearchHighlighter } from "./index"

import { SearchHighlighter } from "../../../_"
import { LunrIndex } from "../config"

/**
 * Lunr result-page highlighter
 */
export class LunrSearchHighlighter implements SearchHighlighter {

  /**
   * Create the Lunr highlighter
   *
   * @param index - Index loader
   */
  public constructor(
    private readonly index: () => Promise<LunrIndex>
  ) {}

  /* Highlight matching terms in page content */
  public async highlight(
    el: HTMLElement, query: string
  ): Promise<void> {
    const index = await this.index()
    const replace = setupSearchHighlighter(index.config)(query)
    const nodes = new Map<ChildNode, string>()

    /* Traverse text nodes and collect matches */
    const it = document.createNodeIterator(el, NodeFilter.SHOW_TEXT)
    for (let node = it.nextNode(); node; node = it.nextNode()) {
      if (node.parentElement?.offsetHeight) {
        const original = node.textContent!
        const replaced = replace(original)
        if (replaced.length > original.length)
          nodes.set(node as ChildNode, replaced)
      }
    }

    /* Replace original nodes with matches */
    for (const [node, text] of nodes) {
      const { childNodes } = h("span", {}, text)
      node.replaceWith(...Array.from(childNodes))
    }
  }
}
