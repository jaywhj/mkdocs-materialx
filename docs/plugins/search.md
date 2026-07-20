---
status: new
title: Built-in search plugin
icon: lucide/search
---

# Built-in search plugin

MaterialX for MkDocs 10.2.0 introduces a completely redesigned search system.
Search engines are now implemented as interchangeable providers, giving the
built-in search interface better result quality, more efficient indexing, and
more flexible configuration. The new architecture is particularly well suited
to large sites and provides much better Chinese and Japanese support.

[Pagefind]{target="_blank"} is the default provider for sites served over HTTP. 
[Lunr]{target="_blank"} remains available for sites that must also work when opened directly from `file://`. 
Both providers are fully client-side and require no hosted search service.

  [Pagefind]: https://pagefind.app/
  [Lunr]: https://lunrjs.com/

## Objective

### How it works

The plugin builds the selected provider's index after MkDocs has rendered the
site. The frontend loads that provider through a common integration and renders
the results with MaterialX's built-in search interface.

Pagefind scans the generated HTML and writes a chunked index beside the site.
At search time, the browser loads only the chunks and result data needed for
the current query. Lunr writes `search_index.json`, then constructs and
queries its in-memory index in a Web Worker.

### When to use it

The built-in plugin is the recommended search solution for most documentation
sites. Choose the provider according to how the final site is delivered:

| Requirement | Provider |
| --- | --- |
| Served over HTTP or HTTPS | Pagefind (default) |
| Large or multilingual site | Pagefind (default) |
| Optimized Chinese or Japanese search | Pagefind (default) |
| Opened directly from `file://` | Lunr |

The plugin also integrates with other [built-in plugins]:

<div class="grid cards" markdown>

-   :material-connection: &nbsp; __[Built-in offline plugin][offline]__

    ---

    The offline plugin makes it possible to distribute the generated
    [`site` directory][mkdocs.site_dir] as a `.zip` file. Use it together with
    the Lunr provider so search also works from the local filesystem.

-   :material-file-tree: &nbsp; __[Built-in meta plugin][meta]__

    ---

    The meta plugin can apply search metadata to a complete documentation
    section, making it easy to exclude a folder from either provider or tune
    Lunr result ranking.

</div>

  [offline]: offline.md
  [meta]: meta.md
  [built-in plugins]: index.md

## Configuration

<!-- md:plugin [search] – built-in -->

The search plugin is built into MaterialX for MkDocs and doesn't need to be
installed. Pagefind is enabled by default:

``` yaml
plugins:
  - search
```

When a `plugins` list already exists, `search` must be included explicitly.

  [search]: search.md

### Complete configuration structure

The following example shows the complete provider-based structure. Only the
block matching `provider` is used. All values are optional and should normally
be omitted unless the defaults need to be changed:

``` yaml
plugins:
  - search:
      provider: pagefind # pagefind (default) or lunr

      pagefind:
        # Index configuration
        output_subdir: search
        root_selector: html
        exclude_selectors:
          - nav
          - footer
        include_characters: ._
        # force_language: en
        keep_index_url: true
        write_playground: false
        verbose: false
        # logfile: pagefind.log

        # Browser Search API configuration
        options:
          # basePath: /search/
          excerptLength: 30
          exactDiacritics: false
          # metaCacheTag: build-2026-01-01
          ranking:
            termFrequency: 1.0
            termSimilarity: 1.0
            pageLength: 0.75
            termSaturation: 1.4
            diacriticSimilarity: 0.8
            metaWeights:
              title: 5.0
          indexWeight: 1.0
          # mergeFilter:
          #   site: Documentation
          noWorker: false

      lunr:
        # lang is computed from the site language by default
        lang:
          - en
        separator: '[\s\-]+'
        pipeline:
          - stemmer
          - stopWordFilter
          - trimmer
        # jieba_dict: dict.txt
        # jieba_dict_user: user_dict.txt
```

