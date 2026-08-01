# Harikrishna Sahu

Personal website source for `harikrishnasahu.com`.

## Project Structure

- `src/` contains the Eleventy site source.
- `src/_data/` contains reusable site, project, publication, and experience data.
- `src/writing/` contains blog posts in Markdown.
- `src/assets/` contains CSS and image assets copied to `/assets/`.
- `src/cv/` contains PDF files copied to `/cv/`.

## Local Eleventy Preview

Install dependencies once:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open:

```text
http://localhost:8080/
```

Build the static site:

```bash
npm run build
```

## Search And Discovery

The site generates search/discovery files during the Eleventy build:

- `https://harikrishnasahu.com/sitemap.xml`
- `https://harikrishnasahu.com/robots.txt`
- `https://harikrishnasahu.com/feed.xml`

When adding a post in `src/writing/`, include `title`, `seoTitle`, `summary`, `date`, and `tags` in the front matter. Submit `sitemap.xml` in Google Search Console after publishing major site updates or new writing.
