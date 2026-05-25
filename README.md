
## MaterialX

<br />

**MaterialX**, the next generation of mkdocs-material, build beautiful sites the way you already know and love, based on `mkdocs-material-9.7.1` and named `X`, it provides ongoing maintenance and updates.

<details>
  <summary> Why MaterialX ? </summary>
  <br />
  <p>
    The MkDocs project is nearing its end due to personal issues involving its original author. He has ceased updates for MkDocs and intends to release a completely new 2.0 version as a replacement. However, this new version is entirely incompatible with the existing ecosystem. It is an entirely separate project that merely carries the MkDocs name, and an accidental upgrade will result in devastating damage.
  </p>
  <p>
    As a result, to break free from dependency on MkDocs, the team behind the popular mkdocs-material theme framework has discontinued its maintenance and shifted to developing an entirely new alternative project named Zensical. While it adopts a new architecture and eliminates dependency on MkDocs, it still lacks many features. In addition, it is incompatible with the existing MkDocs ecosystem, making many existing plugins unavailable. This imposes certain migration costs on users, and its stability remains unproven.
  </p>
  <p>
    To ensure the continued stable operation of existing MkDocs projects and ecosystem, a new community-driven successor to MkDocs has emerged: ProperDocs (based on MkDocs 1.6.1). It will provide ongoing updates and maintenance while remaining fully compatible with the original MkDocs ecosystem.
  </p>
  <p>
    Similarly, mkdocs-material also has a new successor: <strong>MaterialX</strong> (based on mkdocs-material 9.7.1). It will also receive ongoing updates and maintenance, with full compatibility with the original ecosystem and zero migration costs.
  </p>
  <hr>
  <p>
    In short: <strong><code>MaterialX + ProperDocs</code></strong> is an equivalent replacement for <code>mkdocs-material + mkdocs</code> and provides ongoing maintenance and updates.
  </p>
</details>

**MaterialX** preserves the **rich features** and **stability** of the mkdocs-material project, while delivering **new features** and **broad compatibility**, and will adopt the following brand-new vision and positioning.

<br />

## Update Highlights

- Added Markdown source support for AI agents, providing structured content for AI and reducing token consumption by over 80%
- Added next-generation date & author plugin, see: [Add document dates & authors](https://jaywhj.github.io/mkdocs-materialx/setup/adding-document-dates-authors)
    - It's **20-500 times faster** than `git-revision-date-localized` and `git-authors`, and works in any environment (no-Git, Git environments, Docker, all CI/CD build systems, etc.).
    - Completely resolved date and time infrastructure issues, enabling the project to support automated date processing. **Manual date configuration is no longer required for any feature**, including: page date display, blog post dates, blog date archives, blog list sorting, sitemap.xml (lastmod - SEO improvements), RSS feeds, recently updated section, search ranking, and more
- Added Recent Updated module, see: [Add recent updates module](https://jaywhj.github.io/mkdocs-materialx/setup/adding-recent-updates-module)
    - Displays recently updated documents in descending order of update time, with dynamically refreshed list items
    - Supports multiple flexible layout styles (list, detail, grid)
    - Automatically generates document summaries (no manual configuration needed)
    - Intelligently estimates reading time, supporting all languages (CJK + space-separated languages)
- Refactored the mobile TOC component for seamless NAV and TOC experience on mobile (Better interactive experience)
- Perfectly fixed the issue where swipe gestures would penetrate when the sidebar drawer was active on mobile (severely harmed UX and caused frequent misoperations, unresolved in both Zensical and Material)
- Significantly polished the UX and details on mobile devices
    - Moved the "Back to top" container to the bottom, aligning with natural interaction logic
    - Optimized the show/hide sensitivity of the "Back to top" container
    - Added indent guide lines and active link accent colors for the TOC
- Added the modern Liquid Glass theme, allows setting the topbar background color in the Liquid Glass theme to support backgrounds with different color schemes, see [Topbar style](https://jaywhj.github.io/mkdocs-materialx/setup/changing-the-colors#topbar-style)
- Added code block download & auto-collapse/expand long code blocks features
- For more details, see [Changelog](https://github.com/jaywhj/mkdocs-materialx/releases)

<br />

## Quick Start

1 - Installation:

``` sh
pip install mkdocs-materialx
```

2 - Configure `materialx` theme to mkdocs.yml:

``` yaml
theme:
  name: materialx
```

> [!NOTE]
> The theme name is `materialx`, not material. Everything else is the same as when using material.

3 - Start a live preview server with the following command for automatic open and reload:

**for MkDocs** :

```
mkdocs serve --livereload -o
```

**for ProperDocs** :

```
properdocs serve -o
```

<br />

For detailed installation instructions, configuration options, and a demo, visit [jaywhj.github.io/mkdocs-materialx](https://jaywhj.github.io/mkdocs-materialx/)

<br />

## Chat Group

**Discord**: https://discord.gg/cvTfge4AUy
