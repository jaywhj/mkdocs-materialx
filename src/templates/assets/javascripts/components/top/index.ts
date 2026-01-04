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
  Subject,
  bufferCount,
  combineLatest,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  endWith,
  finalize,
  fromEvent,
  ignoreElements,
  map,
  repeat,
  scan,
  filter,
  merge,
  withLatestFrom,
  skip,
  takeUntil,
  tap
} from "rxjs"

import { Viewport } from "~/browser"

import { Component } from "../_"
import { Header } from "../header"
import { Main } from "../main"

/* ----------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------- */

/**
 * Back-to-top button
 */
export interface BackToTop {
  hidden: boolean                      /* Back-to-top button is hidden */
}

/* ----------------------------------------------------------------------------
 * Helper types
 * ------------------------------------------------------------------------- */

/**
 * Watch options
 */
interface WatchOptions {
  viewport$: Observable<Viewport>      /* Viewport observable */
  main$: Observable<Main>              /* Main area observable */
  target$: Observable<HTMLElement>     /* Location target observable */
}

/**
 * Mount options
 */
interface MountOptions {
  viewport$: Observable<Viewport>      /* Viewport observable */
  header$: Observable<Header>          /* Header observable */
  main$: Observable<Main>              /* Main area observable */
  target$: Observable<HTMLElement>     /* Location target observable */
}

/* ----------------------------------------------------------------------------
 * Functions
 * ------------------------------------------------------------------------- */

/**
 * Watch back-to-top
 *
 * @param _el - Back-to-top element
 * @param options - Options
 *
 * @returns Back-to-top observable
 */
export function watchBackToTop(
  _el: HTMLElement, { viewport$, main$, target$ }: WatchOptions
): Observable<BackToTop> {

  /* Compute direction (with jitter guard) */
  const DIRECTION_THRESHOLD = 12

  const direction$ = viewport$.pipe(
    map(({ offset: { y } }) => y),

    bufferCount(2, 1),
    map(([prev, curr]) => curr - prev),

    scan((acc, delta) => {
      const next =
        Math.sign(acc) === Math.sign(delta)
          ? acc + delta
          : delta

      // clamp，防止无限增大
      return Math.max(
        -DIRECTION_THRESHOLD * 2,
        Math.min(DIRECTION_THRESHOLD * 2, next)
      )
    }, 0),

    map(acc => {
      if (acc <= -DIRECTION_THRESHOLD) return true
      if (acc >=  DIRECTION_THRESHOLD) return false
      return null
    }),

    // 保留“确认型语义”
    filter((v): v is boolean => v !== null),

    // 补充“非顶部”条件（仅在确认时判断）
    withLatestFrom(viewport$),
    filter(([, vp]) => vp.offset.y > 0),
    map(([dir]) => dir),

    distinctUntilChanged()
  )

  /* Compute whether main area is active */
  const active$ = main$
    .pipe(
      map(({ active }) => active)
    )

    /* NEW: Detect reaching top */
  const atTop$ = viewport$
    .pipe(
      map(({ offset: { y } }) => y === 0),
      distinctUntilChanged(),
      filter(Boolean)
    )

    const effectiveDirection$ = merge(
    direction$,
    atTop$.pipe(map(() => false))
  )

  /* Compute threshold for hiding */
  return combineLatest([active$, effectiveDirection$])
    .pipe(
      map(([active, direction]) => !(active && direction)),
      distinctUntilChanged(),
      takeUntil(target$.pipe(skip(1))),
      endWith(true),
      repeat({ delay: 250 }),
      map(hidden => ({ hidden }))
    )
}

/* ------------------------------------------------------------------------- */

/**
 * Mount back-to-top
 *
 * @param el - Back-to-top element
 * @param options - Options
 *
 * @returns Back-to-top component observable
 */
export function mountBackToTop(
  el: HTMLElement, { viewport$, header$, main$, target$ }: MountOptions
): Observable<Component<BackToTop>> {
  const push$ = new Subject<BackToTop>()
  const done$ = push$.pipe(ignoreElements(), endWith(true))
  push$.subscribe({

    /* Handle emission */
    next({ hidden }) {
      el.hidden = hidden
      if (hidden) {
        el.setAttribute("tabindex", "-1")
        // 主动移除按钮焦点，恢复非选中状态
        if (button instanceof HTMLElement) {
          button.blur()
        }
        el.blur()
      } else {
        el.removeAttribute("tabindex")
      }
    },

    /* Handle complete */
    complete() {
      el.style.bottom = ""
      el.hidden = true
      el.removeAttribute("tabindex")
    }
  })

  /* Watch header height */
  // header$
  //   .pipe(
  //     takeUntil(done$),
  //     distinctUntilKeyChanged("height")
  //   )
  //     .subscribe(({ height }) => {
  //       el.style.bottom = `${height - 16}px`
  //     })

  /* Go back to top */
  const button = el.querySelector("[data-md-action='top']")
  if (button) {
    fromEvent(button, "click")
      .subscribe(ev => {
        ev.preventDefault()
        window.scrollTo({ top: 0 })
      })
  }

  /* Create and return component */
  return watchBackToTop(el, { viewport$, main$, target$ })
    .pipe(
      tap(state => push$.next(state)),
      finalize(() => push$.complete()),
      map(state => ({ ref: el, ...state }))
    )
}
