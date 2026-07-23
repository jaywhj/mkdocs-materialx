---
status: new
title: Built-in search plugin
icon: lucide/search
---

# Built-in search plugin

MaterialX for MkDocs `10.2.0` introduces a completely redesigned search system.
Search engines are now implemented as interchangeable providers, giving the built-in search interface
**better result quality**, **more efficient indexing**, and **more flexible configuration**.
The new architecture is particularly well suited to large sites and adds specialized support for Chinese and Japanese content.

[Pagefind]{target="_blank"} is the default provider for sites served over HTTP.
[Lunr]{target="_blank"} remains available for sites built with the [offline]{target="_blank"} plugin that must also work when opened directly from `file://`.
Both providers are fully client-side and require no hosted search service.

  [Pagefind]: https://pagefind.app/
  [Lunr]: https://lunrjs.com/

## Objective

### How it works

The plugin builds the selected provider's index after MkDocs has rendered the
site. The frontend loads that provider through a common integration and renders
the results with MaterialX's built-in search interface.

Pagefind scans the generated HTML and writes a chunked index beside the site.
At search time, the browser loads only the chunks and result data needed for the current query.
Lunr writes `search_index.json`, then constructs and queries its in-memory index in a Web Worker.

### Integration with other plugins

The search plugin integrates with other [built-in plugins]:

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
installed. Add `search` to the `plugins` list to enable it. Pagefind is the
default provider:

``` yaml
plugins:
  - search
```

  [search]: search.md

### Configuration structure

The following example shows the provider-based structure and the options that
are useful for most customizations. **All settings below it are optional**.

``` yaml
plugins:
  - search:
      provider: pagefind # pagefind (default) or lunr

      pagefind:
        # Index configuration
        include_characters: ._
        keep_index_url: true
        exclude_selectors:
          - .md-banner
        # output_subdir: search
        # logfile: pagefind.log

        # Browser Search API configuration
        options:
          excerptLength: 30
          exactDiacritics: false
          ranking:
            termFrequency: 1.0
            termSimilarity: 1.0
            pageLength: 0.75
            termSaturation: 1.4
            diacriticSimilarity: 0.8
            metaWeights:
              title: 5.0

      lunr:
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

Start with `plugins: [search]` and add only the settings required by the site.
The provider sections below explain when each option is useful.

### Provider

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

Provider-specific settings are isolated under their matching key, so Pagefind settings don't affect Lunr and vice versa.
Keep the default Pagefind provider when the site is served over HTTP or HTTPS.
When building with the [offline]{target="_blank"} plugin,
select Lunr if the generated site must also support search when opened directly from `file://`.

## Pagefind

<!-- md:version 10.2.0 -->

Pagefind is a static search library designed around a small initial payload and
on-demand index loading. MaterialX installs Pagefind's extended release, which
provides specialized segmentation for Chinese, Japanese, and Korean content.

### Features

- __High-quality ranking__ – Pagefind combines term frequency and similarity,
  page length, term saturation, diacritics, and content and metadata weights.
  This produces more relevant results across pages of different lengths and
  content types, while keeping the ranking model configurable.
- __Precise, informative results__ – Results are grouped by page and matching
  subsection, link directly to the relevant heading, and include an excerpt
  around the match. Users can identify the right result before opening it.
- __Chunked index__ – The generated index is split into small chunks instead of
  being delivered as one complete site-wide index.
- __On-demand loading__ – MaterialX preloads the chunks likely to match the
  current query and loads full result data only when it is rendered.
- __Large-site scalability__ – Index chunking keeps the initial payload small
  as content grows, making Pagefind suitable for sites with tens of thousands
  of pages.
- __Multilingual search__ – Pagefind detects the language of generated pages,
  builds separate language indexes, and selects the appropriate index in the
  browser. MaterialX uses the extended release for specialized Chinese,
  Japanese, and Korean segmentation.

