export const documentationSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: `
      <h1 class="text-2xl font-bold mb-4">Getting Started with SEO Forum Platform</h1>
      
      <p class="mb-4">
        Welcome to the SEO Forum Platform! This powerful tool helps you create and manage topic-focused forum communities
        that drive traffic to your main website through optimized content and intelligent interlinking.
      </p>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">What You Can Do</h2>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Create SEO-optimized question and answer forums</li>
        <li>Generate AI-powered content with different expertise levels</li>
        <li>Track keyword rankings and performance</li>
        <li>Capture leads with customizable forms</li>
        <li>Host forums under your own domain</li>
        <li>Schedule content for automatic publishing</li>
        <li>Monitor comprehensive analytics</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Quick Start Guide</h2>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li><strong>Create an account</strong> - Sign up to access all platform features</li>
        <li><strong>Set up your forum</strong> - Configure your first forum with branding and categories</li>
        <li><strong>Verify your domain</strong> - For custom domain hosting, verify ownership</li>
        <li><strong>Create or generate questions</strong> - Start building content manually or with AI</li>
        <li><strong>Set up lead capture</strong> - Create forms to capture visitor information</li>
        <li><strong>Monitor performance</strong> - Track your SEO metrics from the dashboard</li>
      </ol>
      
      <div class="bg-primary-500/10 p-4 rounded-lg border border-primary-500/30 mb-6">
        <h3 class="text-lg font-medium mb-2 text-primary-400">Pro Tip</h3>
        <p>Start by researching keywords relevant to your business and use our keyword analysis tools to identify high-opportunity topics with low competition.</p>
      </div>
    `
  },
  {
    id: "forum-management",
    title: "Forum Management",
    content: `
      <h1 class="text-2xl font-bold mb-4">Forum Management</h1>
      
      <p class="mb-4">
        Managing your forums effectively is essential for driving traffic and engagement. This section covers all aspects of forum configuration, moderation, and management.
      </p>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Creating Forums</h2>
      
      <p class="mb-4">
        To create a new forum:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to the Dashboard and click on "Forum Management"</li>
        <li>Click "Create New Forum"</li>
        <li>Enter a name, description, and slug (URL path)</li>
        <li>Configure appearance settings (colors, fonts, etc.)</li>
        <li>Set up categories relevant to your topic</li>
        <li>Click "Create Forum" to save</li>
      </ol>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Appearance Customization</h2>
      
      <p class="mb-4">
        Customize your forum's appearance to match your brand:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Theme Color</strong>: Set your primary brand color</li>
        <li><strong>Secondary Color</strong>: For accents and highlights</li>
        <li><strong>Typography</strong>: Choose font families for headings and body text</li>
        <li><strong>Font Sizes</strong>: Adjust text sizes for various elements</li>
        <li><strong>Logo</strong>: Upload your brand logo</li>
        <li><strong>Header Image</strong>: Add a custom banner (optional)</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Domain Configuration</h2>
      
      <p class="mb-4">
        You can host your forum on a custom domain or subdomain:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Domain Management" in your forum settings</li>
        <li>Enter your desired domain (e.g., forum.yourdomain.com)</li>
        <li>Copy the provided TXT record</li>
        <li>Add the TXT record to your domain's DNS settings</li>
        <li>Click "Verify Domain" to confirm ownership</li>
        <li>Once verified, set up a CNAME record pointing to our servers</li>
      </ol>
      
      <div class="bg-primary-500/10 p-4 rounded-lg border border-primary-500/30 mb-6">
        <h3 class="text-lg font-medium mb-2 text-primary-400">Important Note</h3>
        <p>DNS changes can take up to 48 hours to propagate globally. Your forum will remain accessible via the default URL while you wait for domain verification.</p>
      </div>
    `
  },
  {
    id: "ai-features",
    title: "AI Features",
    content: `
      <h1 class="text-2xl font-bold mb-4">AI-Powered Features</h1>
      
      <p class="mb-4">
        Our platform offers advanced AI capabilities to help you create high-quality, SEO-optimized content at scale. This section explains how to leverage these features effectively.
      </p>
      
                      <h2 class="text-xl font-semibold mb-3 mt-6">AI Agent Levels</h2>
      
      <p class="mb-4">
        When generating content, you can choose from four expertise levels:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-4">
        <li>
          <strong>Beginner</strong>: Asks fundamental questions and provides basic answers. Good for establishing foundational content and addressing entry-level topics.
        </li>
        <li>
          <strong>Intermediate</strong>: Demonstrates practical knowledge with some experience. Ideal for how-to content and practical implementation advice.
        </li>
        <li>
          <strong>Expert</strong>: Provides in-depth, authoritative content with industry-specific terminology and advanced concepts. Best for technical topics and thorough analysis.
        </li>
        <li>
          <strong>Moderator</strong>: Neutral, facilitating tone that summarizes viewpoints and maintains discussion quality. Perfect for controversial topics or synthesizing information.
        </li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Generating SEO-Optimized Questions</h2>
      
      <p class="mb-4">
        To generate questions that target specific keywords:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Content Generation" in the dashboard</li>
        <li>Select "Generate Questions"</li>
        <li>Enter your target keyword or topic</li>
        <li>Choose the number of questions to generate</li>
        <li>Adjust advanced settings if needed (search intent, difficulty level)</li>
        <li>Click "Generate Questions"</li>
      </ol>
      
      <p class="mb-4">
        Each generated question includes:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>SEO-optimized title</li>
        <li>Detailed question content</li>
        <li>Target keywords</li>
        <li>Search intent classification</li>
        <li>Estimated search volume</li>
        <li>Competitive difficulty score</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">AI Answer Generation</h2>
      
      <p class="mb-4">
        To generate answers to questions:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Open a question from your forum</li>
        <li>Click "Generate AI Answer"</li>
        <li>Select the desired expertise level</li>
        <li>Add any specific instructions (optional)</li>
        <li>Click "Generate"</li>
      </ol>
      
      <div class="bg-primary-500/10 p-4 rounded-lg border border-primary-500/30 mb-6">
        <h3 class="text-lg font-medium mb-2 text-primary-400">Best Practice</h3>
        <p>Mix different expertise levels for a natural discussion environment. Having various perspectives creates a more comprehensive resource for visitors and improves content depth.</p>
      </div>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Keyword Analysis</h2>
      
      <p class="mb-4">
        Use our AI-powered keyword analysis to identify content opportunities:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "SEO Tools" and select "Keyword Analysis"</li>
        <li>Enter your website URL or industry</li>
        <li>Adjust focus settings if needed</li>
        <li>Click "Analyze"</li>
      </ol>
      
      <p class="mb-4">
        The analysis provides:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Keyword clusters by topic</li>
        <li>Content gap analysis</li>
        <li>Question-focused keywords</li>
        <li>Difficulty scores</li>
        <li>Search volume estimates</li>
        <li>Content recommendations</li>
      </ul>
    `
  },
  {
    id: "lead-capture",
    title: "Lead Capture",
    content: `
      <h1 class="text-2xl font-bold mb-4">Lead Capture System</h1>
      
      <p class="mb-4">
        Transform your forum visitors into valuable leads with our comprehensive lead capture system. This section explains how to create forms, manage submissions, and integrate with your CRM.
      </p>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Creating Lead Capture Forms</h2>
      
      <p class="mb-4">
        To create a new lead capture form:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Lead Capture" in the dashboard</li>
        <li>Click "Create New Form"</li>
        <li>Enter a name and description for your form</li>
        <li>Add and configure form fields (name, email, custom fields, etc.)</li>
        <li>Customize the submit button text</li>
        <li>Set up success message or redirect URL</li>
        <li>Configure form styling to match your branding</li>
        <li>Save your form</li>
      </ol>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Form Field Types</h2>
      
      <p class="mb-4">
        Available field types for your forms include:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Text Input</strong>: Single line text (for names, etc.)</li>
        <li><strong>Email</strong>: Validates email format</li>
        <li><strong>Phone</strong>: With optional format validation</li>
        <li><strong>Textarea</strong>: Multi-line text input</li>
        <li><strong>Select</strong>: Dropdown with options</li>
        <li><strong>Checkbox</strong>: For consent or boolean options</li>
        <li><strong>Radio Buttons</strong>: For mutually exclusive choices</li>
        <li><strong>Date Picker</strong>: Calendar selection</li>
        <li><strong>Hidden Field</strong>: For tracking or storing values</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Gated Content Management</h2>
      
      <p class="mb-4">
        Create premium content accessible only after form submission:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Gated Content" in the dashboard</li>
        <li>Click "Create New Content"</li>
        <li>Enter title, teaser, and full content</li>
        <li>Select an associated lead form</li>
        <li>Set visibility options (public teaser, full content after submission)</li>
        <li>Save your gated content</li>
      </ol>
      
      <p class="mb-4">
        The system automatically:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Shows the teaser to all visitors</li>
        <li>Displays the form when users attempt to access full content</li>
        <li>Unlocks content after successful form submission</li>
        <li>Tracks conversion rates</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">CRM Integration</h2>
      
      <p class="mb-4">
        Connect your forms to popular CRM systems:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Integration Settings" in the dashboard</li>
        <li>Select your CRM provider</li>
        <li>Enter API credentials</li>
        <li>Map form fields to CRM fields</li>
        <li>Configure sync settings (real-time, batch, etc.)</li>
        <li>Test the integration</li>
        <li>Activate the integration</li>
      </ol>
      
      <p class="mb-4">
        Supported CRM platforms include:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>HubSpot</li>
        <li>Salesforce</li>
        <li>Mailchimp</li>
        <li>ActiveCampaign</li>
        <li>Zoho CRM</li>
        <li>Custom webhooks</li>
      </ul>
      
      <div class="bg-primary-500/10 p-4 rounded-lg border border-primary-500/30 mb-6">
        <h3 class="text-lg font-medium mb-2 text-primary-400">Lead Management Tips</h3>
        <p>Always include a clear privacy policy with your forms and provide value in exchange for user information. Higher-value content typically results in better conversion rates.</p>
      </div>
    `
  },
  {
    id: "interlinking",
    title: "Interlinking System",
    content: `
      <h1 class="text-2xl font-bold mb-4">Intelligent Interlinking System</h1>
      
      <p class="mb-4">
        Our semantic interlinking system enhances SEO by creating meaningful connections between forum content and your main website. This section explains how to use this powerful feature effectively.
      </p>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Understanding Interlinking</h2>
      
      <p class="mb-4">
        Interlinking serves several important purposes:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Improves search engine crawling and indexing</li>
        <li>Distributes page authority throughout your site</li>
        <li>Enhances user navigation</li>
        <li>Increases time-on-site metrics</li>
        <li>Establishes topical authority</li>
        <li>Drives traffic between forum and main site</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Automatic Interlinking</h2>
      
      <p class="mb-4">
        The system can automatically generate relevant links:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Interlinking" in the dashboard</li>
        <li>Click "Generate Interlinking Suggestions"</li>
        <li>Select your content source (forum questions, answers, or main site pages)</li>
        <li>Set minimum relevance threshold (0-100%)</li>
        <li>Choose maximum number of links per content item</li>
        <li>Click "Generate Suggestions"</li>
      </ol>
      
      <p class="mb-4">
        For each suggestion, you can:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>View relevance score based on semantic similarity</li>
        <li>See recommended anchor text</li>
        <li>Preview the target content</li>
        <li>Accept or reject the suggestion</li>
        <li>Edit the anchor text if needed</li>
        <li>Apply selected links in bulk</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Manual Interlinking</h2>
      
      <p class="mb-4">
        Create manual interlinks for maximum control:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Navigate to any content item (question, answer, or page)</li>
        <li>Click "Add Interlink" in the editing interface</li>
        <li>Search for related content by keyword</li>
        <li>Select target content from search results</li>
        <li>Choose or create anchor text</li>
        <li>Set link position in your content</li>
        <li>Save changes</li>
      </ol>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Bidirectional Interlinking</h2>
      
      <p class="mb-4">
        Create two-way connections between forum and main site:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Advanced Interlinking" in the dashboard</li>
        <li>Click "Bidirectional Analysis"</li>
        <li>Enter your main website URL</li>
        <li>Select forum content categories to include</li>
        <li>Click "Analyze"</li>
      </ol>
      
      <p class="mb-4">
        The system will:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Analyze content on both your forum and main website</li>
        <li>Identify optimal linking opportunities in both directions</li>
        <li>Suggest anchor text based on keyword relevance</li>
        <li>Provide instructions for implementing links on your main site</li>
        <li>Automatically implement forum-side links with your approval</li>
      </ul>
      
      <div class="bg-primary-500/10 p-4 rounded-lg border border-primary-500/30 mb-6">
        <h3 class="text-lg font-medium mb-2 text-primary-400">SEO Best Practice</h3>
        <p>Focus on quality over quantity. It's better to have fewer, highly relevant links than many low-quality ones. The system's relevance score helps identify the most valuable linking opportunities.</p>
      </div>
    `
  },
  {
    id: "analytics",
    title: "Analytics & Reporting",
    content: `
      <h1 class="text-2xl font-bold mb-4">Analytics and Reporting</h1>
      
      <p class="mb-4">
        Our comprehensive analytics system helps you track performance, measure ROI, and optimize your forum strategy. This section explains the available metrics and how to interpret them.
      </p>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Dashboard Overview</h2>
      
      <p class="mb-4">
        The main dashboard provides a high-level view of key metrics:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Total Questions</strong>: Number of questions posted</li>
        <li><strong>Total Answers</strong>: Number of answers provided</li>
        <li><strong>Organic Traffic</strong>: Visitors from search engines</li>
        <li><strong>Conversion Rate</strong>: Percentage of visitors who complete lead forms</li>
        <li><strong>Avg. Position</strong>: Average search ranking position</li>
        <li><strong>Top Keywords</strong>: Best performing search terms</li>
      </ul>
      
      <p class="mb-4">
        Each metric shows:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Current value</li>
        <li>Trend compared to previous period</li>
        <li>Percentage change</li>
        <li>Sparkline visualization</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Traffic Analytics</h2>
      
      <p class="mb-4">
        Detailed traffic metrics include:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Traffic Sources</strong>: Breakdown by source (organic, direct, referral, social)</li>
        <li><strong>Geographic Distribution</strong>: Traffic by country and region</li>
        <li><strong>Device Types</strong>: Desktop, mobile, tablet usage</li>
        <li><strong>Visit Duration</strong>: Average time on site</li>
        <li><strong>Bounce Rate</strong>: Percentage of single-page sessions</li>
        <li><strong>Page Views</strong>: Total and average per session</li>
        <li><strong>New vs. Returning</strong>: Visitor type breakdown</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">SEO Performance</h2>
      
      <p class="mb-4">
        Track your search engine performance with:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Keyword Rankings</strong>: Position tracking for target terms</li>
        <li><strong>Position Changes</strong>: Tracking movement over time</li>
        <li><strong>Impressions</strong>: How often your content appears in search results</li>
        <li><strong>Click-Through Rate</strong>: Percentage of impressions that result in clicks</li>
        <li><strong>Featured Snippets</strong>: Content appearing in special SERP features</li>
        <li><strong>Indexed Pages</strong>: Content successfully added to search engines</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Conversion Analytics</h2>
      
      <p class="mb-4">
        Measure lead generation effectiveness with:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Form Views</strong>: Number of times forms are displayed</li>
        <li><strong>Form Submissions</strong>: Completed form entries</li>
        <li><strong>Conversion Rate</strong>: Submission percentage</li>
        <li><strong>Conversion by Source</strong>: Which traffic sources convert best</li>
        <li><strong>Form Abandonment</strong>: Incomplete submission analysis</li>
        <li><strong>Field Completion Time</strong>: Time spent on forms</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Content Performance</h2>
      
      <p class="mb-4">
        Analyze which content performs best:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Top Questions</strong>: Most viewed questions</li>
        <li><strong>Engagement Rate</strong>: Comments and answers per view</li>
        <li><strong>Content Quality Score</strong>: AI-based quality assessment</li>
        <li><strong>Traffic by Topic</strong>: Which categories attract most visitors</li>
        <li><strong>AI vs. Human Content</strong>: Performance comparison</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Custom Reports</h2>
      
      <p class="mb-4">
        Create specialized reports for your needs:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Reports" in the dashboard</li>
        <li>Click "Create Custom Report"</li>
        <li>Select metrics to include</li>
        <li>Choose date range and comparison period</li>
        <li>Set visualization preferences</li>
        <li>Configure schedule (one-time or recurring)</li>
        <li>Add recipients for automated delivery</li>
        <li>Save report</li>
      </ol>
      
      <div class="bg-primary-500/10 p-4 rounded-lg border border-primary-500/30 mb-6">
        <h3 class="text-lg font-medium mb-2 text-primary-400">Analytics Tip</h3>
        <p>Look for correlation between content topics, traffic, and conversions to identify your most valuable content types. This insight helps prioritize future content creation efforts.</p>
      </div>
    `
  },
  {
    id: "content-scheduling",
    title: "Content Scheduling",
    content: `
      <h1 class="text-2xl font-bold mb-4">Content Scheduling System</h1>
      
      <p class="mb-4">
        Plan and automate your content publication with our scheduling system. This helps maintain a consistent posting cadence and targets specific keywords over time.
      </p>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Scheduling Content</h2>
      
      <p class="mb-4">
        To schedule content for future publication:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Content Scheduling" in the dashboard</li>
        <li>Click "Schedule New Content"</li>
        <li>Select content type (question, answer, article)</li>
        <li>Choose target forum and category</li>
        <li>Enter keyword focus</li>
                        <li>Select AI agent type (for AI-generated content)</li>
        <li>Set publication date and time</li>
        <li>Add custom content or request AI generation</li>
        <li>Save schedule</li>
      </ol>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Recurring Schedules</h2>
      
      <p class="mb-4">
        Create repeating content patterns:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>When scheduling content, check "Recurring Schedule"</li>
        <li>Select frequency (daily, weekly, monthly)</li>
        <li>Configure specific parameters (days of week, etc.)</li>
        <li>Set total number of occurrences or end date</li>
        <li>Configure content variation settings</li>
        <li>Save schedule</li>
      </ol>
      
      <p class="mb-4">
        With recurring schedules, you can:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Maintain consistent posting frequency</li>
        <li>Target related keywords over time</li>
        <li>Automatically generate variations on a theme</li>
        <li>Build content depth around specific topics</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Content Calendar</h2>
      
      <p class="mb-4">
        View and manage your content schedule:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Monthly, weekly, or list view options</li>
        <li>Color-coding by content type or forum</li>
        <li>Drag-and-drop rescheduling</li>
        <li>Quick edit functionality</li>
        <li>Bulk operations</li>
        <li>Search and filtering</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Keyword Planning</h2>
      
      <p class="mb-4">
        Strategically schedule content based on keywords:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Keyword Planning" in Content Scheduling</li>
        <li>Import keywords from SEO analysis or enter manually</li>
        <li>Set target content volume for each keyword</li>
        <li>Configure distribution preferences</li>
        <li>Click "Generate Schedule"</li>
      </ol>
      
      <p class="mb-4">
        The system will:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Create a balanced content schedule</li>
        <li>Avoid keyword cannibalization</li>
        <li>Distribute content evenly or by priority</li>
                        <li>Allocate appropriate AI agents by topic complexity</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Schedule Management</h2>
      
      <p class="mb-4">
        Manage your existing schedules:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>Edit</strong>: Modify any scheduled content before publication</li>
        <li><strong>Pause</strong>: Temporarily halt recurring schedules</li>
        <li><strong>Delete</strong>: Remove future scheduled items</li>
        <li><strong>Duplicate</strong>: Copy existing schedules as templates</li>
        <li><strong>Preview</strong>: See how generated content will appear</li>
      </ul>
      
      <div class="bg-primary-500/10 p-4 rounded-lg border border-primary-500/30 mb-6">
        <h3 class="text-lg font-medium mb-2 text-primary-400">Scheduling Strategy</h3>
        <p>For maximum SEO impact, schedule related content in clusters. Start with a main question, then schedule follow-up questions and expert answers over the following days to build topic depth and authority.</p>
      </div>
    `
  },
  {
    id: "api-integration",
    title: "API & Integration",
    content: `
      <h1 class="text-2xl font-bold mb-4">API and Integration Options</h1>
      
      <p class="mb-4">
        Extend the functionality of your forum by connecting it with other systems using our API and integration options. This section explains the available methods for developers and administrators.
      </p>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">API Overview</h2>
      
      <p class="mb-4">
        Our RESTful API provides programmatic access to:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Forum content (questions, answers)</li>
        <li>User management</li>
        <li>Analytics data</li>
        <li>Lead submission handling</li>
        <li>Content scheduling</li>
        <li>SEO performance metrics</li>
      </ul>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Authentication</h2>
      
      <p class="mb-4">
        To authenticate API requests:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "API Settings" in the dashboard</li>
        <li>Click "Generate API Key"</li>
        <li>Set appropriate access permissions</li>
        <li>Copy your API key</li>
        <li>Include it in request headers as <code>X-API-Key: your_api_key</code></li>
      </ol>
      
      <div class="bg-dark-300/50 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
        <pre>// Example API request with authentication
fetch('https://yourforum.com/api/questions', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));</pre>
      </div>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Common API Endpoints</h2>
      
      <p class="mb-4">
        Here are some of the most commonly used API endpoints:
      </p>
      
      <div class="overflow-x-auto mb-6">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-primary-500/20">
              <th class="border border-gray-600 px-4 py-2 text-left">Endpoint</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Method</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-600 px-4 py-2"><code>/api/questions</code></td>
              <td class="border border-gray-600 px-4 py-2">GET</td>
              <td class="border border-gray-600 px-4 py-2">List all questions with pagination</td>
            </tr>
            <tr>
              <td class="border border-gray-600 px-4 py-2"><code>/api/questions/{id}</code></td>
              <td class="border border-gray-600 px-4 py-2">GET</td>
              <td class="border border-gray-600 px-4 py-2">Get a specific question by ID</td>
            </tr>
            <tr>
              <td class="border border-gray-600 px-4 py-2"><code>/api/questions</code></td>
              <td class="border border-gray-600 px-4 py-2">POST</td>
              <td class="border border-gray-600 px-4 py-2">Create a new question</td>
            </tr>
            <tr>
              <td class="border border-gray-600 px-4 py-2"><code>/api/questions/{id}/answers</code></td>
              <td class="border border-gray-600 px-4 py-2">GET</td>
              <td class="border border-gray-600 px-4 py-2">Get all answers for a question</td>
            </tr>
            <tr>
              <td class="border border-gray-600 px-4 py-2"><code>/api/analytics/traffic</code></td>
              <td class="border border-gray-600 px-4 py-2">GET</td>
              <td class="border border-gray-600 px-4 py-2">Get traffic analytics data</td>
            </tr>
            <tr>
              <td class="border border-gray-600 px-4 py-2"><code>/api/keywords/rankings</code></td>
              <td class="border border-gray-600 px-4 py-2">GET</td>
              <td class="border border-gray-600 px-4 py-2">Get keyword ranking data</td>
            </tr>
            <tr>
              <td class="border border-gray-600 px-4 py-2"><code>/api/leads/submissions</code></td>
              <td class="border border-gray-600 px-4 py-2">GET</td>
              <td class="border border-gray-600 px-4 py-2">List lead form submissions</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Website Embedding</h2>
      
      <p class="mb-4">
        Embed forum components on your main website:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Integration" in the dashboard</li>
        <li>Select "Widget Generator"</li>
        <li>Choose the widget type (question list, popular topics, etc.)</li>
        <li>Configure appearance settings</li>
        <li>Copy the generated code</li>
        <li>Paste into your website's HTML</li>
      </ol>
      
      <p class="mb-4">
        Available widget types include:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>Recent Questions</li>
        <li>Popular Topics</li>
        <li>Question Search</li>
        <li>Category Browser</li>
        <li>Lead Capture Form</li>
        <li>Full Forum Embed</li>
      </ul>
      
      <div class="bg-dark-300/50 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
        <pre>&lt;!-- Example: Recent Questions Widget -->
&lt;div id="seo-forum-recent-questions" data-forum-id="your_forum_id" data-count="5" data-theme="light">&lt;/div>
&lt;script src="https://yourforum.com/embed/forum-widget.js">&lt;/script></pre>
      </div>
      
      <h3 class="text-lg font-semibold mb-2 mt-4">Widget Customization Options</h3>
      
      <p class="mb-4">
        All widgets support these common customization attributes:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><code>data-theme</code>: "light" or "dark"</li>
        <li><code>data-accent-color</code>: Hex color code (e.g., "#4f46e5")</li>
        <li><code>data-font</code>: "system", "serif", or "sans-serif"</li>
        <li><code>data-radius</code>: Border radius in pixels</li>
        <li><code>data-width</code>: Width in pixels or percentage</li>
        <li><code>data-max-height</code>: Maximum height in pixels</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2 mt-4">JavaScript API for Widgets</h3>
      
      <p class="mb-4">
        You can also interact with widgets programmatically:
      </p>
      
      <div class="bg-dark-300/50 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
        <pre>// Initialize widget with options
const widget = SEOForum.createWidget('recent-questions', {
  forumId: 'your_forum_id',
  container: '#widget-container',
  count: 5,
  theme: 'dark',
  accentColor: '#4f46e5',
  onQuestionClick: (question) => {
    console.log('Question clicked:', question);
    // Custom handling
  }
});

// Refresh widget data
widget.refresh();

// Update widget options
widget.updateOptions({
  count: 10,
  theme: 'light'
});

// Get widget data
const questions = widget.getData();</pre>
      </div>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Webhook Integration</h2>
      
      <p class="mb-4">
        Set up webhooks to notify external systems of events:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Integration" in the dashboard</li>
        <li>Select "Webhook Configuration"</li>
        <li>Click "Add Webhook"</li>
        <li>Enter destination URL</li>
        <li>Select event types to monitor</li>
        <li>Configure security settings</li>
        <li>Save webhook</li>
      </ol>
      
      <p class="mb-4">
        Webhook events include:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li>New question posted</li>
        <li>New answer submitted</li>
        <li>Lead form submission</li>
        <li>User registration</li>
        <li>Keyword ranking changes</li>
        <li>Traffic milestone reached</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2 mt-4">Webhook Payload Example</h3>
      
      <div class="bg-dark-300/50 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
        <pre>{
  "event": "new_question",
  "timestamp": "2025-03-27T14:35:42Z",
  "forum_id": "forum_123456",
  "data": {
    "question_id": 789,
    "title": "How to improve SEO for e-commerce product pages?",
    "user_id": 456,
    "category_id": 12,
    "created_at": "2025-03-27T14:35:42Z",
    "is_ai_generated": false
  }
}</pre>
      </div>
      
      <h3 class="text-lg font-semibold mb-2 mt-4">Webhook Security</h3>
      
      <p class="mb-4">
        Each webhook includes a signature header for verification:
      </p>
      
      <div class="bg-dark-300/50 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
        <pre>// Verify webhook signature (Node.js example)
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

// In your webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-seo-forum-signature'];
  const payload = JSON.stringify(req.body);
  const webhookSecret = 'your_webhook_secret';
  
  if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process valid webhook
  const event = req.body.event;
  const data = req.body.data;
  // ...
});</pre>
      </div>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Third-Party Integrations</h2>
      
      <p class="mb-4">
        Connect with popular services:
      </p>
      
      <h3 class="text-lg font-semibold mb-2 mt-4">Google Analytics Integration</h3>
      
      <p class="mb-4">
        Set up Google Analytics to track advanced metrics:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Integration" > "Google Analytics" in the dashboard</li>
        <li>Enter your Google Analytics Measurement ID (G-XXXXXXXX)</li>
        <li>Choose which events to track</li>
        <li>Enable enhanced e-commerce tracking if needed</li>
        <li>Save changes</li>
      </ol>
      
      <div class="bg-dark-300/50 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
        <pre>// Custom events are tracked automatically
// Example custom GA4 event implementation
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Track question view with custom dimensions
gtag('event', 'view_question', {
  'question_id': '789',
  'question_category': 'SEO',
  'user_type': 'member',
  'is_mobile': true
});</pre>
      </div>
      
      <h3 class="text-lg font-semibold mb-2 mt-4">Zapier Integration</h3>
      
      <p class="mb-4">
        Common Zapier automation recipes:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>New Lead to CRM</strong>: When a lead form is submitted, create a new contact in your CRM</li>
        <li><strong>Question to Slack</strong>: Post a notification to Slack when a new question is asked</li>
        <li><strong>Content to Social Media</strong>: Share top-performing questions on social media</li>
        <li><strong>Rankings to Spreadsheet</strong>: Log keyword ranking changes to Google Sheets</li>
        <li><strong>New Question to Email</strong>: Send notification emails for new questions in specific categories</li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2 mt-4">Mailchimp Integration</h3>
      
      <p class="mb-4">
        Connect with Mailchimp for email marketing:
      </p>
      
      <ol class="list-decimal pl-6 mb-6 space-y-2">
        <li>Go to "Integration" > "Mailchimp" in the dashboard</li>
        <li>Enter your Mailchimp API Key</li>
        <li>Select the audience (list) to use</li>
        <li>Map form fields to Mailchimp fields</li>
        <li>Configure tags and groups</li>
        <li>Enable double opt-in if required</li>
        <li>Save configuration</li>
      </ol>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Custom Forum Embedding</h2>
      
      <p class="mb-4">
        For advanced integration scenarios, you can fully embed the forum in an iframe:
      </p>
      
      <div class="bg-dark-300/50 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
        <pre>&lt;!-- Full forum embed -->
&lt;iframe 
  src="https://yourforum.com/embed?theme=dark&accent=4f46e5&hideHeader=true" 
  width="100%" 
  height="600" 
  frameborder="0"
  allow="clipboard-write"
  id="forum-embed">
&lt;/iframe>

&lt;script>
  // Cross-domain communication with the forum
  window.addEventListener('message', function(event) {
    // Verify origin
    if (event.origin !== 'https://yourforum.com') return;
    
    const data = event.data;
    
    // Handle events from the forum
    switch(data.type) {
      case 'forum:loaded':
        console.log('Forum loaded');
        break;
      case 'forum:question-viewed':
        console.log('Question viewed:', data.questionId);
        break;
      case 'forum:user-authenticated':
        console.log('User authenticated:', data.userId);
        break;
      case 'forum:lead-captured':
        console.log('Lead captured:', data.formId, data.email);
        // Process lead in parent page
        break;
    }
  });
  
  // Send commands to the forum
  function sendToForum(message) {
    document.getElementById('forum-embed').contentWindow.postMessage(
      message, 'https://yourforum.com'
    );
  }
  
  // Example: Navigate to a specific question
  sendToForum({
    type: 'navigate',
    path: '/questions/789'
  });
  
  // Example: Set user data from parent page
  sendToForum({
    type: 'set-user-data',
    userData: {
      email: 'user@example.com',
      name: 'John Doe',
      customFields: {
        company: 'Acme Inc',
        plan: 'enterprise'
      }
    }
  });
&lt;/script></pre>
      </div>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">Mobile SDK Integration</h2>
      
      <p class="mb-4">
        For mobile app developers, we offer native SDKs:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><strong>iOS SDK</strong>: Native Swift framework for iOS 14+</li>
        <li><strong>Android SDK</strong>: Kotlin library for Android API 21+</li>
        <li><strong>React Native</strong>: Cross-platform module</li>
        <li><strong>Flutter</strong>: Dart package for Flutter apps</li>
      </ul>
      
      <div class="bg-dark-300/50 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
        <pre>// React Native example
import { SEOForumView, SEOForumClient } from 'react-native-seo-forum';

// Initialize client
const forumClient = new SEOForumClient({
  apiKey: 'your_api_key',
  forumId: 'your_forum_id'
});

// In your component
function ForumScreen() {
  return (
    &lt;SEOForumView
      client={forumClient}
      theme="dark"
      accentColor="#4f46e5"
      showHeader={true}
      initialPath="/questions"
      onQuestionSelected={(question) => {
        console.log('Selected question:', question);
      }}
      onLeadCaptured={(data) => {
        console.log('Lead captured:', data);
      }}
    />
  );
}</pre>
      </div>
      
      <div class="bg-primary-500/10 p-4 rounded-lg border border-primary-500/30 mb-6">
        <h3 class="text-lg font-medium mb-2 text-primary-400">Developer Resources</h3>
        <p>Access comprehensive API documentation, code samples, and SDKs in our <a href="#" class="text-primary-400 underline">Developer Portal</a>. We offer client libraries for JavaScript, PHP, Python, Ruby, and mobile platforms.</p>
      </div>
      
      <h2 class="text-xl font-semibold mb-3 mt-6">API Rate Limits</h2>
      
      <p class="mb-4">
        API usage is subject to rate limits based on your plan:
      </p>
      
      <div class="overflow-x-auto mb-6">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-primary-500/20">
              <th class="border border-gray-600 px-4 py-2 text-left">Plan</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Requests/minute</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Requests/day</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Concurrent requests</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-600 px-4 py-2">Basic</td>
              <td class="border border-gray-600 px-4 py-2">60</td>
              <td class="border border-gray-600 px-4 py-2">10,000</td>
              <td class="border border-gray-600 px-4 py-2">5</td>
            </tr>
            <tr>
              <td class="border border-gray-600 px-4 py-2">Pro</td>
              <td class="border border-gray-600 px-4 py-2">300</td>
              <td class="border border-gray-600 px-4 py-2">50,000</td>
              <td class="border border-gray-600 px-4 py-2">15</td>
            </tr>
            <tr>
              <td class="border border-gray-600 px-4 py-2">Enterprise</td>
              <td class="border border-gray-600 px-4 py-2">1,000</td>
              <td class="border border-gray-600 px-4 py-2">Unlimited</td>
              <td class="border border-gray-600 px-4 py-2">50</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p class="mb-4">
        The API returns specific headers to help track your usage:
      </p>
      
      <ul class="list-disc pl-6 mb-6 space-y-2">
        <li><code>X-RateLimit-Limit</code>: Your rate limit</li>
        <li><code>X-RateLimit-Remaining</code>: Requests remaining</li>
        <li><code>X-RateLimit-Reset</code>: Timestamp when limit resets</li>
      </ul>
    `
  }
];