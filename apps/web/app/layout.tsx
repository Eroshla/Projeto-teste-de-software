import './globals.css';
import { CartProvider } from '../components/cart-provider';
import { Header } from '../components/header';
import type { ReactNode } from 'react';

export const metadata = { title:'Nexo Store', description:'Mini e-commerce acadêmico com cupons' };
export default function RootLayout({children}:{children:ReactNode}) { return <html lang="pt-BR"><body><CartProvider><Header/><main>{children}</main><footer className="footer"><div className="container">Nexo Store · preços e cupons calculados pela API.</div></footer></CartProvider></body></html>; }