Pagefind must be served over HTTP or HTTPS because its JavaScript, WebAssembly,
and index chunks are loaded on demand.

### Index configuration

Settings directly under `pagefind` configure the index generated after the
MkDocs build. The following options cover the most common customizations:

| Setting | Default | Description |
| --- | --- | --- |
| `exclude_selectors` | `nav`, `footer` | CSS selectors and their descendants to omit from indexing. |
| `include_characters` | `._` | Punctuation preserved as searchable characters. |
| `keep_index_url` | `true` | Keep `index.html` at the end of result URLs. |
| `logfile` | none | Also write logs to a file; relative paths are resolved inside `output_subdir`. |
| `options` | `{}` | Browser Search API configuration, described in the next section. |

MaterialX marks the main content with `data-pagefind-body` and manages the
index input, output, and result URL format. Other Pagefind index options remain
available for advanced use; see the official [index configuration
options]{target="_blank"}.

  [index configuration options]: https://pagefind.app/docs/config-options/

### Search API configuration

Settings under `pagefind.options` are passed to Pagefind's browser Search API
using camel-case names. In normal use, only excerpt, diacritic matching, and
ranking behavior need to be customized:

| Option | Default | Description |
| --- | --- | --- |
| `excerptLength` | `30` | Maximum target length for generated result excerpts. |
| `exactDiacritics` | `false` | Treat accented and unaccented characters as distinct. |
| `ranking` | Pagefind defaults | Tune result ranking with the parameters below. |

MaterialX manages bundle routing, result URLs, and highlighting. The complete
upstream option set remains available for special cases in Pagefind's [Search
API configuration]{target="_blank"}.

The most useful `ranking` controls are:

| Ranking option | Default | Purpose |
| --- | --- | --- |
| `termFrequency` | `1.0` | Balance term frequency against weighted term count. |
| `termSimilarity` | `1.0` | Prefer indexed terms whose length is closer to the query. |
| `pageLength` | `0.75` | Control how strongly shorter-than-average pages are favored. |
| `termSaturation` | `1.4` | Control how quickly repeated terms stop increasing relevance. |
| `diacriticSimilarity` | `0.8` | Boost exact diacritic matches when normalization is enabled. |
| `metaWeights` | `title: 5.0` | Weight matches in title or custom metadata fields. |

For value ranges and the remaining controls, see Pagefind's [ranking documentation]{target="_blank"}.
MaterialX doesn't impose a separate schema on `options`.

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

#### Excluding certain types of elements

Use `exclude_selectors` for elements that should be ignored throughout the
site, such as a custom banner or generated utility block:

``` yaml
plugins:
  - search:
      pagefind:
        exclude_selectors:
          - .md-banner
          - .generated-example
```

The matched element and all of its children are excluded.

#### Excluding part of a page

Use Pagefind's `data-pagefind-ignore` attribute to exclude part of a document.
For a complete section, wrap the heading and its content in an HTML container:

``` html
<div data-pagefind-ignore markdown>

## Internal notes

This complete section is excluded from Pagefind.

</div>
```

The attribute excludes the element and all of its children. Placing it only on
a heading doesn't exclude the content that follows, which is why a wrapper is
required for complete sections.

  [Attribute Lists]: ../setup/extensions/python-markdown.md#attribute-lists

### Other Pagefind features

Pagefind also supports metadata, filters, sorting, content weighting, custom
records, and search across multiple sites. These are upstream Pagefind
capabilities; some require custom templates, indexing code, or frontend code
beyond MaterialX's built-in integration. See the [Pagefind]{target="_blank"}
documentation and [multisite search]{target="_blank"} guide for the complete
workflows.

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

#### <!-- md:setting meta.search.exclude -->

<!-- md:version 9.0.0 -->
<!-- md:flag metadata -->
<!-- md:default none -->

Use this property to exclude a page and all of its subsections from the Lunr
index. The Pagefind provider recognizes the same property:

``` yaml
---
search:
  exclude: true
---

# Page title
...
```
