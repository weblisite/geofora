/**
 * This component creates an absolutely minimal container for Clerk to render verification UI
 * It does not interfere with Clerk at all, just provides an empty DOM node
 */
const EmailVerificationPage = () => {
  return (
    <div 
      id="clerk-verification-container" 
      className="w-full min-h-screen"
      style={{ backgroundColor: 'transparent' }}
    />
  );
};

export default EmailVerificationPage;