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
  SearchWorkerMessage,
  SearchWorkerMessageType
} from "../protocol"

/**
 * Search engine that can be hosted in the generic worker infrastructure
 */
export interface SearchWorkerEngine<TSetup, TRequest, TResult> {
  setup(options: TSetup): Promise<void>
  search(request: TRequest): Promise<TResult>
}

/**
 * Mount a search engine in the current worker context
 *
 * @param engine - Search worker engine
 */
export function setupSearchWorkerHost<TSetup, TRequest, TResult>(
  engine: SearchWorkerEngine<TSetup, TRequest, TResult>
): void {
  addEventListener("message", async ev => {
    const message = ev.data as SearchWorkerMessage
    try {
      switch (message.type) {
        case SearchWorkerMessageType.SETUP:
          await engine.setup(message.data as TSetup)
          postMessage({
            id: message.id,
            type: SearchWorkerMessageType.READY
          } satisfies SearchWorkerMessage)
          break

        case SearchWorkerMessageType.SEARCH:
          postMessage({
            id: message.id,
            type: SearchWorkerMessageType.RESULT,
            data: await engine.search(message.data as TRequest)
          } satisfies SearchWorkerMessage)
          break

        default:
          throw new TypeError("Invalid search worker message")
      }
    } catch (err) {
      postMessage({
        id: message.id,
        type: SearchWorkerMessageType.ERROR,
        error: err instanceof Error ? err.message : `${err}`
      } satisfies SearchWorkerMessage)
    }
  })
}
