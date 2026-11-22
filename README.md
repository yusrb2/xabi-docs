# xabi Documentation

Static technical documentation for [`xabi`](https://github.com/yusrb2/xabi), a user-space local web development orchestrator for Linux and Windows. This site consists of plain HTML, CSS, and Vanilla JavaScript with no build step or Node.js dependency.

## Repository Layout

```text
xabi-docs/
├── index.html   # Three-column procedural documentation and 19-command CLI reference
├── style.css    # Soft monochrome white-dominant stylesheet with Inter and JetBrains Mono
├── app.js       # OS switcher, completion checklist, terminal simulator, scrollspy, and search filter
├── README.md    # Local preview and GitHub Pages instructions
└── LICENSE      # GNU General Public License v3.0
```

## Local Preview

### Serving with `xabi`

Run the following commands from the root of the `xabi-docs` directory to register the site as a local virtual host:

```sh
xabi up
xabi add xabi-docs
xabi open xabi-docs
```

To enable local HTTPS via `mkcert`:

```sh
xabi tls xabi-docs
```

### Serving with Python HTTP Server

Alternatively, serve the directory on a temporary local port:

```sh
python -m http.server 8080
```

Open `http://localhost:8080` in a browser.

## GitHub Pages Deployment

All asset references in `index.html` use relative paths (`style.css?v=8` and `app.js?v=8`) for direct hosting on GitHub Pages:

1. Open **Settings** in the `yusrb2/xabi-docs` GitHub repository.
2. Navigate to **Pages** in the left sidebar.
3. Under **Build and deployment**, select **GitHub Actions** (or **Deploy from a branch** on `main` at `/ (root)`).
4. Once deployment finishes, the documentation is served at `https://yusrb2.github.io/xabi-docs/`.

## License

Licensed under the [GNU GPL-3.0](LICENSE), matching the main `yusrb2/xabi` repository.
