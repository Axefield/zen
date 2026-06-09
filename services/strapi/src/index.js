"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = {
  async bootstrap({ strapi }) {
    let hasRun;
    try {
      hasRun = await strapi.db.query("strapi::core_store").findOne({
        where: { key: "bootstrap_seeded" },
      });
    } catch {
      console.log("Core store not available, skipping bootstrap seed.");
      return;
    }
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
        { title: "Welcome to Truligon's Zen", slug: "welcome-to-truligons-zen", excerpt: "An introduction to the Truligon's Zen platform", body: "# Welcome\n\nTruligon's Zen is a modular Business Operating System...", publishedAt: new Date() },
        { title: "Getting Started with Design Tokens", slug: "getting-started-with-design-tokens", excerpt: "How we use design tokens for consistent UI", body: "# Design Tokens\n\nDesign tokens are the foundation...", publishedAt: new Date() },
        { title: "Building a Modular Business OS", slug: "building-modular-business-os", excerpt: "Architecture decisions behind Truligon's Zen", body: "# Modular Architecture\n\nA domain-agnostic approach...", publishedAt: new Date() },
      ],
      products: [
        { name: "Zen Starter Kit", slug: "zen-starter-kit", description: "# Zen Starter Kit\n\nThe foundational toolkit for building on Truligon's Zen. Includes type-safe templates, Strapi content models, and AI integration stubs.", price: 99.99, currency: "USD", publishedAt: new Date() },
        { name: "Enterprise License", slug: "enterprise-license", description: "# Enterprise License\n\nFull access to all modules, priority support, and custom integration assistance for your organization.", price: 999.99, compareAtPrice: 1499.99, currency: "USD", publishedAt: new Date() },
        { name: "AI Agent Pack", slug: "ai-agent-pack", description: "# AI Agent Pack\n\nPre-built AI agent workflows for content generation, analytics, and customer engagement automation.", price: 299.99, currency: "USD", publishedAt: new Date() },
      ],
      courses: [
        { title: "Getting Started with Truligon's Zen", slug: "getting-started-with-zen", description: "# Course Overview\n\nLearn how to set up your first Truligon's Zen instance, configure modules, and deploy to production.", price: 0, currency: "USD", publishedAt: new Date() },
        { title: "Advanced Type System Design", slug: "advanced-type-system", description: "# Advanced Type System\n\nDeep dive into designing reusable, type-safe entities with Zod validation across your entire stack.", price: 149.99, currency: "USD", publishedAt: new Date() },
      ],
      events: [
        { title: "Zen Developer Summit 2026", slug: "zen-developer-summit-2026", description: "# Zen Developer Summit\n\nJoin us for a two-day summit covering modular architecture, AI integration patterns, and real-world case studies.", date: new Date("2026-09-15T09:00:00Z"), locationType: "hybrid", address: "123 Innovation Drive, San Francisco, CA", virtualUrl: "https://events.truligons.zen/summit-2026", capacity: 500, publishedAt: new Date() },
        { title: "Monthly Community Call", slug: "monthly-community-call", description: "# Community Call\n\nMonthly sync with the Truligon's Zen community. Share what you're building, get help, and meet other developers.", date: new Date("2026-07-01T16:00:00Z"), locationType: "virtual", virtualUrl: "https://meet.truligons.zen/community", capacity: 100, publishedAt: new Date() },
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

    for (const prod of seedData.products) {
      const existing = await strapi.db.query("api::product.product").findOne({ where: { slug: prod.slug } });
      if (!existing) {
        await strapi.entityService.create("api::product.product", { data: prod });
        console.log(`Seeded product: ${prod.name}`);
      }
    }

    for (const course of seedData.courses) {
      const existing = await strapi.db.query("api::course.course").findOne({ where: { slug: course.slug } });
      if (!existing) {
        await strapi.entityService.create("api::course.course", { data: course });
        console.log(`Seeded course: ${course.title}`);
      }
    }

    for (const evt of seedData.events) {
      const existing = await strapi.db.query("api::event.event").findOne({ where: { slug: evt.slug } });
      if (!existing) {
        await strapi.entityService.create("api::event.event", { data: evt });
        console.log(`Seeded event: ${evt.title}`);
      }
    }

    await strapi.db.query("strapi::core_store").create({
      data: { key: "bootstrap_seeded", value: "true" },
    });

    console.log("Content seed complete.");
  },
};
