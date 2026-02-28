---
icon: octicons/desktop-download-24
---

# Installation

MaterialX for MkDocs is a powerful documentation framework:

- Born for documents, yet beyond documents
- Accessible to everyone, extremely easy to use
- Modern, lightweight, customizable, responsive

You can install it in the following ways.

## with pip

MaterialX for MkDocs is published as a [Python package] and can be installed with `pip`, ideally by using a [virtual environment]. 

Open up a terminal and install MaterialX for MkDocs with:

=== "Latest"

    ```
    pip install mkdocs-materialx
    ```

=== "Pin"

    ```
    pip install mkdocs-materialx==10.0.9
    ```

=== "Upgrade"

    ```
    pip install --upgrade mkdocs-materialx
    ```

This will automatically install compatible versions of all dependencies:
[MkDocs], [Markdown], [Pygments] and [Python Markdown Extensions]. MaterialX for MkDocs always strives to support the latest versions, so there's no need to install those packages separately.

  [Python package]: https://pypi.org/project/mkdocs-materialx/
  [virtual environment]: https://realpython.com/what-is-pip/#using-pip-in-a-python-virtual-environment
  [Markdown]: https://python-markdown.github.io/
  [Pygments]: https://pygments.org/
  [Python Markdown Extensions]: https://facelessuser.github.io/pymdown-extensions/

## with docker

The official [Docker image] is a great way to get up and running in a few
minutes, as it comes with all dependencies pre-installed. Open up a terminal
and pull the image with:

=== "Latest"

    ```
    docker pull squidfunk/mkdocs-material
    ```

=== "Pin"

    ```
    docker pull squidfunk/mkdocs-material:9.7.1
    ```

The following plugins are bundled with the Docker image:

- [mkdocs-minify-plugin]
- [mkdocs-redirects]

  [Docker image]: https://hub.docker.com/r/squidfunk/mkdocs-material/
  [mkdocs-minify-plugin]: https://github.com/byrnereese/mkdocs-minify-plugin
  [mkdocs-redirects]: https://github.com/datarobot/mkdocs-redirects

### Add more plugins

Material for MkDocs only bundles selected plugins in order to keep the size of the official image small. If the plugin you want to use is not included, you can add them easily. Create a `Dockerfile` and extend the official image:

``` Dockerfile title="Dockerfile"
FROM squidfunk/mkdocs-material:9.7.1
RUN pip install mkdocs-materialx
RUN pip install mkdocs-glightbox
```

### For MaterialX

MaterialX does not yet provide an official Docker image, as a temporary solution, you can derive a custom image from `mkdocs-material`.

> This approach reuses the official `mkdocs-material` image and installs MaterialX on top of it.

#### Create a Dockerfile

```dockerfile title="Dockerfile" hl_lines="3"
FROM squidfunk/mkdocs-material:9.7.1

RUN pip install mkdocs-materialx

# Install additional plugins if needed
# RUN pip install mkdocs-glightbox ...
```

#### Build the image

```
docker build -t materialx .
```

#### Run the container

```
docker run -p 8000:8000 -v ${PWD}:/docs materialx
```

!!! info

    This is a temporary workaround, an official MaterialX Docker image will be provided in the future.

## with git

You can also clone the source code from a GitHub repo via `git clone` and install it locally:

```
git clone https://github.com/jaywhj/mkdocs-materialx.git
```

Next, install it with the following command:

```
pip install -e mkdocs-materialx
```

  [GitHub]: https://github.com/jaywhj/mkdocs-materialx
