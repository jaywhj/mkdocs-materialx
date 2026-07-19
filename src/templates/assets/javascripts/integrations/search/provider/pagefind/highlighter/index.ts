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

import { SearchHighlighter } from "../../../_"
import { PagefindProviderOptions } from "../config"

interface PagefindHighlightModule {
  PagefindHighlight?: new (options: Record<string, unknown>) => unknown
}

/**
 * Pagefind result-page highlighter
 */
export class PagefindSearchHighlighter implements SearchHighlighter {

  /**
   * Create the Pagefind highlighter
   *
   * @param options - Pagefind provider options
   */
  public constructor(
    private readonly options: PagefindProviderOptions
  ) {}

  /* Load and run Pagefind's result-page highlighter */
  public async highlight(
    el: HTMLElement, _query: string
  ): Promise<void> {
    const url = new URL("pagefind-highlight.js", this.options.bundleUrl)
    const module = await import(
      /* webpackIgnore: true */ `${url}`
    ) as PagefindHighlightModule
    const Highlight = module.PagefindHighlight || (
      globalThis as typeof globalThis & PagefindHighlightModule
    ).PagefindHighlight
    if (typeof Highlight === "undefined")
      throw new TypeError("Unable to load Pagefind highlighter")

    new Highlight({
      highlightParam: "h",
      markContext: el,
      addStyles: false
    })
  }
}
