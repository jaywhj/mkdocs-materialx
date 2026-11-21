
# Blog Usage Demo

MaterialX has always been guided by the philosophy of "**simplicity** and **ease of use**". To that end, we have reworked and optimized the `blog` module.

## Overview

Now you only need to focus on your content when using the blog feature — no overly complicated configuration needed. No frontmatter properties are mandatory: `date`, `authors`, `readtime` are all handled automatically.

!!! quote ""
    === "Before"

        ```markdown title="post.md"
        ---
        date: 2021-09-13
        authors: [Aaron]
        readtime: 15
        description: >
          How we rebuilt client-side search, delivering a better user experience while
          making it faster and smaller at the same time
        categories:
          - Search
        ---
    
        # Chinese search support
        text ...
        ```

    === "Now"

        ```markdown title="post.md"
        # Chinese search support
        text ...
        ```
  
<!-- more -->

## Simplify author settings

Simplified `blog` post author setup and made `.authors.yml` optional.

When `.authors.yml` contains a matching author, the blog uses the full author profile. Otherwise, the author name from the post is used to create a fallback author with a text avatar. Posts without an `authors` value do not render an author.

!!! quote ""
    === "blog/.authors.yml"

        ```yaml
        authors:
          aaron:
            name: Aaron
            avatar: assets/screenshots/aaron-avatar.png
            url: https://github.com/jaywhj/mkdocs-materialx
            email: junewhj@qq.com
            description: Creator
        ```

    === "blog/posts/post1.md"

        ```markdown title="post1.md"
        ---
        authors: [aaron, Frederick, Alexander Wang]
        categories: [General]
        ---

        # Blog Usage Demo

        MaterialX has always been guided by the philosophy of **simplicity** and **ease of use**. 
        To that end, we have reworked and optimized the `blog` module.
        ```

    === "blog/posts/post2.md"

        ```markdown title="post2.md"
        # Blog Usage Demo

        MaterialX has always been guided by the philosophy of **simplicity** and **ease of use**. 
        To that end, we have reworked and optimized the `blog` module.
        ```