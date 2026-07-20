---
status: new
icon: octicons/search-24
search:
  boost: 1.05
---

# Setting up site search

MaterialX for MkDocs 10.2.0 completely redesigns the built-in search system.
The new implementation uses interchangeable search providers, improves index
generation and result quality, and offers more flexible configuration for
large and multilingual documentation sites. It also brings significantly
better support for Chinese and Japanese content.

[Pagefind]{target="_blank"} is the default provider. Its chunked, on-demand index is the best
choice for sites served over HTTP and scales efficiently as a site grows.
[Lunr]{target="_blank"} remains available for documentation that must also work [offline]{target="_blank"} when
opened directly from `file://`.

  [Pagefind]: https://pagefind.app/
  [Lunr]: https://lunrjs.com/
  [offline]: ../plugins/offline.md

## Configuration

### Built-in search plugin

<!-- md:version 10.2.0 -->
<!-- md:plugin -->

The built-in search plugin adds client-side search without requiring a hosted
search service. It's enabled by default, but must be re-added to `mkdocs.yml`
when other plugins are configured:

=== "Pagefind (default)"

    ``` yaml
    plugins:
      - search
    ```

    Pagefind creates a chunked static index after the site is built and loads
    only the index data needed for each query.

=== "Lunr (offline)"

    ``` yaml
    plugins:
      - search:
          provider: lunr
    ```

    Lunr packages the search index with the site and can therefore search a
    site opened directly from the local filesystem.

Both providers use the same MaterialX search interface. Provider-specific
settings are nested under `pagefind` and `lunr`, so changing providers doesn't
require changing the theme or search UI. For the complete `mkdocs.yml`
structure and all available settings, see the [plugin documentation]{target="_blank"}.

  [plugin documentation]: ../plugins/search.md

### Search suggestions

<!-- md:version 7.2.0 -->
<!-- md:feature -->
<!-- md:flag experimental -->

When search suggestions are enabled, the search displays the likeliest
completion for the last word, which can be accepted with the ++arrow-right++
key. Suggestions are currently available with the Lunr provider:

``` yaml
plugins:
  - search:
      provider: lunr

theme:
  features:
    - search.suggest
```

Searching for [:octicons-search-24: search su][Search suggestions example]
yields ^^search suggestions^^ as a suggestion.

  [Search suggestions example]: ?q=search+su

### Search highlighting

<!-- md:version 7.2.0 -->
<!-- md:feature -->
<!-- md:flag experimental -->

When search highlighting is enabled and a user follows a search result,
MaterialX for MkDocs highlights all occurrences of the search terms on the
destination page. This feature works with both providers:

``` yaml
theme:
  features:
    - search.highlight
```

Searching for [:octicons-search-24: code blocks][Search highlighting example]
highlights all occurrences of both terms.

  [Search highlighting example]: ../reference/code-blocks.md?h=code+blocks

### Search sharing

<!-- md:version 7.2.0 -->
<!-- md:feature -->

When search sharing is enabled, a :material-share-variant: share button is
rendered next to the reset button. It copies a deep link to the current query
and results to the clipboard:

``` yaml
theme:
  features:
    - search.share
```

## Usage

### Search exclusion

<!-- md:version 9.0.0 -->
<!-- md:flag metadata -->
<!-- md:flag experimental -->

Pages can be excluded from either provider with the front matter
`search.exclude` property:

``` yaml
---
search:
  exclude: true
---

# Page title
...
```

Use the built-in [meta plugin]{target="_blank"} to apply the same property to a complete folder
and all of its subfolders. Excluding only part of a page is provider-specific:
Pagefind uses `data-pagefind-ignore`, while Lunr uses `data-search-exclude`.
See [Pagefind content exclusion]{target="_blank"} and [Lunr content exclusion]{target="_blank"} for examples.

  [meta plugin]: ../plugins/meta.md
  [Pagefind content exclusion]: ../plugins/search.md#excluding-content
  [Lunr content exclusion]: ../plugins/search.md#excluding-sections-and-blocks

### Search boosting

<!-- md:version 8.3.0 -->
<!-- md:flag metadata -->

Lunr pages can be boosted with the front matter `search.boost` property. Use
values above `1` to rank a page up and values below `1` to rank it down:

=== ":material-arrow-up-circle: Rank up"

    ``` yaml
    ---
    search:
      boost: 2 # (1)!
    ---

    # Page title
    ...
    ```

    1.  When boosting pages, start with small adjustments.

=== ":material-arrow-down-circle: Rank down"

    ``` yaml
    ---
    search:
      boost: 0.5
    ---

    # Page title
    ...
    ```

Pagefind provides its own [content weighting]{target="_blank"} and browser-side [ranking]{target="_blank"}
controls. The search [plugin documentation]{target="_blank"} explains how Pagefind options fit
into `mkdocs.yml`.

  [content weighting]: https://pagefind.app/docs/weighting/
  [ranking]: https://pagefind.app/docs/ranking/
