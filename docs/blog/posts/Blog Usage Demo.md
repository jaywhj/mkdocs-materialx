---
authors: [aaron]
categories: [General]
---

# Blog Usage Demo

MaterialX has always been guided by the philosophy of "**simplicity** and **ease of use**". To that end, we have reworked and optimized the `blog` module.

Now you only need to focus on your content when using the blog feature — no overly complicated configuration needed. No frontmatter properties are mandatory: `date`, `authors`, `readtime` are all handled automatically.



!!! quote ""
    === "Now"

        ``` title="post.md"
        # Chinese search support
        正文 ing ...
        ```
    
    === "Before"
        ``` title="post.md"
        ---
        date: 2021-09-13
        authors: [squidfunk]
        readtime: 15
        description: >
          How we rebuilt client-side search, delivering a better user experience while
          making it faster and smaller at the same time
        categories:
          - Search
          - Performance
        ---
    
        # Chinese search support
        正文 ing ...
        ```

