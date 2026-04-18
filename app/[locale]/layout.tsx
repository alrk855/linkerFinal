import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../globals.css';
import { Toaster } from 'sonner';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="font-sans antialiased min-h-screen flex flex-col relative">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
