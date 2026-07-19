/*
 * Copyright (c) 2016-2025 Martin Donath <martin.donath@squidfunk.com>
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
  EMPTY,
  Observable,
  Subject,
  bufferCount,
  filter,
  finalize,
  from,
  fromEvent,
  map,
  merge,
  mergeMap,
  of,
  share,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
  zipWith
} from "rxjs"

import { translation } from "~/_"
import {
  getElement,
  getOptionalElement,
  watchElementBoundary,
  watchToggle
} from "~/browser"
import { SearchController, SearchResponse } from "~/integrations"
import { renderSearchResultItem } from "~/templates"
import { round } from "~/utilities"

import { Component } from "../../_"
import { SearchQuery } from "../query"

/* ----------------------------------------------------------------------------
 * Helper types
 * ------------------------------------------------------------------------- */

/**
 * Mount options
 */
interface MountOptions {
  query$: Observable<SearchQuery>      /* Search query observable */
  search: SearchController             /* Search controller */
}

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Mount search result list
 *
 * This function performs a lazy rendering of the search results, depending on
 * the vertical offset of the search result container.
 *
 * @param el - Search result list element
 * @param options - Options
 *
 * @returns Search result list component observable
 */
export function mountSearchResult(
  el: HTMLElement, { search, query$ }: MountOptions
): Observable<Component<SearchResponse>> {
  const push$ = new Subject<SearchResponse>()
  const boundary$ = watchElementBoundary(el.parentElement!)
    .pipe(
      filter(Boolean)
    )

  /* Retrieve container */
  const container = el.parentElement!

  /* Retrieve nested components */
  const meta = getElement(":scope > :first-child", el)
  const list = getElement(":scope > :last-child", el)

  /* Reveal to accessibility tree – see https://bit.ly/3iAA7t8 */
  watchToggle("search")
    .subscribe(active => {
      list.setAttribute("role", active ? "list" : "presentation")
      list.hidden = !active
    })

  /* Update search result metadata */
  push$
    .pipe(
      withLatestFrom(query$)
    )
      .subscribe(([{ total }, { value }]) => {
        switch (total) {

          /* No results */
          case 0:
            meta.textContent = value.length
              ? translation("search.result.none")
              : translation("search.result.placeholder")
            break

          /* One result */
          case 1:
            meta.textContent = translation("search.result.one")
            break

          /* Multiple result */
          default:
            const count = round(total)
            meta.textContent = translation("search.result.other", count)
        }
      })

  /* Render search result item */
  const render$ = push$
    .pipe(
      tap(() => list.innerHTML = ""),
      switchMap(({ results }) => merge(
        of(...results.slice(0, 10)),
        of(...results.slice(10))
          .pipe(
            bufferCount(4),
            zipWith(boundary$),
            switchMap(([chunk]) => chunk)
          )
      )),
      mergeMap(result => from(result.load())),
      map(renderSearchResultItem),
      share()
    )

  /* Update search result list */
  render$.subscribe(item => list.appendChild(item))
  render$
    .pipe(
      mergeMap(item => {
        const details = getOptionalElement("details", item)
        if (typeof details === "undefined")
          return EMPTY

        /* Keep position of details element stable */
        return fromEvent(details, "toggle")
          .pipe(
            takeUntil(push$),
            map(() => details)
          )
      })
    )
      .subscribe(details => {
        if (
          details.open === false &&
          details.offsetTop <= container.scrollTop
        )
          container.scrollTo({ top: details.offsetTop })
      })

  /* Search through the provider-neutral controller */
  const result$ = search.watch(query$.pipe(
    map(({ value }) => value)
  ))

  /* Create and return component */
  return result$
    .pipe(
      tap(state => push$.next(state)),
      finalize(() => push$.complete()),
      map(state => ({ ref: el, ...state })),
      share()
    )
}
