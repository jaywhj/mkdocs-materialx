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

import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  from,
  of,
  switchMap,
  tap
} from "rxjs"

import {
  SearchHighlighter,
  SearchProvider,
  SearchResponse
} from "../_"

/**
 * Provider-neutral search controller
 */
export class SearchController {

  /* Provider setup promise */
  private ready?: Promise<void>

  /**
   * Create a search controller
   *
   * @param provider - Search provider
   */
  public constructor(private readonly provider: SearchProvider) {}

  /* Optional result-page highlighter */
  public get highlighter(): SearchHighlighter | undefined {
    return this.provider.highlighter
  }

  /* Set up the provider once */
  public setup(): Promise<void> {
    if (!this.ready)
      this.ready = this.provider.setup()
    return this.ready
  }

  /**
   * Turn query values into latest-only search results
   *
   * @param query$ - Search query observable
   *
   * @returns Search response observable
   */
  public watch(query$: Observable<string>): Observable<SearchResponse> {
    return query$
      .pipe(
        tap(query => void this.provider.preloader
          ?.preload(query)
          .catch(() => undefined)
        ),
        debounceTime(50),
        distinctUntilChanged(),
        switchMap(query => from(this.search(query)).pipe(
          catchError(() => of({ total: 0, results: [] }))
        ))
      )
  }

  /* Search after the provider is ready */
  private async search(query: string): Promise<SearchResponse> {
    if (!query)
      return { total: 0, results: [] }
    await this.setup()
    return this.provider.search({ query })
  }
}