The expanded example is a reference, not a recommended starting point. In
particular, omit `force_language` to keep Pagefind's automatic multilingual
indexes, and only set `basePath` if Pagefind can't detect the bundle location.

### General

#### <!-- md:setting config.provider -->

<!-- md:default `pagefind` -->

Use this setting to select the search provider:

=== "Pagefind"

    ``` yaml
    plugins:
      - search:
          provider: pagefind
    ```

=== "Lunr"

    ``` yaml
    plugins:
      - search:
          provider: lunr
    ```

Provider-specific settings are isolated under their matching key, so Pagefind
settings don't affect Lunr and vice versa.

## Pagefind

<!-- md:version 10.2.0 -->

Pagefind is a static search library designed around a small initial payload and
on-demand index loading. MaterialX includes the extended Pagefind build for
specialized Chinese and Japanese indexing.

### Features

- __Chunked indexes__ – the generated index is split into small chunks instead
  of being downloaded as one complete file.
- __On-demand loading__ – the browser preloads the likely index chunk while a
  query is entered, then fetches result details only when they're displayed.
- __High-quality results__ – configurable ranking, section-level sub-results,
  excerpts, metadata weighting, and language-aware processing improve result
  relevance.
- __Multilingual search__ – Pagefind detects the `lang` attribute in generated
  HTML and creates independent indexes for each language automatically.
- __Large-site performance__ – the chunked architecture avoids loading an
  entire corpus into the browser and can accommodate sites with 100,000 pages
  and beyond. Actual build time and network usage still depend on page size,
  language mix, and hosting.

Pagefind must be served over HTTP or HTTPS because its JavaScript, WebAssembly,
and index chunks are loaded on demand. Use Lunr for direct `file://` access.

### Index configuration

Settings directly under `pagefind` configure the index generated after the
MkDocs build. MaterialX supports all index controls exposed by Pagefind's
embedded Python indexing API and adds `output_subdir` for the public bundle
location:

| Setting | Default | Description |
| --- | --- | --- |
| `output_subdir` | `search` | Output directory inside the generated site. |
| `root_selector` | `html` | CSS selector Pagefind treats as the root of every document. |
| `exclude_selectors` | `nav`, `footer` | CSS selectors and their descendants to omit from indexing. |
| `include_characters` | `._` | Punctuation preserved as searchable characters. |
| `force_language` | automatic | ISO 639-1 language code used to combine the site into one index. |
| `keep_index_url` | `true` | Keep `index.html` at the end of result URLs. |
| `write_playground` | `false` | Write Pagefind's ranking playground into the search bundle. |
| `verbose` | `false` | Enable detailed Pagefind indexing logs. |
| `logfile` | none | Also write logs to a file inside `output_subdir`. |
| `options` | `{}` | Browser Search API configuration, described in the next section. |

The defaults in this table are the effective MaterialX defaults. In particular,
MaterialX preserves `._` for technical searches, keeps `index.html` in result
URLs, and excludes navigation and footer elements unless these values are
overridden.

For example, the following configuration expands the searchable punctuation,
excludes custom page furniture, and writes the Pagefind playground:

``` yaml
plugins:
  - search:
      provider: pagefind
      pagefind:
        exclude_selectors:
          - nav
          - footer
          - .md-banner
          - '[data-search-only="lunr"]'
        include_characters: ._-$
        write_playground: true
```

MaterialX manages the source site, HTML `glob`, and final `output_path`, so
`site`, `source`, `glob`, and `output_path` aren't user settings.
Process-oriented Pagefind CLI settings such as `serve`, `quiet`, and `silent`
also don't apply to the embedded Python indexer. See Pagefind's [index
configuration options]{target="_blank"} and [Python API]{target="_blank"} for the upstream reference.

  [index configuration options]: https://pagefind.app/docs/config-options/
  [Python API]: https://pagefind.app/docs/py-api/

### Search API configuration

Settings under `pagefind.options` are passed directly to Pagefind's browser
Search API. They use the API's camel-case names and aren't reinterpreted by the
plugin:

