const siteTimeZone = "America/Los_Angeles";

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
