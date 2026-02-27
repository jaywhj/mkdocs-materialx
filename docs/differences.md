---
icon: material/vector-difference-ab
---

# Why MaterialX

Since `mkdocs-material` has entered maintenance mode with no new features planned, and its alternative `Zensical` remains immature and incompatible with the existing MkDocs plugin ecosystem, this will disrupt the once-thriving ecosystem. For users with stable, fully-featured sites, migrating to Zensical entails high costs and significant stability risks.

So, is there a way to retain the rich ecosystem and stability of mkdocs-material while also gaining the cutting-edge features like Zensical provides?

The answer is **MaterialX**, which lets you continue to build beautiful documents in a familiar way.

Here's its brand-new vision and positioning:



## MaterialX Roadmap

In my opinion, the beauty of technology lies in enabling more people to effortlessly achieve what was once difficult using the tools you provide.

A great product should strike the perfect balance in feature design, knowing when to stop, instead of overwhelming users with excessive feature options and dazzling configuration items. Let’s be honest, both mkdocs-material and Zensical suffer from over-customization, burdened with overly complex configurations. Who doesn’t end up with hundreds of lines of config? Who hasn’t spent days tinkering with mkdocs-material on their first try?

MaterialX aims to be a **zero-fuss** solution, allowing users to convert everyday notes and documents into professional websites with minimal setup, facilitating easy sharing and collaboration.

Therefore, MaterialX will adhere to the following goals and principles:

- **Goal**: Pursue **accessibility for everyone**. Empowering all users to own their websites, including but not limited to developers, product managers, marketers, and DevOps engineers. Website creation should no longer be exclusive to technical users
- **Principle**: **Extreme ease of use** is the top priority. MaterialX will simplify configurations and feature sets, provide sensible defaults and automated setup, and minimize the cost of configuration and maintenance for users
- **Focus**: **General-purpose features** and **visual presentation**. Future feature selection will lean more toward general-purpose functionality and visual expression, and it will deliver a wider range of content presentation formats, such as graphs, charts, images, audio and video, to bring your content to life
- **Obsession**: **User experience (UX)**. I will pay meticulous attention to interactive and visual details, whether it’s an unnoticeable line spacing adjustment or a simple border design ...



## Differences from Material

| Aspect              |          mkdocs-material           |                       MaterialX                   |
| ------------------- |  --------------------------------  |  -----------------------------------------------  |
| **Latest Version**  |       mkdocs-material-9.7.1        | mkdocs-materialx-10.x <br />(based on mkdocs-material-9.7.1) |
| **Usage**           | Use mkdocs.yml with the theme name `material` | Use mkdocs.yml with the new theme name `materialx`, everything else is the same as when using material |
| **Current Status**  |     Nearing end-of-maintenance     |          Active maintenance and updates           |
| **Feature Updates** |      None (with legacy bugs)       | Bug fixes, new feature additions, UX improvements,<br />see [Changelog](changelog/index.md) |

## Differences from Zensical

| Aspect         |                    Zensical                  |                        MaterialX                  |
| -------------- | -------------------------------------------- | ------------------------------------------------- |
| **Audience**   | Technical developers <br /> Technical documentation | All markdown users <br /> Markdown notes & documents |
| **Language**   |                      Rust                   |                  Python               |
| **Stage**      | Launched a few months ago, in early stages, basic functionality incomplete | Launched for over a decade, mature and stable |
| **Usage**      | Adopt the new TOML configuration format, all configurations in the original mkdocs.yml need to be reconfigured from scratch | Continue to use mkdocs.yml with zero migration cost |
| **Ecosystem**  | Built entirely from scratch, incompatible with all original MkDocs components, future development uncertain | Based on MkDocs & mkdocs-material-9.7.1, fully compatible with MkDocs' rich long-built ecosystem, open and vibrant |
| **Core Focus** | Prioritizes technical customization, with increasingly cumbersome feature configurations and ever-growing complexity in usage | Focuses on universal functions & visual presentation, extreme ease of use as primary principle, evolving to be more lightweight |

Zensical is impressive, but I cannot find a compelling reason to adopt it.

## Key Update Highlights

- Added the modern Liquid Glass theme, consistent with Zensical
- Added the next-gen date and author plugin, see documentation: [Adding Document Dates and Authors](setup/adding-document-dates-authors.md)
- Added the recent updates module, see documentation: [Adding Recent Updates Module](setup/adding-recent-updates-module.md)
- Refactor the TOC for mobile, enabling seamless NAV and TOC experiences on mobile (Zensical has no TOC on mobile)
- Perfectly fixed the issue where swipe events would penetrate when the drawer was active on mobile (Zensical & Material failed to fix)
- Added indentation guide lines and active link accent color for TOC
- Moved the "back-to-top" container to the bottom, aligning with intuitive proximity-based interaction logic
- Allow to set topbar background color in Liquid Glass theme, see [Topbar style](setup/changing-the-colors.md#topbar-style)

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

```
mkdocs serve --livereload -o
```