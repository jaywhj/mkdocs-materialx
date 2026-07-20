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

import escapeHTML from "escape-html"

import {
  SearchMatch,
  SearchPage,
  SearchPreloader,
  SearchProvider,
  SearchRequest,
  SearchResponse,
  SearchResultGroup,
  SearchSnippet
} from "../../_"

import { PagefindProviderOptions } from "./config"
import { PagefindSearchHighlighter } from "./highlighter"

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

interface PagefindSubResult {
  title?: string
  url: string
  excerpt: string
}

interface PagefindResultData extends PagefindSubResult {
  meta: Record<string, string>
  sub_results: PagefindSubResult[]
}

interface PagefindSearchResult {
  id: string
  data(): Promise<PagefindResultData>
}

interface PagefindModule {
  init(): Promise<void>
  options(options: Record<string, unknown>): Promise<void>
  preload(query: string): Promise<void>
  search(query: string): Promise<{
    results: PagefindSearchResult[]
  }>
}

/* ----------------------------------------------------------------------------
 * Helper functions
 * ------------------------------------------------------------------------- */

/* Create a safe search snippet from raw Pagefind metadata */
function text(value: string): SearchSnippet {
  return { html: escapeHTML(value) }
}

/* Create a snippet from Pagefind's safely encoded excerpt */
function excerpt(html: string): SearchSnippet {
  return { html }
}

/* Convert a Pagefind sub-result into a provider-neutral match */
function match(result: PagefindSubResult): SearchMatch {
  return {
    url: result.url,
    title: text(result.title || "/"),
    ...result.excerpt.length && {
      excerpt: excerpt(result.excerpt)
    }
  }
}

/* Return a file inside the configured Pagefind bundle */
function bundle(options: PagefindProviderOptions, file: string): string {
  return `${new URL(file, options.bundleUrl)}`
}

/**
 * Pagefind search provider
 */
export class PagefindSearchProvider implements SearchProvider {

  /* Optional provider capabilities */
  public readonly preloader: SearchPreloader

  public readonly highlighter?: PagefindSearchHighlighter

  /* Pagefind module and setup promise */
  private module?: PagefindModule

  private ready?: Promise<void>

  private readonly options: PagefindProviderOptions

  /**
   * Create the Pagefind search provider
   *
   * @param options - Pagefind provider options
   */
  public constructor(options: PagefindProviderOptions) {
    this.options = {
      ...options,
      baseUrl: `${new URL(options.baseUrl, location.href)}`,
      bundleUrl: `${new URL(options.bundleUrl, location.href)}`
    }
    this.preloader = {
      preload: query => this.preload(query)
    }
    if (this.options.highlight)
      this.highlighter = new PagefindSearchHighlighter(this.options)
  }

  /* Load and initialize Pagefind once */
  public setup(): Promise<void> {
    if (!this.ready)
      this.ready = this.initialize()
    return this.ready
  }

  /* Search Pagefind */
  public async search({ query }: SearchRequest): Promise<SearchResponse> {
    if (!query)
      return { total: 0, results: [] }

    await this.setup()
    const { results } = await this.module!.search(query)
    return {
      total: results.length,
      results: results.map(result => ({
        id: result.id,
        load: async () => this.result(result)
      }))
    }
  }

  /* Preload Pagefind index chunks for a pending query */
  private async preload(query: string): Promise<void> {
    if (!query)
      return
    await this.setup()
    await this.module!.preload(query)
  }

  /* Set up the Pagefind module */
  private async initialize(): Promise<void> {
    const module = await import(
      /* webpackIgnore: true */ bundle(this.options, "pagefind.js")
    ) as PagefindModule
    await module.options({
      ...this.options.searchOptions,
      baseUrl: new URL(this.options.baseUrl).pathname,
      ...this.options.highlight && { highlightParam: "h" }
    })
    await module.init()
    this.module = module
  }

  /* Load and normalize a Pagefind result */
  private async result(result: PagefindSearchResult): Promise<SearchResultGroup> {
    const data = await result.data()
    const page: SearchPage = {
      url: data.url,
      title: text(data.meta.title || data.title || "/")
    }
    return {
      page,
      matches: data.sub_results.map(match)
    }
  }
}

export * from "./config"
