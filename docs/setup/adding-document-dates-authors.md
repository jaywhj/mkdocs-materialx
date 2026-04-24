---
status: new
icon: material/account-clock-outline
---

# Add document dates & authors

You can add date and author information to your documents via the built-in plugin [document-dates], a new generation MkDocs plugin for displaying exact creation date, last updated date, authors, email of documents.

It's __20-500 times faster__ than `git-revision-date-localized` and `git-authors`, and works in any environment (no-Git, Git environments, Docker, all CI/CD build systems, etc.).

In addition, this plugin completely resolved date and time infrastructure issues, enabling the project to support automated date processing. **Manual date configuration is no longer required for any feature**, including: page date display, blog post dates, blog date archives, blog list sorting, sitemap.xml (lastmod - SEO improvements), RSS feeds, recently updated section, search ranking, and more.

  [document-dates]: ../plugins/date-author.md

## Configuration

Add the following lines to `mkdocs.yml`:

```yaml
plugins:
  - document-dates:
      position: top            # Display position: top(after title) bottom(end of document), default: top
      type: date               # Date type: date datetime timeago, default: date
      exclude:                 # List of excluded files (support unix shell-style wildcards)
        - temp.md                  # Example: exclude the specified file
        - blog/*                   # Example: exclude all files in blog folder, including subfolders
        - '*/index.md'             # Example: exclude all index.md files in any subfolders
```

<br />

Some common features are listed below. For a more complete and systematic introduction, please refer to [Built-in Date Plugin][document-dates].

## Date & Time

The date data is retrieved using a combination of different methods to adapt to various runtime environments, including no-Git environments, Git, Docker containers, and all CI/CD build systems:

- Uses **filesystem timestamp** to ensure accurate original dates in local no-Git environments
- Uses **Git timestamp** to ensure relatively accurate dates in Git environments
- Uses **cache file** to ensure accurate original dates in Git environments
- Front Matter: Manually specify the date in Front Matter if you prefer not to use automatic dates

### Loading order

By default, the plugin will **automatically load** the document's "creation date" and "last updated date" in the following order:

- Creation date: `Front Matter` > `Cache File` > `Git Timestamp` > `File Timestamp`
- Last updated: `Front Matter` > `Git Timestamp` > `File Timestamp`

### Customization

This can be specified in Front Matter using the following fields:

- Creation date: `created`, `date`
- Last updated: `updated`, `modified`

```yaml
---
created: 2023-01-01
updated: 2025-02-23
---
```

## Author

### Loading order

The plugin will **automatically** loads the author information of the document in the following order, and will automatically parse the email and then do the linking:

- `Front Matter` > `Git Author` > `site_author(mkdocs.yml)` > `PC Username`

### Customization

Can be configured in Front Matter in the following ways:

1) Configure a simple author: via field `name`

```yaml
---
name: any-name
email: e-name@gmail.com
---
```

2) Configure one or more authors: via field `authors`

```yaml
---
authors:
  - jaywhj
  - dawang
  - sunny
---
```

### Enhanced author configuration

For a better user experience, you can add full configuration for all authors. To do so, create an `authors.yml` file in the `docs/` folder using the format below:

```yaml title="docs/authors.yml"
authors:
  jaywhj:
    name: Aaron Wang
    avatar: https://xxx.com/avatar.jpg
    url: https://jaywhj.netlify.app/
    email: junewhj@qq.com
    description: Minimalism
  user2:
    name: xxx
    avatar: assets/avatar.png
    url: https://xxx.com
    email: xxx@gmail.com
    description: xxx
```

When the author name in `Front Matter`, `Git Author`, `site_author(mkdocs.yml)` matches the key in `authors`, the full author information of the key will be automatically loaded.

## Avatar

### Loading order

The plugin will **automatically** loads the author avatar in the following order:

- `Front Matter` > `Online Avatar` > `Character Avatar`

### Customization 

Customizable via `avatar` field in [Enhanced author configuration](#enhanced-author-configuration) (supports URL paths and local file paths).

### Other avatars

!!! quote ""

    === "Online avatar"

        Load from Gravatar or Weavatar based on Git's `user.email`

    === "Character avatar"

        Automatically generated based on the author's name with the following rules:  
        1. Extract initials: English takes the combination of initials, other languages take the first character  
        2. Generate dynamic background color: Generate HSL color based on the hash of the name

## Configuration structure

You can control whether the component is rendered using the following configuration.

**Global Toggle**, configured in mkdocs.yml:

```yaml title="mkdocs.yml"
plugins:
  - document-dates:
      ...
      show_created: true    # Show creation date: true false, default: true
      show_updated: true    # Show last updated date: true false, default: true
      show_author: true     # Show author: true(avatar) text(text) false(hidden), default: true 
```

**Local Toggle**, configured in Front Matter (using the same field names):

```yaml
---
show_created: true
show_updated: true
show_author: text
---
```

!!! tip "Note"

    When used in combination, the global toggle acts as the master switch, and the local toggle only takes effect when the master switch is enabled. This does not follow the logic of local configurations overriding global ones.

<br />

For a more complete and systematic introduction, please refer to [Built-in Date Plugin][document-dates].