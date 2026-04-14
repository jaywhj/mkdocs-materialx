---
icon: material/vector-difference-ab
---

# MaterialX

**MaterialX**, the next generation of mkdocs-material, build beautiful sites the way you already know and love, based on `mkdocs-material-9.7.1` and named `X`, it provides ongoing maintenance and updates.

??? desc "Why MaterialX ?"

    The MkDocs project is nearing its end due to personal issues involving its original author. He has ceased updates for MkDocs and intends to release a completely new 2.0 version as a replacement. However, this new version is entirely incompatible with the existing ecosystem. It is an entirely separate project that merely carries the MkDocs name, and an accidental upgrade will result in devastating damage.

    As a result, to move away from reliance on MkDocs, the team behind the popular mkdocs-material theme framework has discontinued its maintenance and shifted to developing an entirely new alternative project named Zensical. While it features a modern architecture, it is incompatible with the original MkDocs ecosystem (no plugin support), incurs high migration costs (all configurations must be rebuilt from scratch), and still lacks many essential features.

    To ensure the continued stable operation of existing MkDocs projects and ecosystem, a new community-driven successor to MkDocs has emerged: [ProperDocs](https://github.com/ProperDocs/properdocs){target="_blank"} (based on MkDocs 1.6.1). It will provide ongoing updates and maintenance while remaining fully compatible with the original MkDocs ecosystem.

    Similarly, mkdocs-material also has a new successor: **MaterialX** (based on mkdocs-material 9.7.1). It will also receive ongoing updates and maintenance, with full compatibility with the original ecosystem and zero migration costs.

    **MaterialX** preserves the **rich features** and **stability** of the mkdocs-material project, while delivering **new features** and **broad compatibility**, and will adopt the following brand-new vision and positioning.

## MaterialX Roadmap

MaterialX aims to be a **simple, zero-fuss** static site generator.

Users can convert their regular notes and docs into professional sites with just light configuration, for easy sharing and communication.

??? desc "Why the focus on simplicity and ease of use ?"

    In my opinion, the beauty of technology lies in enabling more people to effortlessly achieve what was once difficult using the tools you provide.

    A great product should strike the perfect balance in feature design, knowing when to stop, instead of overwhelming users with excessive feature options and dazzling configuration items. Let’s be honest, both mkdocs-material and Zensical suffer from over-customization, burdened with overly complex configurations. Who doesn’t end up with hundreds of lines of config? Who hasn’t spent days tinkering with mkdocs-material on their first try?

Therefore, MaterialX will adhere to the following goals and principles:

- **Goal**: Pursue **accessibility for everyone**. Empowering all users to own their websites, including but not limited to developers, product managers, marketers, and DevOps engineers. Website creation should no longer be exclusive to technical users
- **Principle**: **Extreme ease of use** is the top priority. MaterialX will simplify configurations and feature sets, provide sensible defaults and automated setup, and minimize the cost of configuration and usage for users
- **Focus**: **General-purpose features** and **visual presentation**. Future feature choices will focus more on general-purpose features and visual presentation, and it will deliver a wider range of content presentation formats, such as graphs, charts, images, audio and video, to bring your content to life
- **Obsession**: **User experience (UX)**. It will pay meticulous attention to interactive and visual details, whether it’s an unnoticeable line spacing adjustment or a simple border design ...



## Differences from Material

| Aspect              |          mkdocs-material           |                       MaterialX                   |
| ------------------- |  --------------------------------  |  -----------------------------------------------  |
| **Latest Version**  |       mkdocs-material-9.7.1        | mkdocs-materialx-10.x <br />(based on mkdocs-material-9.7.1) |
| **Usage**           | mkdocs.yml + theme name `material` | mkdocs.yml + new theme name `materialx` <br />everything else is the same as with material |
| **Current Status**  |     Stopped maintenance     |          Active maintenance and updates           |
| **Feature Updates** |      None (with legacy bugs)       | Bug fixes, new features, UX improvements<br />see [Changelog](changelog/index.md){target="_blank"} |

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

- Added next-generation date & author plugin, see: [Adding Document Dates and Authors](setup/adding-document-dates-authors.md){target="_blank"}
    - Completely resolved date and time infrastructure issues, enabling the project to support automated date processing. Manual date configuration is no longer required for any feature, including: page date display, blog post dates, blog date archives, blog list sorting, sitemap.xml (lastmod - SEO improvements), RSS feeds, recently updated section, search ranking, and more
- Added Recent Updated module, see: [Adding Recent Updates Module](setup/adding-recent-updates-module.md){target="_blank"}
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
- Added the modern Liquid Glass theme, allows setting the topbar background color in this theme to support backgrounds with different color schemes, see [Topbar style](setup/changing-the-colors.md#topbar-style){target="_blank"}
- For more details, see [Changelog](changelog/index.md){target="_blank"}

## Quick Start

Installation:

``` sh
pip install mkdocs-materialx
```

Configure `materialx` theme to mkdocs.yml:

``` yaml
theme:
  name: materialx
```

!!! note

    The theme name is `materialx`, not material. Everything else is the same as when using material.

Start a live preview server with the following command for automatic open and reload:

=== "MkDocs"

    ```
    mkdocs serve --livereload -o
    ```

=== "ProperDocs"

    ```
    properdocs serve -o
    ```
