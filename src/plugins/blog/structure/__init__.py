# Copyright (c) 2016-2025 Martin Donath <martin.donath@squidfunk.com>

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to
# deal in the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
# sell copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
# IN THE SOFTWARE.

from __future__ import annotations

import logging
import os
import re
import yaml

from copy import copy, deepcopy
from html import escape
from markdown import Markdown
from datetime import datetime
from material.plugins.blog.author import Author
from material.plugins.meta.plugin import MetaPlugin
from mkdocs.config.defaults import MkDocsConfig
from mkdocs.exceptions import PluginError
from mkdocs.structure.files import File, Files
from mkdocs.structure.nav import Link, Section
from mkdocs.structure.pages import AMP_SUBSTITUTE, Page, _RelativePathTreeprocessor
from mkdocs.structure.toc import get_toc
from mkdocs.utils import get_relative_url
from urllib.parse import unquote, urlsplit, urlunsplit
from uuid import uuid4
from mkdocs.utils.meta import YAML_RE
from re import Match
from yaml import SafeLoader

from .config import PostConfig
from .markdown import ExcerptTreeprocessor

# -----------------------------------------------------------------------------
# Cached excerpt link handling

class _ExcerptRelativePathTreeprocessor(_RelativePathTreeprocessor):
    """Resolve links once, but defer their view-relative URLs until rendering."""

    def __init__(self, file: File, files: Files, config: MkDocsConfig, reference_id: str):
        super().__init__(file, files, config)
        self.reference_id = reference_id
        self.references: dict[str, tuple[str, str, str]] = {}

    def path_to_url(self, url: str) -> str:
        scheme, netloc, path, query, anchor = urlsplit(url)
        target_file = None
        if (
            not scheme
            and not netloc
            and not url.startswith(("/", "\\"))
            and path
            and AMP_SUBSTITUTE not in url
        ):
            path = unquote(path)
            target_uri = next(
                self._possible_target_uris(self.file, path, self.config.use_directory_urls)
            )
            target_file = self.files.get_file_from_path(target_uri)

        # Keep MkDocs' normal resolution, validation warnings and anchor tracking.
        resolved = super().path_to_url(url)
        if target_file is None:
            return resolved

        token = f"mkxexcerpt-path-{self.reference_id}://{len(self.references)}"
        self.references[token] = (target_file.url, query, anchor)
        return token

def _rebase_excerpt_links(
    html: str,
    page: Page,
    references: dict[str, tuple[str, str, str] | tuple[str, str]],
) -> str:
    """Rebase all cached link placeholders in one pass over the HTML."""
    def replace(match: re.Match):
        url, *parts = references[match.group(0)]
        path = get_relative_url(url, page.url)
        if len(parts) == 1:
            resolved = path + parts[0]
        else:
            resolved = urlunsplit(("", "", path, parts[0], parts[1]))
        return escape(resolved, quote=True)

    return re.sub(r"mkxexcerpt-(?:anchor|path)-[0-9a-f]{32}://\d+", replace, html)

# -----------------------------------------------------------------------------
# Classes
# -----------------------------------------------------------------------------

