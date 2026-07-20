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

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

/**
 * Search snippet
 */
export interface SearchSnippet {
  html: string                         /* Safe highlighted HTML */
}

/**
 * Search result page
 */
export interface SearchPage {
  url: string                         /* Result URL */
  title: SearchSnippet                /* Result title */
  score?: number                      /* Optional provider relevance score */
}

/**
 * Search match inside a page
 */
export interface SearchMatch {
  url: string                         /* Match URL */
  title: SearchSnippet                /* Match title */
  score?: number                      /* Optional provider relevance score */
  excerpt?: SearchSnippet             /* Match excerpt */
  tags?: string[]                     /* Match tags */
  metadata?: Record<string, string | string[]>
  matchedTerms?: string[]             /* Terms matched by the provider */
  missingTerms?: string[]             /* Terms not present in the match */
}

/**
 * Search result group
 */
export interface SearchResultGroup {
  page: SearchPage                    /* Parent page */
  matches: SearchMatch[]              /* Matching content inside the page */
}

/**
 * Lazily loaded search result
 */
export interface SearchResultReference {
  id: string                          /* Stable provider reference */
  load(): Promise<SearchResultGroup>  /* Load result details */
}

/**
 * Search request
 */
export interface SearchRequest {
  query: string                       /* User query */
}

/**
 * Search response
 */
export interface SearchResponse {
  total: number                       /* Number of result groups */
  results: SearchResultReference[]    /* Ordered result references */
  suggest?: string[]                  /* Optional query suggestions */
}

/**
 * Optional search preloader capability
 */
export interface SearchPreloader {
  preload(query: string): Promise<void>
}

/**
 * Optional result-page highlighter capability
 */
export interface SearchHighlighter {
  highlight(
    el: HTMLElement, query: string
  ): Promise<void>
}

/**
 * Search provider
 */
export interface SearchProvider {
  setup(): Promise<void>
  search(request: SearchRequest): Promise<SearchResponse>
  readonly preloader?: SearchPreloader
  readonly highlighter?: SearchHighlighter
}
