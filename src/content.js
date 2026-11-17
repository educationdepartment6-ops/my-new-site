/**
 * MOG WRLD Website Content
 * Single source of truth for all customer-facing text across the website.
 * Written in plain, friendly English (12-year-old reading level).
 */

export const siteContent = {
  // Brand
  brandName: 'MOG WRLD',

  // Mandatory Single Notice (used in Footer, Product Detail Page, and Checkout Page only)
  researchNotice: 'These products are sold for research purposes only. Not for human or veterinary use. Not medical advice.',

  // Badges & Tooltips
  badges: {
    researchUse: 'Research Use',
    researchUseTooltip: 'Sold for research purposes only.',
  },

  // Navigation Labels
  nav: {
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    about: 'About',
    contact: 'Contact',
    signIn: 'Sign in',
    register: 'Register',
    myAccount: 'My Account',
    orders: 'Orders',
    logOut: 'Log out',
    cart: 'Cart',
  },

  // Homepage Content
  home: {
    hero: {
      headline: 'Quality peptides, clear prices, easy ordering.',
      subheadline: 'Find your product, choose your strength, and order with clear prices per vial. Fast, reliable delivery directly to you.',
      shopButton: 'Shop All Products',
      categoriesButton: 'Browse Categories',
    },
    howToOrder: {
      title: 'How to order',
      subtitle: 'Ordering from MOG WRLD takes just 4 simple steps:',
      steps: [
        {
          number: '1',
          title: 'Select your compounds',
          description: 'Select your research compounds and quantities from our catalogue.',
        },
        {
          number: '2',
          title: 'Enter delivery address',
          description: 'Fill the compliance checkout form with your delivery address.',
        },
        {
          number: '3',
          title: 'Send order on WhatsApp',
          description: 'Click "Send order on WhatsApp" to open WhatsApp with your pre-filled requisition.',
        },
        {
          number: '4',
          title: 'Confirm and complete payment',
          description: 'Our team confirms availability, final total, shipping and payment details with you directly on WhatsApp.',
        },
      ],
    },
    trust: {
      title: 'Why order from MOG WRLD',
      items: [
        {
          title: 'Clear Pricing',
          description: 'Every price is clearly shown per vial in your chosen currency. No hidden fees.',
        },
        {
          title: 'Consistent Quality',
          description: 'Every batch is prepared under strict quality controls for dependable consistency.',
        },
        {
          title: 'Careful Packaging',
          description: 'Products are packed securely with protective materials to arrive safely at your door.',
        },
        {
          title: 'Direct Support',
          description: 'Have a question about your order? Reach our customer support team directly.',
        },
      ],
    },
    featuredProducts: {
      badge: 'Popular Compounds',
      title: 'Featured Products',
      viewAll: 'View All Products',
    },
    categoriesSection: {
      badge: 'Product Groups',
      title: 'Browse by Category',
      viewAll: 'View All Categories',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Simple answers to common questions about ordering and delivery.',
      items: [
        {
          q: 'How do I order?',
          a: 'Ordering takes 4 simple steps: 1. Select your research compounds and quantities. 2. Fill the compliance checkout form with your delivery address. 3. Click "Send order on WhatsApp" to open WhatsApp with your pre-filled requisition. 4. Our team confirms availability, final total, shipping and payment details with you directly on WhatsApp.',
        },
        {
          q: "What does 'per vial' mean?",
          a: 'Each listed price is for one individual vial of the product in the strength you selected.',
        },
        {
          q: 'How long does shipping take?',
          a: 'Orders are processed quickly and shipped to your delivery address. [FILL IN: typical delivery timeframe, e.g. 2 to 5 business days].',
        },
        {
          q: 'How do I contact support?',
          a: 'You can reach our support team by email at [FILL IN: support email address] or by phone at [FILL IN: support phone number].',
        },
      ],
    },
    newsletter: {
      title: 'Stay Updated',
      subtitle: 'Subscribe to get news on new products, strength options, and catalogue updates.',
      placeholder: 'Enter your email address...',
      button: 'Subscribe',
      note: 'We respect your privacy. Unsubscribe at any time.',
      success: 'Thank you for subscribing!',
    },
  },

  // Product Cards
  productCard: {
    badge: 'Research Use',
    tooltip: 'Sold for research purposes only.',
    pricePerVial: 'Price per vial',
    pricePerContainer: 'Price per',
    productCode: 'Product code',
    strength: 'Strength',
    addToCart: 'Add to cart',
    added: 'Added',
    quickView: 'View product details',
  },

  // Product Detail Page
  productDetail: {
    selectStrength: 'Select Strength',
    productCode: 'Product code',
    pricePerVial: 'Price per vial',
    quantity: 'Quantity',
    addToCart: 'Add to cart',
    addedToCart: 'Added to cart!',
    inStock: 'In Stock',
    packagingNote: 'Packed securely for safe transit',
    notice: 'These products are sold for research purposes only. Not for human or veterinary use. Not medical advice.',
  },

  // Cart & Drawer
  cart: {
    title: 'Cart',
    emptyTitle: 'Your cart is empty',
    emptySubtitle: 'Choose products from our shop to add them to your cart.',
    browseButton: 'Browse Products',
    subtotal: 'Subtotal',
    checkoutButton: 'Go to Checkout',
    clearCart: 'Clear Cart',
    itemsCount: (count) => `${count} ${count === 1 ? 'item' : 'items'}`,
    vialCount: (qty) => `${qty} ${qty === 1 ? 'vial' : 'vials'}`,
  },

  // Checkout Page
  checkout: {
    title: 'Checkout',
    contactTitle: '1. Contact Details',
    addressTitle: '2. Delivery Address',
    paymentTitle: '3. Payment Method',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Address Line',
    city: 'City',
    postalCode: 'Postal / ZIP Code',
    country: 'Country',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    shippingNote: 'Standard Delivery',
    total: 'Total',
    placeOrder: 'Place Order',
    processingOrder: 'Processing your order...',
    notice: 'These products are sold for research purposes only. Not for human or veterinary use. Not medical advice.',
    agreementCheckbox: 'I confirm that I am at least 18 years old and agree to the Terms of Supply.',
  },

  // Shop Page
  shop: {
    title: 'All Products',
    subtitle: 'Browse our full list of compounds and choose your strength.',
    searchPlaceholder: 'Search by product name, code...',
    allCategories: 'All Categories',
    sortBy: 'Sort by',
    inStockOnly: 'In Stock Only',
    showingCount: (shown, total) => `Showing ${shown} of ${total} products`,
  },

  // Informational Pages
  about: {
    title: 'About MOG WRLD',
    headline: 'Quality peptides, clear prices, and reliable supply.',
    intro: 'MOG WRLD was founded to provide researchers and laboratories with quality peptides, transparent per-vial pricing, and an easy ordering experience.',
    card1Title: 'Clear Pricing',
    card1Text: 'We publish straightforward per-vial pricing across all strengths so you always know your exact cost upfront.',
    card2Title: 'Easy Ordering',
    card2Text: 'Select your compound, pick your strength, and checkout with a saved account in just a few clicks.',
  },

  contact: {
    title: 'Contact Us',
    subtitle: 'Have a question about products or your order? Get in touch with our team.',
    officeTitle: 'Office & Inquiries',
    emailLabel: 'Email Support',
    emailValue: '[FILL IN: support email address]',
    phoneLabel: 'Phone Support',
    phoneValue: '[FILL IN: support phone number]',
    addressLabel: 'Address',
    addressValue: '[FILL IN: registered company address]',
    formTitle: 'Send a Message',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'Your email address',
    messagePlaceholder: 'How can we help you?',
    sendButton: 'Send Message',
    sentSuccess: 'Thank you for contacting us. We will get back to you shortly.',
  },

  shipping: {
    title: 'Shipping & Delivery',
    subtitle: 'Clear, simple information about how orders are packed and shipped.',
    dispatchTitle: 'Order Processing',
    dispatchText: 'Orders are packed and dispatched promptly after order confirmation. [FILL IN: typical delivery timeframe, e.g. 2 to 5 business days].',
    packagingTitle: 'Protective Packaging',
    packagingText: 'Every vial is packaged in protective insulated materials to ensure safe transit to your address.',
    supportText: 'If you have questions about tracking your order, contact us at [FILL IN: support email address].',
  },

  faqPage: {
    title: 'Frequently Asked Questions',
    subtitle: 'Clear answers to common questions about products, ordering, and delivery.',
  },

  // Footer
  footer: {
    description: 'MOG WRLD supplies quality research peptides with clear pricing per vial and straightforward ordering.',
    notice: 'These products are sold for research purposes only. Not for human or veterinary use. Not medical advice.',
    contactInfo: {
      email: '[FILL IN: support email address]',
      phone: '[FILL IN: support phone number]',
      address: '[FILL IN: registered company address]',
    },
    linksTitleCategories: 'Categories',
    linksTitleHelp: 'Help & Information',
    linksTitleLegal: 'Legal & Policies',
    copyright: `© ${new Date().getFullYear()} MOG WRLD. All rights reserved.`,
  },
};

export default siteContent;
