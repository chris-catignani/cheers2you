/* Components */
import { Providers } from '@/lib/providers'

export const metadata = {
  title: 'Cheers2You',
  description: 'Raise a toast by spelling names with beers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
