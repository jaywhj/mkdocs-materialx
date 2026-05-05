import re
import shlex
from typing import Iterable
from markdown import Markdown
from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor


_FENCE_OPEN_RE = re.compile(
    r'^([ \t]*)(`{3,}|~{3,})([^\n`]*)$'
)
_FENCE_CLOSE_RE = re.compile(
    r'^([ \t]*)(`{3,}|~{3,})[ \t]*$'
)
_ATTR_RE = re.compile(r'\{([^}]*)\}')


# -----------------------------------------------------------------------------
# Preprocessor
# -----------------------------------------------------------------------------

class CodeDownloadPreprocessor(Preprocessor):

    def run(self, lines: Iterable[str]):
        result: list[str] = []

        in_fence = False
        fence_char = ""
        fence_len = 0

        for line in lines:
            if not in_fence:
                stripped = line.lstrip(" \t")
                if not stripped or stripped[0] not in ("`", "~"):
                    result.append(line)
                    continue

                match = _FENCE_OPEN_RE.match(line)
                if not match:
                    result.append(line)
                    continue

                indent, fence, trailing = match.groups()
                info = trailing.strip()

                result.append(_normalize_fence_opening(indent, fence, info))

                in_fence = True
                fence_char = fence[0]
                fence_len = len(fence)
                continue

            # inside fence
            result.append(line)

            stripped = line.lstrip(" \t")
            if stripped and stripped[0] == fence_char:
                match = _FENCE_CLOSE_RE.match(line)
                if match:
                    _, fence = match.groups()
                    if fence[0] == fence_char and len(fence) >= fence_len:
                        in_fence = False

        return result

# -----------------------------------------------------------------------------
# Extension
# -----------------------------------------------------------------------------

class CodeDownloadExtension(Extension):

    def extendMarkdown(self, md: Markdown):
        md.registerExtension(self)
        md.preprocessors.register(
            CodeDownloadPreprocessor(md),
            "code_download",
            35
        )

# -----------------------------------------------------------------------------
# Core
# -----------------------------------------------------------------------------

def _normalize_fence_opening(indent: str, fence: str, info: str) -> str:
    if not info:
        return f"{indent}{fence}"

    if "data-download" not in info:
        return f"{indent}{fence} {info}"

    # 按顺序解析 tokens
    tokens: list[str] = []
    pos = 0
    try:
        for m in _ATTR_RE.finditer(info):
            # 非 attr_list 部分
            before = info[pos:m.start()].strip()
            if before:
                tokens.extend(shlex.split(before, posix=True))

            # attr_list 内部
            inner = m.group(1)
            if inner:
                tokens.extend(shlex.split(inner, posix=True))

            pos = m.end()

        # 尾部
        tail = info[pos:].strip()
        if tail:
            tokens.extend(shlex.split(tail, posix=True))
    except ValueError:
        return f"{indent}{fence} {info}"

    if not tokens:
        return f"{indent}{fence} {info}"

    # language 识别
    language = None
    if tokens and _looks_like_language(tokens[0]):
        language = tokens[0]
        tokens = tokens[1:]

    # 构建 attrs
    attrs: list[str] = []
    has_download = False

    for token in tokens:
        key, value = _split_token(token)

        if key == "data-download":
            has_download = True
            value = _normalize_data_download(value)

        if value is None:
            if key and key[0] in ".#":
                attrs.append(key)
                continue
            value = key

        attrs.append(f"{key}=\"{_escape_attr(value)}\"")

    if not has_download:
        return f"{indent}{fence} {info}"

    # 统一输出 attr_list
    parts: list[str] = []
    if language:
        parts.append(f".{language}")
    parts.extend(attrs)

    return f"{indent}{fence} {{ {' '.join(parts)} }}"

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

def _looks_like_language(token: str) -> bool:
    return (
        "=" not in token and
        not token.startswith((".", "#")) and
        not token.startswith("data-") and
        "{" not in token and
        "}" not in token
    )

def _split_token(token: str) -> tuple[str, str | None]:
    if "=" not in token:
        return token, None
    key, value = token.split("=", 1)
    return key, value.strip('"\'')

def _normalize_data_download(value: str | None) -> str:
    if value not in (None, "", "data-download"):
        return value
    return "blob"

def _escape_attr(value: str) -> str:
    return value.replace("\\", "\\\\").replace("\"", "\\\"")

# -----------------------------------------------------------------------------

def makeExtension(**kwargs):
    return CodeDownloadExtension(**kwargs)