``` yaml
plugins:
  - search:
      provider: pagefind
      pagefind:
        options:
          excerptLength: 20
          exactDiacritics: false
          ranking:
            pageLength: 0.5
            termSimilarity: 1.5
            metaWeights:
              title: 8.0
```

The following Search API options are available:

| Option | Default | Description |
| --- | --- | --- |
| `basePath` | automatic | Override the Pagefind bundle path if automatic detection fails. |
| `excerptLength` | `30` | Maximum number of words in generated result excerpts. |
| `exactDiacritics` | `false` | Treat accented and unaccented characters as distinct. |
| `metaCacheTag` | automatic | Set a stable metadata cache key, useful for service workers and PWAs. |
| `ranking` | Pagefind defaults | Tune result ranking with the parameters below. |
| `indexWeight` | `1.0` | Weight this index when combining multiple Pagefind indexes. |
| `mergeFilter` | none | Add a filter value to all results from a merged index. |
| `noWorker` | `false` | Run search on the main thread instead of a Web Worker. |

MaterialX manages `baseUrl` so result paths stay in sync with `site_url`, and
manages `highlightParam` so `search.highlight` uses the correct query
parameter. User values for those two options are therefore overridden.

The `ranking` object accepts all Pagefind ranking controls:

| Ranking option | Default | Purpose |
| --- | --- | --- |
| `termFrequency` | `1.0` | Balance term frequency against weighted term count. |
| `termSimilarity` | `1.0` | Prefer indexed terms whose length is closer to the query. |
| `pageLength` | `0.75` | Control how strongly shorter-than-average pages are favored. |
| `termSaturation` | `1.4` | Control how quickly repeated terms stop increasing relevance. |
| `diacriticSimilarity` | `0.8` | Boost exact diacritic matches when normalization is enabled. |
| `metaWeights` | `title: 5.0` | Weight matches in title or custom metadata fields. |

For the authoritative list and value ranges, see Pagefind's [Search API
configuration]{target="_blank"} and [ranking documentation]{target="_blank"}. Since `options` is passed through
without a fixed MaterialX schema, every option supported by the bundled
Pagefind version can be used without a theme-specific setting.

  [Search API configuration]: https://pagefind.app/docs/search-config/
  [ranking documentation]: https://pagefind.app/docs/ranking/

### Excluding content

#### Excluding an entire page

Use `search.exclude` in the Markdown front matter to remove a complete page and
all of its sections from the Pagefind index:

``` yaml
---
search:
  exclude: true
---

# Page title
...
```

The [meta] plugin can apply the same property to every page in a folder:

``` yaml title=".meta.yml"
search:
  exclude: true
```

#### Excluding part of a page

Use Pagefind's `data-pagefind-ignore` attribute to exclude part of a document.
For a complete section, wrap the heading and its content in an HTML container:

``` html
<div data-pagefind-ignore markdown>

## Internal notes

This complete section is excluded from Pagefind.

</div>
```

The attribute excludes the element and all of its children. Its default value,
`index`, still allows Pagefind to read metadata and filters inside the element.
Use `data-pagefind-ignore="all"` to exclude the subtree from all Pagefind
processing:

``` html
<div data-pagefind-ignore="all" markdown>

This content, its metadata, and its filters are ignored.

</div>
```

For a site-wide rule, add a CSS selector to `exclude_selectors` instead of
annotating each page. Note that placing `data-pagefind-ignore` only on a heading
excludes the heading element, not all following content, which is why the
wrapper is required for complete sections.

  [Attribute Lists]: ../setup/extensions/python-markdown.md#attribute-lists

### Other Pagefind features

Pagefind also supports metadata, filters, sorting, content weighting, custom
records, external indexes, and search across multiple sites. These advanced
features can require custom templates or frontend integration and are not
covered here. See the [Pagefind documentation]{target="_blank"} and [multisite search]{target="_blank"} guide for
the complete workflows.

  [Pagefind documentation]: https://pagefind.app/docs/
  [multisite search]: https://pagefind.app/docs/multisite/

## Lunr