# Post
class Post(Page):

    # Initialize post - posts are never listed in the navigation, which is why
    # they will never include a title that was manually set, so we can omit it
    def __init__(self, file: File, config: MkDocsConfig, created: datetime):
        super().__init__(None, file, config)

        # Resolve path relative to docs directory
        docs = os.path.relpath(config.docs_dir)
        path = os.path.relpath(file.abs_src_path, docs)

        # Read contents and metadata immediately
        with open(file.abs_src_path, encoding = "utf-8-sig") as f:
            self.markdown = f.read()

            # Sadly, MkDocs swallows any exceptions that occur during parsing.
            # Since we want to provide the best possible user experience, we
            # need to catch errors early and display them nicely. We decided to
            # drop support for MkDocs' MultiMarkdown syntax, because it is not
            # correctly implemented anyway. When using MultiMarkdown syntax, all
            # date formats are returned as strings and list are not properly
            # supported. Thus, we just use the relevants parts of `get_data`.
            match: Match = YAML_RE.match(self.markdown)
            if match:
                try:
                    self.meta = yaml.load(match.group(1), SafeLoader) or {}
                    self.markdown = self.markdown[match.end():].lstrip("\n")
                except Exception as e:
                    raise PluginError(
                        f"Error reading metadata of post '{path}' in '{docs}':\n"
                        f"{e}"
                    )

            # created date from plugin 'document-dates' API
            self.meta.setdefault("date", created)

            # Hack: if the meta plugin is registered, we need to move the call
            # to `on_page_markdown` here, because we need to merge the metadata
            # of the post with the metadata of any meta files prior to creating
            # the post configuration. To our current knowledge, it's the only
            # way to allow posts to receive metadata from meta files, because
            # posts must be loaded prior to constructing the navigation in
            # `on_files` but the meta plugin first runs in `on_page_markdown`.
            plugin: MetaPlugin = config.plugins.get(f"{config.theme.name}/meta")
            if plugin:
                plugin.on_page_markdown(
                    self.markdown, page = self, config = config, files = None
                )

        # Initialize post configuration, but remove all keys that this plugin
        # doesn't care about, or they will be reported as invalid configuration
        self.config: PostConfig = PostConfig(file.abs_src_path)
        self.config.load_dict({
            key: self.meta[key] for key in (
                set(self.meta.keys()) &
                set(self.config.keys())
            )
        })

        # Validate configuration and throw if errors occurred
        errors, warnings = self.config.validate()
        for _, w in warnings:
            log.warning(w)
        for k, e in errors:
            raise PluginError(
                f"Error reading metadata '{k}' of post '{path}' in '{docs}':\n"
                f"{e}"
            )

        # Excerpts are subsets of posts that are used in pages like archive and
        # category views. They are not rendered as standalone pages, but are
        # rendered in the context of a view. Each post has a dedicated excerpt
        # instance which is reused when rendering views.
        self.excerpt: Excerpt = None

        # Initialize authors and actegories
        self.authors: list[Author] = []
        self.categories: list[Category] = []

        # Ensure template is set or use default
        self.meta.setdefault("template", "blog-post.html")

        # Ensure template hides navigation
        self.meta["hide"] = self.meta.get("hide", [])
        if "navigation" not in self.meta["hide"]:
            self.meta["hide"].append("navigation")

    # The contents and metadata were already read in the constructor (and not
    # in `read_source` as for pages), so this function must be set to a no-op
    def read_source(self, config: MkDocsConfig):
        pass

# -----------------------------------------------------------------------------

# Excerpt
class Excerpt(Page):

    # Initialize an excerpt for the given post - we create the Markdown parser
    # when intitializing the excerpt in order to improve rendering performance
    # for excerpts, as they are reused across several different views, because
    # posts might be referenced from multiple different locations
    def __init__(self, post: Post, config: MkDocsConfig, files: Files):
        self.file = copy(post.file)
        self.post = post
        self._reference_id = uuid4().hex

        # Set canonical URL, or we can't print excerpts when debugging the
        # blog plugin, as the `abs_url` property would be missing
        self._set_canonical_url(config.site_url)

        # Initialize configuration and metadata
        self.config = post.config
        self.meta   = post.meta

        # Initialize authors and categories - note that views usually contain
        # subsets of those lists, which is why we need to manage them here
        self.authors: list[Author] = []
        self.categories: list[Category] = []

        # Initialize content after separator - allow template authors to render
        # posts inline or to provide a link to the post's page
        self.more = None

        # Initialize parser - note that we need to patch the configuration,
        # more specifically the table of contents extension
        config = _patch(config)
        self.md = Markdown(
            extensions = config.markdown_extensions,
            extension_configs = config.mdx_configs,
        )

        # Register excerpt tree processor - this processor resolves anchors to
        # posts from within views, so they point to the correct location
        self.md.treeprocessors.register(
            ExcerptTreeprocessor(post, reference_id = self._reference_id),
            "excerpt",
            0
        )

        # Register relative path tree processor - this processor resolves links
        # to other pages and assets, and is used by MkDocs itself
        self.md.treeprocessors.register(
            _ExcerptRelativePathTreeprocessor(self.file, files, config, self._reference_id),
            "relpath",
            1
        )

        self._rendered_content: str | None = None
        self._rendered_more: str | None = None
        self._rendered_toc = None
        self._render_references: dict[str, tuple[str, str, str] | tuple[str, str]] = {}

    # Render Markdown once per excerpt, then materialize a view-specific copy.
    def render(self, page: Page, separator: str):
        if self._rendered_content is None:
            # Resolve the Markdown once against the post's canonical file URL.
            self.file.url = self.post.url
            self.md.reset()
            self.markdown = self.post.markdown
            if not self.post._title_from_render:
                self.markdown = "\n\n".join([f"# {self.post.title}", self.markdown])

            html = self.md.convert(self.markdown)
            html, *more = html.split(separator, 1)
            self._rendered_content = html
            self._rendered_more = more[0] if more else None
            self._rendered_toc = get_toc(getattr(self.md, "toc_tokens", []))

            excerpt_processor: ExcerptTreeprocessor = self.md.treeprocessors[
                self.md.treeprocessors.get_index_for_name("excerpt")
            ]
            relpath_processor: _ExcerptRelativePathTreeprocessor = self.md.treeprocessors[
                self.md.treeprocessors.get_index_for_name("relpath")
            ]
            self._render_references = {
                **excerpt_processor.references,
                **relpath_processor.references,
            }

        # Return an independent Page-like object so content, URLs and TOC data
        # from one view cannot be overwritten by rendering another view.
        rendered = copy(self)
        rendered.file = copy(self.file)
        rendered.file.url = self.post.url
        rendered.content = _rebase_excerpt_links(
            self._rendered_content, page, self._render_references
        )
        rendered.more = self._rendered_more
        if rendered.more is not None:
            rendered.more = _rebase_excerpt_links(
                rendered.more, page, self._render_references
            )
        rendered.toc = deepcopy(self._rendered_toc)
        return rendered

