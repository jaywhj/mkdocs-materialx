---
icon: octicons/desktop-download-24
---

# Getting started

MaterialX for MkDocs is a powerful documentation framework on top of [MkDocs],
a static site generator, you can install MaterialX for MkDocs with [`pip`][pip].

  [MkDocs]: https://www.mkdocs.org
  [pip]: #with-pip

## Installation

### with pip <small>recommended</small> { #with-pip data-toc-label="with pip" }

MaterialX for MkDocs is published as a [Python package] and can be installed with
`pip`, ideally by using a [virtual environment]. Open up a terminal and install
MaterialX for MkDocs with:

=== "Latest"

    ``` sh
    pip install mkdocs-materialx
    ```

=== "10.x"

    ``` sh
    pip install mkdocs-materialx=="10.*" # (1)!
    ```

    1.  MaterialX for MkDocs uses [semantic versioning][^2], which is why it's a
        good idea to limit upgrades to the current major version.

        This will make sure that you don't accidentally [upgrade to the next
        major version], which may include breaking changes that silently corrupt
        your site. Additionally, you can use `pip freeze` to create a lockfile,
        so builds are reproducible at all times:

        ```
        pip freeze > requirements.txt
        ```

        Now, the lockfile can be used for installation:

        ```
        pip install -r requirements.txt
        ```

  [^2]:
    Note that improvements of existing features are sometimes released as
    patch releases, like for example improved rendering of content tabs, as
    they're not considered to be new features.

This will automatically install compatible versions of all dependencies:
[MkDocs], [Markdown], [Pygments] and [Python Markdown Extensions]. MaterialX for MkDocs always strives to support the latest versions, so there's no need to install those packages separately.

---

:fontawesome-brands-youtube:{ style="color: #EE0F0F" }
__[How to set up Material for MkDocs]__ by @james-willett – :octicons-clock-24:
27m – Learn how to create and host a documentation site using Material for
MkDocs on GitHub Pages in a step-by-step guide.

  [How to set up Material for MkDocs]: https://www.youtube.com/watch?v=xlABhbnNrfI

---

!!! tip

    If you don't have prior experience with Python, we recommend reading
    [Using Python's pip to Manage Your Projects' Dependencies], which is a
    really good introduction on the mechanics of Python package management and
    helps you troubleshoot if you run into errors.

  [Python package]: https://pypi.org/project/mkdocs-materialx/
  [virtual environment]: https://realpython.com/what-is-pip/#using-pip-in-a-python-virtual-environment
  [semantic versioning]: https://semver.org/
  [upgrade to the next major version]: upgrade.md
  [Markdown]: https://python-markdown.github.io/
  [Pygments]: https://pygments.org/
  [Python Markdown Extensions]: https://facelessuser.github.io/pymdown-extensions/
  [Using Python's pip to Manage Your Projects' Dependencies]: https://realpython.com/what-is-pip/

### with git

MaterialX for MkDocs can be directly used from [GitHub] by cloning the
repository into a subfolder of your project root which might be useful if you
want to use the very latest version:

```
git clone https://github.com/jaywhj/mkdocs-materialx.git
```

Next, install the theme and its dependencies with:

```
pip install -e mkdocs-materialx
```

  [GitHub]: https://github.com/jaywhj/mkdocs-materialx