Lunr builds one JSON search index and loads it into a Web Worker in the
browser. It is less efficient for very large sites than Pagefind, but remains
the right provider when a generated site must work without an HTTP server.

### Language

#### <!-- md:setting config.lang -->

<!-- md:version 9.0.0 -->
<!-- md:default computed -->

Use this setting to specify the language of the search index, enabling
[stemming] support for languages other than English. The default is computed
from the [site language], but can be set to one or multiple languages:

=== "Set language"

    ``` yaml
    plugins:
      - search:
          provider: lunr
          lunr:
            lang: en
    ```

=== "Add further languages"

    ``` yaml
    plugins:
      - search:
          provider: lunr
          lunr:
            lang: # (1)!
              - en
              - de
    ```

    1.  Including more languages increases the base JavaScript payload by
        around 20kb and by another 15-30kb per language, all before `gzip`.

  [stemming]: https://en.wikipedia.org/wiki/Stemming
  [site language]: ../setup/changing-the-language.md#site-language
  [lunr languages]: https://github.com/MihaiValentin/lunr-languages

Language support is provided by [lunr languages], a collection of
language-specific stemmers and stop words for Lunr maintained by the Open
Source community.

The following languages are currently supported by [lunr languages]:

<div class="mdx-columns" markdown>

- `ar` – Arabic
- `da` – Danish
- `de` – German
- `du` – Dutch
- `en` – English
- `es` – Spanish
- `fi` – Finnish
- `fr` – French
- `hi` – Hindi
- `hu` – Hungarian
- `hy` – Armenian
- `it` – Italian
- `ja` – Japanese
- `kn` – Kannada
- `ko` – Korean
- `no` – Norwegian
- `pt` – Portuguese
- `ro` – Romanian
- `ru` – Russian
- `sa` – Sanskrit
- `sv` – Swedish
- `ta` – Tamil
- `te` – Telugu
- `th` – Thai
- `tr` – Turkish
- `vi` – Vietnamese
- `zh` – Chinese

</div>

If [lunr languages] doesn't support the selected [site language], the plugin
falls back to the language that is expected to yield the best stemming
results.

### Tokenization

#### <!-- md:setting config.separator -->

<!-- md:version 9.0.0 -->
<!-- md:default computed -->

Use this setting to specify the separator used to split words when building
the search index. The default is computed from the [site language], but can be
set explicitly:

``` yaml
plugins:
  - search:
      provider: lunr
      lunr:
        separator: '[\s\-,:!=\[\]()"/]+|(?!\b)(?=[A-Z][a-z])|\.(?!\d)|&[lg]t;'
```

Separators support [positive and negative lookahead assertions], allowing
precise control over how words are split.

Broken into its parts, this separator induces the following behavior:

=== "Special characters"

    ```
    [\s\-,:!=\[\]()"/]+
    ```

    This inserts token boundaries before and after whitespace, hyphens,
    commas, brackets, and other special characters. Adjacent separators are
    treated as one.

=== "Case changes"

    ```
    (?!\b)(?=[A-Z][a-z])
    ```

    This splits programming identifiers at case changes, tokenizing
    `PascalCase` into `Pascal` and `Case`.

=== "Version strings"

    ```
    \.(?!\d)
    ```

    The negative lookahead prevents version strings like `1.2.3` from being
    split into separate numbers and keeps them discoverable.

=== "HTML/XML tags"

    ```
    &[lg]t;
    ```

    This accounts for `<` and `>` being encoded as `&lt;` and `&gt;` in code
    blocks, allowing users to search for tag names.

  [positive and negative lookahead assertions]: https://www.regular-expressions.info/lookaround.html

### Pipeline

#### <!-- md:setting config.pipeline -->

<!-- md:version 9.0.0 -->
<!-- md:default computed -->
<!-- md:flag experimental -->

Use this setting to specify the [pipeline functions] that filter and expand
tokens after tokenization and before adding them to the index. The default is
computed from the [site language]:

``` yaml
plugins:
  - search:
      provider: lunr
      lunr:
        pipeline:
          - stemmer
          - stopWordFilter
          - trimmer
```

The following pipeline functions can be used:

- `stemmer` – Stem tokens to their root form, e.g. `running` to `run`
- `stopWordFilter` – Filter common words such as `a` and `the`
- `trimmer` – Trim whitespace from tokens

  [pipeline functions]: https://lunrjs.com/guides/customising.html#pipeline-functions

### Segmentation

The plugin supports Chinese text segmentation with [jieba]. Japanese and
Korean are segmented on the client side when Lunr is selected.

  [jieba]: https://pypi.org/project/jieba/

#### <!-- md:setting config.jieba_dict -->

<!-- md:version 9.2.0 -->
<!-- md:default none -->
<!-- md:flag experimental -->

Use this setting to specify a [custom dictionary] for [jieba], replacing its
default dictionary:

``` yaml
plugins:
  - search:
      provider: lunr
      lunr:
        jieba_dict: dict.txt
```

The following dictionaries are provided by [jieba]:

- [dict.txt.small] – 占用内存较小的词典文件
- [dict.txt.big] – 支持繁体分词更好的词典文件

The path is resolved from the project root directory.

  [custom dictionary]: https://github.com/fxsjy/jieba#%E5%85%B6%E4%BB%96%E8%AF%8D%E5%85%B8
  [dict.txt.small]: https://github.com/fxsjy/jieba/raw/master/extra_dict/dict.txt.small
  [dict.txt.big]: https://github.com/fxsjy/jieba/raw/master/extra_dict/dict.txt.big

#### <!-- md:setting config.jieba_dict_user -->

<!-- md:version 9.2.0 -->
<!-- md:default none -->
<!-- md:flag experimental -->

Use this setting to add a [user dictionary] to [jieba] without replacing the
default dictionary. User dictionaries are useful for product names, technical
terms, and other site-specific vocabulary:

``` yaml
plugins:
  - search:
      provider: lunr
      lunr:
        jieba_dict_user: user_dict.txt
```

The path is resolved from the project root directory.

  [user dictionary]: https://github.com/fxsjy/jieba#%E8%BD%BD%E5%85%A5%E8%AF%8D%E5%85%B8

### Excluding sections and blocks

When [Attribute Lists] is enabled, a section can be excluded from the Lunr
index by adding `data-search-exclude` to its heading. The heading and all
content up to the next heading of the same or higher level are omitted:

``` markdown
# Page title

## Public section

This content is included.

## Internal section { data-search-exclude }

This complete section is excluded from Lunr.
```

Add the same attribute after an inline or block-level element to exclude only
that element:

``` markdown
This paragraph is included.

This paragraph is excluded.
{ data-search-exclude }
```

## Usage

### Metadata

#### <!-- md:setting meta.search.boost -->

<!-- md:version 8.3.0 -->
<!-- md:flag metadata -->
<!-- md:default none -->

Use this property to increase or decrease the relevance of a page in Lunr
results. Values above `1` rank a page up and values below `1` rank it down:

=== ":material-arrow-up-circle: Rank up"

    ``` yaml
    ---
    search:
      boost: 2 # (1)!
    ---

    # Page title
    ...
    ```

    1.  When boosting pages, always start with low values.

=== ":material-arrow-down-circle: Rank down"

    ``` yaml
    ---
    search:
      boost: 0.5
    ---

    # Page title
    ...
    ```

Pagefind uses its own [`data-pagefind-weight`][Pagefind weighting] attribute
and `pagefind.options.ranking` settings instead of this Lunr metadata value.

  [Pagefind weighting]: https://pagefind.app/docs/weighting/

#### <!-- md:setting meta.search.exclude -->

<!-- md:version 9.0.0 -->
<!-- md:flag metadata -->
<!-- md:default none -->

Use this property to exclude a page and all of its subsections from the search
results. It works with both Pagefind and Lunr:

``` yaml
---
search:
  exclude: true
---

# Page title
...
```
