---
icon: material/source-fork
---

# Adding a git repository

If your documentation is related to source code, MaterialX for MkDocs provides
the ability to display information to the project's repository as part of the
static site, including stars and forks. Furthermore, the
[date of last update and creation], as well as [contributors] can be shown.

## Configuration

### Repository

<!-- md:version 0.1.0 -->
<!-- md:default none -->

In order to display a link to the repository of your project as part of your
documentation, set [`repo_url`][repo_url] in `mkdocs.yml` to the public URL of
your repository, e.g.:

``` yaml
repo_url: https://github.com/jaywhj/mkdocs-materialx
```

The link to the repository will be rendered next to the search bar on big
screens and as part of the main navigation drawer on smaller screen sizes.

Additionally, for public repositories hosted on [GitHub] or [GitLab], the
latest release tag[^1], as well as the number of stars and forks, are
automatically requested and rendered.

  [^1]:
    Unfortunately, GitHub only provides an API endpoint to obtain the [latest
    release] - not the latest tag. Thus, make sure to [create a release] (not
    pre-release) for the latest tag you want to display next to the number of
    stars and forks. For GitLab, although it is possible to get a [list of tags
    sorted by update time], the [equivalent API endpoint] is used. So, make sure
    you also [create a release for GitLab repositories].

  [repo_url]: https://www.mkdocs.org/user-guide/configuration/#repo_url
  [latest release]: https://docs.github.com/en/rest/reference/releases#get-the-latest-release
  [create a release]: https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release
  [list of tags sorted by update time]: https://docs.gitlab.com/ee/api/tags.html#list-project-repository-tags
  [equivalent API endpoint]: https://docs.gitlab.com/ee/api/releases/#get-the-latest-release
  [create a release for GitLab repositories]: https://docs.gitlab.com/ee/user/project/releases/#create-a-release

#### Repository name

<!-- md:version 0.1.0 -->
<!-- md:default _automatically set to_ `GitHub`, `GitLab` _or_ `Bitbucket` -->

MkDocs will infer the source provider by examining the URL and try to set the
_repository name_ automatically. If you wish to customize the name, set
[`repo_name`][repo_name] in `mkdocs.yml`:

``` yaml
repo_name: jaywhj/mkdocs-materialx
```

  [repo_name]: https://www.mkdocs.org/user-guide/configuration/#repo_name

#### Repository icon

<!-- md:version 5.0.0 -->
<!-- md:default computed -->

While the default repository icon is a generic git icon, it can be set to
any icon bundled with the theme by referencing a valid icon path in
`mkdocs.yml`:

``` yaml
theme:
  icon:
    repo: fontawesome/brands/git-alt # (1)!
```

1.  Enter a few keywords to find the perfect icon using our [icon search] and
    click on the shortcode to copy it to your clipboard:

    <div class="mdx-iconsearch" data-mdx-component="iconsearch">
      <input class="md-input md-input--stretch mdx-iconsearch__input" placeholder="Search icon" data-mdx-component="iconsearch-query" value="git" />
      <div class="mdx-iconsearch-result" data-mdx-component="iconsearch-result" data-mdx-mode="file">
        <div class="mdx-iconsearch-result__meta"></div>
        <ol class="mdx-iconsearch-result__list"></ol>
      </div>
    </div>

Some popular choices:

- :fontawesome-brands-git: – `fontawesome/brands/git`
- :fontawesome-brands-git-alt: – `fontawesome/brands/git-alt`
- :fontawesome-brands-github: – `fontawesome/brands/github`
- :fontawesome-brands-github-alt: – `fontawesome/brands/github-alt`
- :fontawesome-brands-gitlab: – `fontawesome/brands/gitlab`
- :fontawesome-brands-gitkraken: – `fontawesome/brands/gitkraken`
- :fontawesome-brands-bitbucket: – `fontawesome/brands/bitbucket`
- :fontawesome-solid-trash: – `fontawesome/solid/trash`

  [icon search]: ../reference/icons-emojis.md#search

#### Code actions

<!-- md:version 9.0.0 -->
<!-- md:feature -->

