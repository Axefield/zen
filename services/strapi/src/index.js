"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = {
  async bootstrap({ strapi }) {
    const hasRun = await strapi.db.query("strapi::core_store").findOne({
      where: { key: "bootstrap_seeded" },
    });
    if (hasRun) {
      console.log("Bootstrap already completed. Skipping seed.");
      return;
    }

    console.log("Running initial content seed...");

    const seedData = {
      categories: [
        { name: "Technology", slug: "technology", description: "Tech articles", publishedAt: new Date() },
        { name: "Design", slug: "design", description: "Design articles", publishedAt: new Date() },
        { name: "Business", slug: "business", description: "Business articles", publishedAt: new Date() },
      ],
      articles: [
        { title: "Welcome to Truligon", slug: "welcome-to-truligon", excerpt: "An introduction to the Truligon platform", body: "# Welcome\n\nTruligon is a modular Business Operating System...", publishedAt: new Date() },
        { title: "Getting Started with Design Tokens", slug: "getting-started-with-design-tokens", excerpt: "How we use design tokens for consistent UI", body: "# Design Tokens\n\nDesign tokens are the foundation...", publishedAt: new Date() },
        { title: "Building a Modular Business OS", slug: "building-modular-business-os", excerpt: "Architecture decisions behind Truligon", body: "# Modular Architecture\n\nA domain-agnostic approach...", publishedAt: new Date() },
      ],
    };

    for (const cat of seedData.categories) {
      const existing = await strapi.db.query("api::category.category").findOne({ where: { slug: cat.slug } });
      if (!existing) {
        await strapi.entityService.create("api::category.category", { data: cat });
        console.log(`Seeded category: ${cat.name}`);
      }
    }

    for (const art of seedData.articles) {
      const existing = await strapi.db.query("api::article.article").findOne({ where: { slug: art.slug } });
      if (!existing) {
        await strapi.entityService.create("api::article.article", { data: art });
        console.log(`Seeded article: ${art.title}`);
      }
    }

    await strapi.db.query("strapi::core_store").create({
      data: { key: "bootstrap_seeded", value: "true" },
    });

    console.log("Content seed complete.");
  },
};
