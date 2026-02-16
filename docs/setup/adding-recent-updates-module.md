---
status: new
icon: simple/lastpass
---

# Add recent updates module

<!-- md:version 10.0.4 -->
<!-- md:plugin [document-dates] -->

You can add a list of recently updated documents anywhere in your document with a single line of code. This is ideal for sites **with a large number of documents**, so that **readers can quickly see what's new**.

![recently-updated](../assets/screenshots/recently-updated-en.gif)

## Features

- Display recently updated documents in descending order by update time, list items are dynamically updated
- Support multiple view modes including list, detail and grid
- Support automatic extraction of article summaries
- Support for customizing article cover in Front Matter
- Support custom display quantity
- Support exclude specified files or folders

## Installation

This feature is provided by the plugin [document-dates], which should be installed first:

```bash
pip install mkdocs-document-dates
```

then configure the switch `recently-updated` in `mkdocs.yml`:

```yaml
- document-dates:
    ...
    recently-updated:
      limit: 10         # Limit the number of docs displayed
      exclude:          # Exclude documents you don't want to show
        - index.md          # Example: exclude the specified file
        - '*/index.md'      # Example: exclude all index.md files in any subfolders
        - blog/*            # Example: exclude all files in blog folder, including subfolders
```

You can also install the plugin [mkdocs-recently-updated-docs] to use alone

  [document-dates]: https://github.com/jaywhj/mkdocs-document-dates
  [mkdocs-recently-updated-docs]: https://github.com/jaywhj/mkdocs-recently-updated-docs

## Configuration

The following configuration options are supported:

<!-- md:option recently-updated.limit -->

:   <!-- md:default `10` --> This option specifies the number of documents to be displayed.

<!-- md:option recently-updated.exclude -->

:   <!-- md:default none --> This option specifies a list of documents to be excluded, supporting unix shell-style wildcards,  such as `*`, `?`, `[]` etc.

## Add to sidebar navigation

Download the sample template [nav.html](https://github.com/jaywhj/mkdocs-document-dates/blob/main/templates/overrides/partials/nav.html), and override this path `docs/overrides/partials/nav.html`

## Add anywhere in document

Insert this line anywhere in your document:

```yaml
<!-- RECENTLY_UPDATED_DOCS -->
```

## Configure article cover

Use the field `cover` in Front Matter to specify the article cover, which supports URL paths and local file paths, for example:

```yaml
---
cover: assets/cat.jpg
---
```
