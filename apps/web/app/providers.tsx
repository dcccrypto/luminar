'use client'

import { PrivyProvider } from '@privy-io/react-auth'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider 
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id'}
      config={{
        // Customize Privy configuration here
        appearance: {
          theme: 'dark',
          accentColor: '#FFFFFF',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