If the [repository URL] points to a valid [GitHub], [GitLab] or [Bitbucket]
repository, [MkDocs] provides a setting called [`edit_uri`][edit_uri], which
resolves to the subfolder where your documentation is hosted.

If your default branch is called `main`, change the setting to:

``` yaml
edit_uri: edit/main/docs/
```

After making sure that `edit_uri` is correctly configured, buttons for code
actions can be added. Two types of code actions are supported: `edit` and `view`
(GitHub only):

=== ":material-file-edit-outline: Edit this page"

    ``` yaml
    theme:
      features:
        - content.action.edit
    ```

=== ":material-file-eye-outline: View source of this page"

    ``` yaml
    theme:
      features:
        - content.action.view
    ```

The icon of the edit and view buttons can be changed with the following lines:

``` yaml
theme:
  icon:
    edit: material/pencil # (1)!
    view: material/eye
```

1.  Enter a few keywords to find the perfect icon using our [icon search] and
    click on the shortcode to copy it to your clipboard:

    <div class="mdx-iconsearch" data-mdx-component="iconsearch">
      <input class="md-input md-input--stretch mdx-iconsearch__input" placeholder="Search icon" data-mdx-component="iconsearch-query" value="material pencil" />
      <div class="mdx-iconsearch-result" data-mdx-component="iconsearch-result" data-mdx-mode="file">
        <div class="mdx-iconsearch-result__meta"></div>
        <ol class="mdx-iconsearch-result__list"></ol>
      </div>
    </div>

  [repository URL]: #repository
  [GitHub]: https://github.com/
  [GitLab]: https://about.gitlab.com/
  [Bitbucket]: https://bitbucket.org/
  [MkDocs]: https://www.mkdocs.org
  [edit_uri]: https://www.mkdocs.org/user-guide/configuration/#edit_uri

### Document dates & authors

  [date of last update and creation]: #document-dates-authors
  [contributors]: #document-contributors

<!-- md:version 10.0.4 -->
<!-- md:plugin [document-dates] -->

You can add date and author information to your documents via the next-generation Date & Author plugin [document-dates].

![render](../assets/screenshots/document-dates.gif)

For more details: [Date & authors](adding-document-dates-authors.md)

  [document-dates]: ../plugins/date-author.md

### Document contributors

<!-- md:version 9.5.0 -->
<!-- md:plugin [git-committers] -->
<!-- md:flag experimental -->

The [git-committers][^2] plugin renders the GitHub avatars of all contributors,
linking to their GitHub profiles at the bottom of each page. As always, it can
be installed with `pip`:

  [^2]:
    We currently recommend using a fork of the [git-committers] plugin, as it
    contains many improvements that have not yet been merged back into the
    original plugin. See byrnereese/mkdocs-git-committers-plugin#12 for more
    information.

```
pip install mkdocs-git-committers-plugin-2
```

Then, add the following lines to `mkdocs.yml`:

``` yaml
plugins:
  - git-committers:
      repository: jaywhj/mkdocs-materialx
      branch: main
```

The following configuration options are supported:

<!-- md:option git-committers.enabled -->

:   <!-- md:default `true` --> This option specifies whether
    the plugin is enabled when building your project. If you want to switch
    the plugin off, e.g. for local builds, use an [environment variable]:

    ``` yaml
    plugins:
      - git-committers:
          enabled: !ENV [CI, false]
    ```

<!-- md:option git-committers.repository -->

:   <!-- md:default none --> <!-- md:flag required -->
    This property must be set to the slug of the repository that contains your
    documentation. The slug must follow the pattern `<username>/<repository>`:

    ``` yaml
    plugins:
      - git-committers:
          repository: jaywhj/mkdocs-materialx
    ```

<!-- md:option git-committers.branch -->

:   <!-- md:default `master` --> This property should be set to
    the branch of the repository from which to retrieve the contributors. To use the `main` branch:

    ``` yaml
    plugins:
      - git-committers:
          branch: main
    ```

The other configuration options of this extension are not officially supported
by MaterialX for MkDocs, which is why they may yield unexpected results. Use
them at your own risk.

  [git-committers]: https://github.com/ojacques/mkdocs-git-committers-plugin-2
  [environment variable]: https://www.mkdocs.org/user-guide/configuration/#environment-variables
