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

from mkdocs.plugins import BasePlugin

from .config import SearchConfig
from .providers import create_search_provider


class SearchPlugin(BasePlugin[SearchConfig]):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.is_dirty = False
        self.provider = None

    def on_startup(self, *, command, dirty):
        self.is_dirty = dirty

    def on_config(self, config):
        if not self.provider or self.provider.name != self.config.provider:
            self.provider = create_search_provider(
                self.config.provider, self.config, self.is_dirty
            )

        self.provider.config = self.config
        self.provider.is_dirty = self.is_dirty
        self.provider.configure(config)

        frontend_config = {
            "provider": self.provider.name,
            self.provider.name: self.provider.frontend_config(),
        }
        config["extra"]["search_config"] = frontend_config

    def on_page_context(self, context, *, page, config, nav):
        return self.provider.add_page(
            context, page = page, config = config, nav = nav
        )

    def on_post_build(self, *, config):
        return self.provider.build(config)
