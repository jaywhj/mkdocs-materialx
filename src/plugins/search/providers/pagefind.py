
import asyncio
import logging
from pathlib import Path
from pagefind.index import PagefindIndex, IndexConfig

log = logging.getLogger("materialx.search.pagefind")


class PagefindProvider:

    name = "pagefind"

    def __init__(self, config, dirty = False):
        self.config = config

    def configure(self, config):
        return

    def add_page(self, context, *, page, config, nav):
        return

    def build(self, config):
        build_pagefind_index(config.site_dir, self.config.pagefind)

    def frontend_config(self):
        return {
            "outputSubdir": self.config.pagefind.get(
                "output_subdir", "search"
            ),
            "options": self.config.pagefind.get("options", {})
        }


def build_pagefind_index(site_dir: str, user_config: dict):
    asyncio.run(_async_build(site_dir, user_config))

async def _async_build(site_dir: str, user_config: dict):
    index_config = {
        key: value for key, value in user_config.items()
        if key != "options"
    }

    # 覆盖用户参数
    final_config = {
        "include_characters": "._",
        "keep_index_url": True,
        "exclude_selectors": ["nav", "footer"],
        **index_config,
    }

    # 防御性处理：移除部分由插件接管的参数
    final_config.pop("output_path", None)
    final_config.pop("site", None)
    final_config.pop("source", None)

    # 设置 output_path (将 output_subdir 转换为 output_path)
    output_subdir = final_config.pop("output_subdir", "search")
    output_path = Path(site_dir) / output_subdir
    final_config["output_path"] = str(output_path)

    # 处理 logfile 路径
    logfile = final_config.get("logfile")
    if logfile:
        final_config["logfile"] = str(output_path / logfile)

    # 实例化 Pagefind 配置参数
    idx_config = IndexConfig(**final_config)

    # 构建索引
    try:
        async with PagefindIndex(config=idx_config) as index:
            await index.add_directory(site_dir)
            # PagefindIndex 在正常结束退出时，会自动触发 write_files
            # await index.write_files()
        log.info(f"Building Pagefind index in: {final_config.get('output_path')}")
    except Exception as e:
        log.error(f"Failed to build Pagefind index: {e}")
        raise
