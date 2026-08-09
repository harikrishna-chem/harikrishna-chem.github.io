const siteTimeZone = "America/Los_Angeles";

function bibtexUrlForPublication(url) {
  const value = String(url || "");
  const doiMatch = value.match(/^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i);
  if (doiMatch) {
    return `https://api.crossref.org/works/${doiMatch[1]}/transform/application/x-bibtex`;
  }

  const arxivMatch = value.match(/^https?:\/\/arxiv\.org\/abs\/(.+)$/i);
  if (arxivMatch) {
    return `https://arxiv.org/bibtex/${arxivMatch[1]}`;
  }

  const aclMatch = value.match(/^https?:\/\/aclanthology\.org\/([^/]+)\/?$/i);
  if (aclMatch) {
    return `https://aclanthology.org/${aclMatch[1]}.bib`;
  }

  return "";
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/cv": "cv" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  eleventyConfig.addFilter("readableDate", (dateValue) => {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: siteTimeZone
    }).format(new Date(dateValue));
  });

  eleventyConfig.addFilter("isoDate", (dateValue) => {
    const date = new Date(dateValue);
    const parts = new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: siteTimeZone
    }).formatToParts(date);
    const part = (type) => parts.find((item) => item.type === type).value;
    return `${part("year")}-${part("month")}-${part("day")}`;
  });

  eleventyConfig.addFilter("rssDate", (dateValue) => {
    return new Date(dateValue).toUTCString();
  });

  eleventyConfig.addFilter("absoluteUrl", (url, domain) => {
    return new URL(url || "/", `https://${domain}`).href;
  });

  eleventyConfig.addFilter("xmlEscape", (value) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  });

  eleventyConfig.addFilter("limit", (items, count) => {
    return Array.isArray(items) ? items.slice(0, count) : items;
  });

  eleventyConfig.addFilter("json", (value) => {
    return JSON.stringify(value);
  });

  eleventyConfig.addFilter("stripHtml", (value) => {
    return String(value ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  });

  eleventyConfig.addFilter("where", (items, key, value) => {
    return Array.isArray(items) ? items.filter((item) => item[key] === value) : [];
  });

  eleventyConfig.addFilter("sortByNumber", (items, key) => {
    return Array.isArray(items)
      ? [...items].sort((a, b) => Number(a[key] ?? 9999) - Number(b[key] ?? 9999))
      : [];
  });

  eleventyConfig.addFilter("writingTags", (posts) => {
    const tags = new Set();
    for (const post of posts || []) {
      for (const tag of post.data?.tags || []) {
        if (tag !== "posts") tags.add(tag);
      }
    }
    return Array.from(tags).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  });

  eleventyConfig.addFilter("tagLabel", (value) => {
    const tag = String(value ?? "");
    const labels = {
      "gaussian-process-regression": "Gaussian Process Regression",
      "generative-design": "Generative Design",
      "language-models": "Language Models",
      "machine-learning": "Machine Learning",
      "materials-informatics": "Materials Informatics",
      "matgpr": "matgpr",
      "physics-informed-ml": "Physics-informed ML",
      "polymer-design": "Polymer Design",
      "polymer-language-models": "Polymer Language Models"
    };
    if (labels[tag]) return labels[tag];

    return tag
      .split("-")
      .map((part) => {
        if (/^[A-Z0-9]+$/.test(part)) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  });

  eleventyConfig.addFilter("toolSearchContent", (projects) => {
    if (!Array.isArray(projects)) return "";

    const tools = projects.filter((project) => project.tool);
    return [
      "Software and Tools research software practical tools materials discovery",
      ...tools.map((project) => [
        project.title,
        project.subtitle,
        project.summary,
        ...(project.bullets || []),
        project.type,
        project.status
      ].filter(Boolean).join(" "))
    ].join(" ");
  });

  eleventyConfig.addFilter("publicationYearGroups", (publications) => {
    const groups = new Map();
    for (const item of publications) {
      const year = item.year || "Other";
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(item);
    }
    return Array.from(groups, ([year, items]) => ({ year, items }))
      .sort((a, b) => Number(b.year) - Number(a.year));
  });

  eleventyConfig.addFilter("publicationLinks", (publication) => {
    const links = [];
    if (publication?.url) links.push({ label: "Paper", url: publication.url });
    if (Array.isArray(publication?.links)) links.push(...publication.links);

    const bibtexUrl = publication?.bibtex || bibtexUrlForPublication(publication?.url);
    if (bibtexUrl) links.push({ label: "BibTeX", url: bibtexUrl });

    return links;
  });

  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/writing/*.md")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
