from .lunr import LunrProvider
from .pagefind import PagefindProvider


def create_search_provider(name, config, dirty = False):
    providers = {
        "lunr": LunrProvider,
        "pagefind": PagefindProvider,
    }
    return providers[name](config, dirty)
