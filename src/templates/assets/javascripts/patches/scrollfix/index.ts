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
  Observable,
  fromEvent,
  merge,
  switchMap
} from "rxjs"

import { getElements } from "~/browser"

/* ----------------------------------------------------------------------------
 * Helper types
 * ------------------------------------------------------------------------- */

/**
 * Patch options
 */
interface PatchOptions {
  document$: Observable<Document>      /* Document observable */
}

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Patch to prevent scroll leaking (scroll penetration)
 *
 * This patch ensures that touch-based scrolling within drawer containers (like
 * navigation and search) doesn't leak to the body when reaching the boundaries.
 * It also handles locking the background when an overlay is active.
 *
 * It uses a combination of `overscroll-behavior` (via CSS) and JS event
 * interception for maximum compatibility and robustness.
 *
 * @param options - Options
 */
export function patchScrollfix(
  { document$ }: PatchOptions
): void {
  document$
    .pipe(
      switchMap(() => merge(
        getElements(".md-sidebar--primary"),
        getElements(".md-sidebar--secondary"),
        getElements(".md-search"),
        getElements(".md-overlay")
      ))
    )
    .subscribe(el => {
      let startY = 0
      let scrollable: HTMLElement | null = null
      let isOverlay = false

      /* touchstart: intercept touch start to record position and prepare context */
      fromEvent<TouchEvent>(el, "touchstart", { passive: true })
        .subscribe(ev => {
          startY = ev.touches[0].pageY

          /* Cache context to optimize touchmove */
          isOverlay = el.classList.contains("md-overlay")
          if (!isOverlay) {
            scrollable = el.querySelector<HTMLElement>(
              ".md-sidebar__scrollwrap, .md-search__scrollwrap"
            )
          }
        })

      /* touchmove: intercept touch move to prevent leaking */
      fromEvent<TouchEvent>(el, "touchmove", { passive: false })
        .subscribe(ev => {
          /* Case 1: The element is an overlay (background) */
          if (isOverlay) {
            if (ev.cancelable)
              ev.preventDefault()
            return
          }

          /* Case 2: The element is a drawer (sidebar or search) */
          /* If no scrollable container found, block all movement */
          if (!scrollable) {
            if (ev.cancelable)
              ev.preventDefault()
            return
          }

          const height = scrollable.offsetHeight
          const total = scrollable.scrollHeight

          /* If the content is not scrollable, prevent all movement */
          if (total <= height) {
            if (ev.cancelable)
              ev.preventDefault()
            return
          }

          const top = scrollable.scrollTop
          const y = ev.touches[0].pageY
          const delta = startY - y

          /* Prevent leaking when at the top and pulling down */
          if (top <= 0 && delta < 0) {
            if (ev.cancelable)
              ev.preventDefault()

          /* Prevent leaking when at the bottom and pulling up */
          } else if (top + height >= total && delta > 0) {
            if (ev.cancelable)
              ev.preventDefault()
          }

          /* Otherwise, allow normal scrolling within the scrollable area */
        })
    })
}
