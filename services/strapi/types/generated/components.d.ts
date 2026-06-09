import type { Schema, Struct } from '@strapi/strapi';

export interface ContentCampaignTier extends Struct.ComponentSchema {
  collectionName: 'components_content_campaign_tiers';
  info: {
    description: 'Reward tier for fundraising campaigns';
    displayName: 'Campaign Tier';
    icon: 'layer';
  };
  attributes: {
    amount: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    maxBackers: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContentCourseModule extends Struct.ComponentSchema {
  collectionName: 'components_content_course_modules';
  info: {
    description: 'A module within a course containing lessons';
    displayName: 'Course Module';
    icon: 'stack';
  };
  attributes: {
    description: Schema.Attribute.Text;
    lessons: Schema.Attribute.Component<'content.lesson', true>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContentLesson extends Struct.ComponentSchema {
  collectionName: 'components_content_lessons';
  info: {
    description: 'A single lesson within a course module';
    displayName: 'Lesson';
    icon: 'play';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    duration: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    videoUrl: Schema.Attribute.String;
  };
}

export interface ContentPricingTier extends Struct.ComponentSchema {
  collectionName: 'components_content_pricing_tiers';
  info: {
    description: 'Pricing tier with features for pricing tables';
    displayName: 'Pricing Tier';
    icon: 'price';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.call-to-action', false>;
    description: Schema.Attribute.Text;
    features: Schema.Attribute.JSON;
    highlighted: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    interval: Schema.Attribute.Enumeration<['monthly', 'yearly', 'one-time']> &
      Schema.Attribute.DefaultTo<'monthly'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface ContentProductVariant extends Struct.ComponentSchema {
  collectionName: 'components_content_product_variants';
  info: {
    description: 'Product variation (size, color, etc.)';
    displayName: 'Product Variant';
    icon: 'grid';
  };
  attributes: {
    attributes: Schema.Attribute.JSON;
    inventory: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    sku: Schema.Attribute.String;
  };
}

export interface ContentTicketTier extends Struct.ComponentSchema {
  collectionName: 'components_content_ticket_tiers';
  info: {
    description: 'Ticket pricing tier for events';
    displayName: 'Ticket Tier';
    icon: 'ticket';
  };
  attributes: {
    capacity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface SeoSeo extends Struct.ComponentSchema {
  collectionName: 'components_seo_seo';
  info: {
    description: 'Search engine optimization metadata';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 320;
      }>;
    noindex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogImage: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
  };
}

export interface SharedCallToAction extends Struct.ComponentSchema {
  collectionName: 'components_shared_call_to_actions';
  info: {
    description: 'CTA button with text, link, and style variant';
    displayName: 'Call to Action';
    icon: 'cursor';
  };
  attributes: {
    body: Schema.Attribute.Text;
    buttonText: Schema.Attribute.String & Schema.Attribute.Required;
    buttonUrl: Schema.Attribute.String & Schema.Attribute.Required;
    headline: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'outline', 'ghost']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SharedHero extends Struct.ComponentSchema {
  collectionName: 'components_shared_heroes';
  info: {
    description: 'Hero section with headline, subheadline, and CTA';
    displayName: 'Hero';
    icon: 'landscape';
  };
  attributes: {
    backgroundMedia: Schema.Attribute.Media<'images' | 'videos'>;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    primaryCta: Schema.Attribute.Component<'shared.call-to-action', false>;
    subheadline: Schema.Attribute.Text;
  };
}

export interface SharedMediaGallery extends Struct.ComponentSchema {
  collectionName: 'components_shared_media_galleries';
  info: {
    description: 'Ordered media gallery with captions';
    displayName: 'Media Gallery';
    icon: 'picture';
  };
  attributes: {
    layout: Schema.Attribute.Enumeration<
      ['grid', 'carousel', 'masonry', 'single']
    > &
      Schema.Attribute.DefaultTo<'grid'>;
    media: Schema.Attribute.Media<'images' | 'videos', true> &
      Schema.Attribute.Required;
  };
}

export interface SharedPricingTable extends Struct.ComponentSchema {
  collectionName: 'components_shared_pricing_tables';
  info: {
    description: 'Tiered pricing table with feature lists';
    displayName: 'Pricing Table';
    icon: 'price';
  };
  attributes: {
    headline: Schema.Attribute.String;
    tiers: Schema.Attribute.Component<'content.pricing-tier', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
          min: 1;
        },
        number
      >;
  };
}

export interface SharedRichTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_text_blocks';
  info: {
    description: 'Rich text content block with embedded media';
    displayName: 'Rich Text Block';
    icon: 'file';
  };
  attributes: {
    body: Schema.Attribute.RichText & Schema.Attribute.Required;
    media: Schema.Attribute.Media<'images' | 'videos' | 'files', true>;
  };
}

export interface SharedTestimonialCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_testimonial_cards';
  info: {
    description: 'Customer testimonial with quote, attribution, and avatar';
    displayName: 'Testimonial Card';
    icon: 'quote';
  };
  attributes: {
    author: Schema.Attribute.String & Schema.Attribute.Required;
    avatar: Schema.Attribute.Media<'images'>;
    company: Schema.Attribute.String;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    role: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'content.campaign-tier': ContentCampaignTier;
      'content.course-module': ContentCourseModule;
      'content.lesson': ContentLesson;
      'content.pricing-tier': ContentPricingTier;
      'content.product-variant': ContentProductVariant;
      'content.ticket-tier': ContentTicketTier;
      'seo.seo': SeoSeo;
      'shared.call-to-action': SharedCallToAction;
      'shared.hero': SharedHero;
      'shared.media-gallery': SharedMediaGallery;
      'shared.pricing-table': SharedPricingTable;
      'shared.rich-text-block': SharedRichTextBlock;
      'shared.testimonial-card': SharedTestimonialCard;
    }
  }
}
