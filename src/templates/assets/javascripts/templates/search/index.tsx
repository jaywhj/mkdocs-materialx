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

import escapeHTML from "escape-html"
import { ComponentChild } from "preact"

import { configuration, feature, translation } from "~/_"
import {
  SearchMatch,
  SearchPage,
  SearchResultGroup
} from "~/integrations/search"
import { h } from "~/utilities"

/* ----------------------------------------------------------------------------
 * Helper types
 * ------------------------------------------------------------------------- */

/**
 * Render flag
 */
const enum Flag {
  TEASER = 1,                          /* Render teaser */
  PARENT = 2                           /* Render as parent */
}

/* ----------------------------------------------------------------------------
 * Helper function
 * ------------------------------------------------------------------------- */

/**
 * Render a search document
 *
 * @param document - Search document
 * @param flag - Render flags
 *
 * @returns Element
 */
function renderSearchDocument(
  document: SearchPage | SearchMatch, flag: Flag
): HTMLElement {
  const parent = flag & Flag.PARENT
  const teaser = flag & Flag.TEASER

  /* Render missing query terms */
  const missing = ("missingTerms" in document
    ? document.missingTerms || []
    : []
  ).reduce<ComponentChild[]>((list, key) => [
      ...list, <del>{escapeHTML(key)}</del>, " "
    ], [])
    .slice(0, -1)

  /* Assemble query string for highlighting */
  const config = configuration()
  const url = new URL(document.url, config.base)
  if (
    feature("search.highlight") &&
    "matchedTerms" in document &&
    document.matchedTerms?.length
  )
    url.searchParams.set("h", document.matchedTerms.join(" "))

  /* Render article or section, depending on flags */
  const { tags } = configuration()
  return (
    <a href={`${url}`} class="md-search-result__link" tabIndex={-1}>
      <article
        class="md-search-result__article md-typeset"
        data-md-score={document.score?.toFixed(2)}
      >
        {parent > 0 && <div class="md-search-result__icon md-icon"></div>}
        {parent > 0 && <h1>{document.title.html}</h1>}
        {parent <= 0 && <h2>{document.title.html}</h2>}
        {teaser > 0 && "excerpt" in document && document.excerpt &&
          document.excerpt.html
        }
        {"tags" in document && document.tags && (
          <nav class="md-tags">
            {document.tags.map(tag => {
              const type = tags && tag in tags
                ? `md-tag-icon md-tag--${tags[tag]}`
                : "md-tag-icon"
              return (
                <span class={`md-tag ${type}`}>{escapeHTML(tag)}</span>
              )
            })}
          </nav>
        )}
        {teaser > 0 && missing.length > 0 &&
          <p class="md-search-result__terms">
            {translation("search.result.term.missing")}: {...missing}
          </p>
        }
      </article>
    </a>
  )
}

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Render a search result
 *
 * @param result - Search result
 *
 * @returns Element
 */
export function renderSearchResultItem(
  result: SearchResultGroup
): HTMLElement {
  const threshold = result.matches[0]?.score
  let index = 3

  /* Preserve provider scoring tiers, or use the generic default */
  if (typeof threshold !== "undefined") {
    index = result.matches.findIndex(match => (
      typeof match.score === "undefined" || match.score < threshold
    ))
    if (index === -1)
      index = result.matches.length
  }

  /* Partition matches */
  const best = result.matches.slice(0, index)
  const more = result.matches.slice(index)

  /* Render children */
  const children = [
    renderSearchDocument(
      result.page,
      Flag.PARENT
    ),
    ...best.map(section => renderSearchDocument(section, Flag.TEASER)),
    ...more.length ? [
      <details class="md-search-result__more">
        <summary tabIndex={-1}>
          <div>
            {more.length > 0 && more.length === 1
              ? translation("search.result.more.one")
              : translation("search.result.more.other", more.length)
            }
          </div>
        </summary>
        {...more.map(section => renderSearchDocument(section, Flag.TEASER))}
      </details>
    ] : []
  ]

  /* Render search result */
  return (
    <li class="md-search-result__item">
      {children}
    </li>
  )
}
