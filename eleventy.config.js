export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "0/images": "assets/images" });
  eleventyConfig.addPassthroughCopy({ "0/cv": "cv" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  eleventyConfig.addFilter("readableDate", (dateValue) => {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(dateValue));
  });

  eleventyConfig.addFilter("isoDate", (dateValue) => {
    return new Date(dateValue).toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("limit", (items, count) => {
    return Array.isArray(items) ? items.slice(0, count) : items;
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
