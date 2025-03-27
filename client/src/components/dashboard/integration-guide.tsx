import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Copy, Check, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface IntegrationGuideProps {
  forumSlug: string;
  forumSubdomain?: string;
  customDomain?: string;
}

export default function IntegrationGuide({ 
  forumSlug,
  forumSubdomain,
  customDomain
}: IntegrationGuideProps) {
  const [activeTab, setActiveTab] = useState<string>("subdomain");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const baseUrl = "formai.repl.app";
  const subdomainUrl = forumSubdomain ? `${forumSubdomain}.${baseUrl}` : `your-subdomain.${baseUrl}`;
  const customUrl = customDomain || "forum.yourdomain.com";
  const subdirectoryUrl = `yourdomain.com/forum/${forumSlug}`;
  
  // Integration code snippets
  const htmlRedirectSnippet = `<!-- Add this to your main website's HTML -->
<a href="https://${activeTab === "subdomain" ? subdomainUrl : 
                   activeTab === "custom" ? customUrl : 
                   subdirectoryUrl}">
  Visit our forum
</a>`;

  const iframeSnippet = `<!-- Add this to embed the forum directly in your page -->
<iframe 
  src="https://${activeTab === "subdomain" ? subdomainUrl : 
              activeTab === "custom" ? customUrl : 
              subdirectoryUrl}" 
  width="100%" 
  height="800px" 
  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</iframe>`;

  const jsSnippet = `// Add this JavaScript to your website
document.addEventListener('DOMContentLoaded', function() {
  const forumButton = document.querySelector('#forum-button');
  forumButton.addEventListener('click', function() {
    window.open('https://${activeTab === "subdomain" ? subdomainUrl : 
                         activeTab === "custom" ? customUrl : 
                         subdirectoryUrl}', '_blank');
  });
});`;

  const handleCopySnippet = (snippetType: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(snippetType);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <ExternalLink className="w-5 h-5 mr-2" />
          Forum Integration Guide
        </CardTitle>
        <CardDescription>
          Learn how to integrate your forum with your main website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="subdomain" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="subdomain">Subdomain</TabsTrigger>
            <TabsTrigger value="custom">Custom Domain</TabsTrigger>
            <TabsTrigger value="subdirectory">Subdirectory</TabsTrigger>
          </TabsList>
          
          {/* Subdomain Integration */}
          <TabsContent value="subdomain" className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Available at</h3>
              <p className="text-sm bg-white dark:bg-slate-900 p-2 rounded flex items-center">
                <span className="text-primary">https://{subdomainUrl}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 ml-2"
                  onClick={() => handleCopySnippet("url-subdomain", `https://${subdomainUrl}`)}
                >
                  {copiedSnippet === "url-subdomain" ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Integration Steps</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Create a subdomain in your forum settings</li>
                <li>Use one of the integration methods below to link to your forum</li>
                <li>Your forum will remain on our servers but appear as part of your brand</li>
              </ol>
            </div>
            
            <IntegrationCodeSnippets 
              htmlSnippet={htmlRedirectSnippet}
              iframeSnippet={iframeSnippet}
              jsSnippet={jsSnippet}
              onCopy={handleCopySnippet}
              copiedSnippet={copiedSnippet}
            />
          </TabsContent>
          
          {/* Custom Domain Integration */}
          <TabsContent value="custom" className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Available at</h3>
              <p className="text-sm bg-white dark:bg-slate-900 p-2 rounded flex items-center">
                <span className="text-primary">https://{customUrl}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 ml-2"
                  onClick={() => handleCopySnippet("url-custom", `https://${customUrl}`)}
                >
                  {copiedSnippet === "url-custom" ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">DNS Configuration Steps</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Add a custom domain in your forum settings</li>
                <li>Create a CNAME record at your DNS provider pointing to <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">formai-proxy.repl.app</code></li>
                <li>Verify domain ownership by adding the TXT record provided</li>
                <li>Wait for DNS propagation (may take up to 24 hours)</li>
                <li>Your forum will be accessible via your custom domain with SSL enabled</li>
              </ol>
            </div>
            
            <IntegrationCodeSnippets 
              htmlSnippet={htmlRedirectSnippet}
              iframeSnippet={iframeSnippet}
              jsSnippet={jsSnippet}
              onCopy={handleCopySnippet}
              copiedSnippet={copiedSnippet}
            />
          </TabsContent>
          
          {/* Subdirectory Integration */}
          <TabsContent value="subdirectory" className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Virtual Path</h3>
              <p className="text-sm bg-white dark:bg-slate-900 p-2 rounded flex items-center">
                <span className="text-primary">https://{subdirectoryUrl}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 ml-2"
                  onClick={() => handleCopySnippet("url-subdirectory", `https://${subdirectoryUrl}`)}
                >
                  {copiedSnippet === "url-subdirectory" ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Proxy Configuration Steps</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Set up a reverse proxy on your server to forward requests</li>
                <li>Configure your web server to route <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">/forum/{forumSlug}</code> to our service</li>
                <li>Set the appropriate headers to maintain session integrity</li>
                <li>Your forum will appear as a subdirectory on your main website</li>
              </ol>
              
              <Collapsible className="mt-3">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center text-xs">
                    <Code className="h-3 w-3 mr-1" />
                    Show server configuration examples
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="bg-slate-900 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-300">Nginx Configuration</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopySnippet("nginx", `location /forum/${forumSlug} {
    proxy_pass https://${forumSubdomain ? subdomainUrl : customUrl};
    proxy_set_header Host ${forumSubdomain ? subdomainUrl : customUrl};
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`)}
                      >
                        {copiedSnippet === "nginx" ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : (
                          <Copy className="h-3 w-3 text-white" />
                        )}
                      </Button>
                    </div>
                    <pre className="text-white text-xs overflow-x-auto"><code>{`location /forum/${forumSlug} {
    proxy_pass https://${forumSubdomain ? subdomainUrl : customUrl};
    proxy_set_header Host ${forumSubdomain ? subdomainUrl : customUrl};
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`}</code></pre>
                  </div>
                  
                  <div className="bg-slate-900 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-300">Apache Configuration</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopySnippet("apache", `<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyPass /forum/${forumSlug} https://${forumSubdomain ? subdomainUrl : customUrl}
    ProxyPassReverse /forum/${forumSlug} https://${forumSubdomain ? subdomainUrl : customUrl}
</IfModule>`)}
                      >
                        {copiedSnippet === "apache" ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : (
                          <Copy className="h-3 w-3 text-white" />
                        )}
                      </Button>
                    </div>
                    <pre className="text-white text-xs overflow-x-auto"><code>{`<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyPass /forum/${forumSlug} https://${forumSubdomain ? subdomainUrl : customUrl}
    ProxyPassReverse /forum/${forumSlug} https://${forumSubdomain ? subdomainUrl : customUrl}
</IfModule>`}</code></pre>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <IntegrationCodeSnippets 
              htmlSnippet={htmlRedirectSnippet}
              iframeSnippet={iframeSnippet}
              jsSnippet={jsSnippet}
              onCopy={handleCopySnippet}
              copiedSnippet={copiedSnippet}
            />
          </TabsContent>
        </Tabs>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-3 rounded-md mt-4">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Important Note
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            When integrating the forum, make sure your main website's styling doesn't conflict with the forum's appearance. 
            If using an iframe, you may need to adjust CSS or use a postMessage API for responsive height adjustments.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Integration code snippets component
function IntegrationCodeSnippets({ 
  htmlSnippet, 
  iframeSnippet, 
  jsSnippet, 
  onCopy, 
  copiedSnippet 
}: { 
  htmlSnippet: string, 
  iframeSnippet: string, 
  jsSnippet: string, 
  onCopy: (type: string, code: string) => void, 
  copiedSnippet: string | null 
}) {
  return (
    <div>
      <h3 className="font-medium mb-2">Integration Methods</h3>
      
      <div className="space-y-3">
        {/* HTML Link */}
        <div className="bg-slate-900 p-3 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-300">HTML Link</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onCopy("html", htmlSnippet)}
            >
              {copiedSnippet === "html" ? (
                <Check className="h-3 w-3 text-white" />
              ) : (
                <Copy className="h-3 w-3 text-white" />
              )}
            </Button>
          </div>
          <pre className="text-white text-xs overflow-x-auto"><code>{htmlSnippet}</code></pre>
        </div>
        
        {/* Iframe Embed */}
        <div className="bg-slate-900 p-3 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-300">Iframe Embed</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onCopy("iframe", iframeSnippet)}
            >
              {copiedSnippet === "iframe" ? (
                <Check className="h-3 w-3 text-white" />
              ) : (
                <Copy className="h-3 w-3 text-white" />
              )}
            </Button>
          </div>
          <pre className="text-white text-xs overflow-x-auto"><code>{iframeSnippet}</code></pre>
        </div>
        
        {/* JavaScript */}
        <div className="bg-slate-900 p-3 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-300">JavaScript</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onCopy("js", jsSnippet)}
            >
              {copiedSnippet === "js" ? (
                <Check className="h-3 w-3 text-white" />
              ) : (
                <Copy className="h-3 w-3 text-white" />
              )}
            </Button>
          </div>
          <pre className="text-white text-xs overflow-x-auto"><code>{jsSnippet}</code></pre>
        </div>
      </div>
    </div>
  );
}