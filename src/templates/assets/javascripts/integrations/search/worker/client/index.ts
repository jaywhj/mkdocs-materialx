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
  Subject,
  filter,
  firstValueFrom
} from "rxjs"

import { watchWorker } from "~/browser"

import {
  SearchWorkerMessage,
  SearchWorkerMessageType
} from "../protocol"

/**
 * Generic search worker client
 */
export class SearchWorkerClient<TSetup, TRequest, TResult> {

  /* Bidirectional worker channel */
  private readonly worker$: Subject<SearchWorkerMessage>

  /* Next request identifier */
  private sequence = 0

  /**
   * Create a search worker client
   *
   * @param url - Worker URL
   */
  public constructor(url: string) {
    this.worker$ = watchWorker<SearchWorkerMessage>(url)
  }

  /**
   * Set up the worker engine
   *
   * @param options - Engine options
   *
   * @returns Promise resolving when the engine is ready
   */
  public async setup(options: TSetup): Promise<void> {
    await this.request<TSetup, void>(
      SearchWorkerMessageType.SETUP,
      SearchWorkerMessageType.READY,
      options
    )
  }

  /**
   * Search through the worker engine
   *
   * @param request - Search request
   *
   * @returns Search result
   */
  public search(request: TRequest): Promise<TResult> {
    return this.request<TRequest, TResult>(
      SearchWorkerMessageType.SEARCH,
      SearchWorkerMessageType.RESULT,
      request
    )
  }

  /* Send a request and await its matching response */
  private async request<TData, TResponse>(
    type: SearchWorkerMessageType,
    responseType: SearchWorkerMessageType,
    data: TData
  ): Promise<TResponse> {
    const id = this.sequence++
    const response = firstValueFrom(this.worker$.pipe(
      filter(message => message.id === id && (
        message.type === responseType ||
        message.type === SearchWorkerMessageType.ERROR
      ))
    ))
    this.worker$.next({ id, type, data })

    const message = await response
    if (message.type === SearchWorkerMessageType.ERROR)
      throw new Error(message.error || "Search worker failed")
    return message.data as TResponse
  }
}
