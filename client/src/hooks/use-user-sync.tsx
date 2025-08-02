import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { apiRequest } from '@/lib/queryClient';

/**
 * Hook to automatically sync Clerk authenticated users with backend database
 * This ensures users exist in PostgreSQL for user-specific features
 */
export function useUserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return;

      try {
        // Sync user with backend database
        await apiRequest('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkUserId: user.id,
            username: user.username || user.firstName || `user_${user.id.slice(-6)}`,
            email: user.primaryEmailAddress?.emailAddress || `${user.id}@example.com`,
            name: user.fullName || user.firstName || 'User',
            avatar: user.imageUrl,
          }),
        });
        
        console.log('✅ User synced to database:', user.id);
      } catch (error) {
        console.error('❌ Failed to sync user to database:', error);
        // Don't throw error - let user continue even if sync fails
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
}