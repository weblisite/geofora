import React from "react";

/**
 * This is a simple passthrough component that renders nothing but lets Clerk
 * handle all the routing logic for verification or other Clerk-specific routes.
 * 
 * The key point is that this component doesn't attempt to redirect or interfere
 * with Clerk's built-in flows.
 */
const ClerkPassthrough: React.FC = () => {
  return null; // Let Clerk control the UI completely
};

export default ClerkPassthrough;