# -----------------------------------------------------------------------------

# View
class View(Page):

    # Parent view
    parent: View | Section

    # Initialize view
    def __init__(self, name: str | None, file: File, config: MkDocsConfig):
        super().__init__(None, file, config)

        # Initialize name of the view - note that views never pass a title to
        # the parent constructor, so the author can always override the title
        # that is used for rendering. However, for some purposes, like for
        # example sorting, we need something to compare.
        self.name = name

        # Initialize posts and views
        self.posts: list[Post] = []
        self.views: list[View] = []

        # Initialize pages for pagination
        self.pages: list[View] = []

    # Set necessary metadata
    def read_source(self, config: MkDocsConfig):
        super().read_source(config)

        # Ensure template is set or use default
        self.meta.setdefault("template", "blog.html")

# -----------------------------------------------------------------------------

# Archive view
class Archive(View):
    pass

# -----------------------------------------------------------------------------

# Category view
class Category(View):
    pass

# -----------------------------------------------------------------------------

# Profile view
class Profile(View):
    pass

# -----------------------------------------------------------------------------

# Reference
class Reference(Link):

    # Initialize reference - this is essentially a crossover of pages and links,
    # as it inherits the metadata of the page and allows for anchors
    def __init__(self, title: str, url: str):
        super().__init__(title, url)
        self.meta = {}

# -----------------------------------------------------------------------------
# Helper functions
# -----------------------------------------------------------------------------

# Patch configuration
def _patch(config: MkDocsConfig):
    config = copy(config)

    # Copy parts of configuration that needs to be patched
    config.validation          = copy(config.validation)
    config.validation.links    = copy(config.validation.links)
    config.markdown_extensions = copy(config.markdown_extensions)
    config.mdx_configs         = copy(config.mdx_configs)

    # Make sure that the author did not add another instance of the table of
    # contents extension to the configuration, as this leads to weird behavior
    if "markdown.extensions.toc" in config.markdown_extensions:
        config.markdown_extensions.remove("markdown.extensions.toc")

    # In order to render excerpts for posts, we need to make sure that the
    # table of contents extension is appropriately configured
    config.mdx_configs["toc"] = {
        **config.mdx_configs.get("toc", {}),
        **{
            "anchorlink": True,        # Render headline as clickable
            "baselevel": 2,            # Render h1 as h2 and so forth
            "permalink": False,        # Remove permalinks
            "toc_depth": 2             # Remove everything below h2
        }
    }

    # Additionally, we disable link validation when rendering excerpts, because
    # invalid links have already been reported when rendering the page
    links = config.validation.links
    links.not_found = logging.DEBUG
    links.absolute_links = logging.DEBUG
    links.unrecognized_links = logging.DEBUG

    # Return patched configuration
    return config

# -----------------------------------------------------------------------------
# Data
# -----------------------------------------------------------------------------

# Set up logging
log = logging.getLogger("mkdocs.material.blog")
