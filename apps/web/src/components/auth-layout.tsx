"use client";

import React from 'react';
import { School } from "lucide-react";
import Link from 'next/link';
import { type ModeToggle } from './mode-toggle';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ 
  children, 
  title = "École Saint Joseph",
  subtitle = "Gestion scolaire intégrée"
}: AuthLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--background)',
        padding: '0.75rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--primary)'
          }}>
            <School style={{ width: '24px', height: '24px' }} />
            <span style={{
              fontWeight: 'bold',
              fontSize: '1.125rem',
            }}>
              {title}
            </span>
          </Link>
          <ModeToggle />
        </div>
      </header>
      
      <main style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: 'var(--foreground)'
            }}>{title}</h1>
            <p style={{
              color: 'var(--muted-foreground)',
              marginTop: '0.5rem'
            }}>{subtitle}</p>
          </div>
          <div style={{
            backgroundColor: 'var(--card)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            padding: '1.5rem'
          }}>
            {children}
          </div>
        </div>
      </main>
      
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1rem 0',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--muted-foreground)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          &copy; {new Date().getFullYear()} École Saint Joseph - Tous droits réservés
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout; 