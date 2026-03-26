
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
    As a result, to move away from reliance on MkDocs, the team behind the popular mkdocs-material theme framework has discontinued its maintenance and shifted to developing an entirely new alternative project named Zensical. While it features a modern architecture, it is incompatible with the original MkDocs ecosystem (no plugin support), incurs high migration costs (all configurations must be rebuilt from scratch), and still lacks many essential features.
  </p>
  <p>
    To ensure the continued stable operation of existing MkDocs projects and ecosystem, a new community-driven successor to MkDocs has emerged: <a href="https://github.com/ProperDocs/properdocs" target="_blank">ProperDocs</a> (based on MkDocs 1.6.1). It will provide ongoing updates and maintenance while remaining fully compatible with the original MkDocs ecosystem.
  </p>
  <p>
    Similarly, mkdocs-material also has a new successor: <strong>MaterialX</strong> (based on mkdocs-material 9.7.1). It will also receive ongoing updates and maintenance, with full compatibility with the original ecosystem and zero migration costs.
  </p>
  <p>
    <strong>MaterialX</strong> preserves the <strong>rich features</strong> and <strong>stability</strong> of the mkdocs-material project, while delivering <strong>new features</strong> and <strong>broad compatibility</strong>, and will adopt the following brand-new vision and positioning.
  </p>
</details>

<br />

## Differences from Material

| Aspect              |          mkdocs-material           |                       MaterialX                   |
| ------------------- |  --------------------------------  |  -----------------------------------------------  |
| **Latest Version**  |       mkdocs-material-9.7.1        | mkdocs-materialx-10.x <br />(based on mkdocs-material-9.7.1) |
| **Usage**           | mkdocs.yml + theme name `material` | properdocs.yml + new theme name `materialx` <br />everything else is the same as with material |
| **Current Status**  |     Stopped maintenance     |          Active maintenance and updates           |
| **Feature Updates** |      None (with legacy bugs)       | Bug fixes, new features, UX improvements<br />see [Changelog](https://github.com/jaywhj/mkdocs-materialx/releases) |


## Differences from Zensical

| Aspect         |                    Zensical                  |                        MaterialX                  |
| -------------- | -------------------------------------------- | ------------------------------------------------- |
| **Audience**   | Technical developers <br /> Technical documentation | All markdown users <br /> Markdown notes & documentation |
| **Language**   |                      Rust + Python           |                  Python               |
| **Stage**      | Launched a few months ago, in early stages, incomplete basic features | Over a decade old, mature, stable, and rich in features |
| **Usage**      | Uses the new TOML configuration format, all configurations must be rewritten from scratch in the new format | Continues to use YAML format, zero migration cost |
| **Ecosystem**  | New tool built entirely from the ground up. Incompatible with the original MkDocs ecosystem and add-ons | Built on mkdocs-material 9.7.1 <br />Seamlessly compatible with the original tech ecosystem |
| **Extensibility** |  No low-level support, not open enough, no plugin support  |  Fully open source and extensible, with rich plugin support  |
| **Core Focus** | Prioritizes customization and variety, which can lead to configuration bloat and increasing complexity | Prioritizes extreme simplicity, with smarter defaults and automation to lower usage overhead, becoming increasingly lightweight |

## MaterialX Update Highlights

- Added next-generation date & author plugin, see: [Add document dates & authors](https://jaywhj.github.io/mkdocs-materialx/setup/adding-document-dates-authors)
    - Completely resolved the underlying date & time infrastructure issues, enabling fully automated date handling with no manual date configuration required. 
    This includes: page date display / blog post dates / blog categorization by date / blog list sorting / sitemap.xml (SEO enhancement: lastmod) / RSS feeds / Recently Updated section / search ranking, and more
- Added Recent Updated module, see: [Add recent updates module](https://jaywhj.github.io/mkdocs-materialx/setup/adding-recent-updates-module)
    - Displays recently updated documents in descending order of update time, with dynamically refreshed list items
    - Supports multiple flexible layout styles (list, detail, grid)
    - Automatically generates document summaries (no manual configuration needed)
    - Intelligently estimates reading time, supporting all languages (CJK + space-separated languages)
- Refactored the mobile TOC component for seamless NAV and TOC experience on mobile (Zensical has no TOC feature on mobile)
- Perfectly fixed the issue where swipe gestures would penetrate when the sidebar drawer was active on mobile (severely harmed UX and caused frequent misoperations, unresolved in both Zensical and Material)
- Significantly polished the UX and details on mobile devices
    - Moved the "Back to top" container to the bottom, aligning with natural interaction logic
    - Optimized the show/hide sensitivity of the "Back to top" container
    - Added indent guide lines and active link accent colors for the TOC
- Added the modern Liquid Glass theme, consistent with Zensical
- Allow to set topbar background color in Liquid Glass theme, see [Topbar style](https://jaywhj.github.io/mkdocs-materialx/setup/changing-the-colors#topbar-style)
- For more details, see [Changelog](https://github.com/jaywhj/mkdocs-materialx/releases)

<br />

## Quick Start

⓵ Installation:

``` sh
pip install mkdocs-materialx
```

② Configure `materialx` theme to properdocs.yml (mkdocs.yml):

``` yaml
theme:
  name: materialx
```

> [!NOTE]
> The theme name is `materialx`, not material. Everything else is the same as when using material.

③ Start a live preview server with the following command for automatic open and reload:

**for ProperDocs** :

```
properdocs serve -o
```

**for MkDocs** :

```
mkdocs serve --livereload -o
```
<br />

For detailed installation instructions, configuration options, and a demo, visit [jaywhj.github.io/mkdocs-materialx](https://jaywhj.github.io/mkdocs-materialx/)

<br />

## Chat Group

**Discord**: https://discord.gg/cvTfge4AUy

**Wechat**: 

<img src="docs/assets/images/wechat-group.jpg" width="140" />