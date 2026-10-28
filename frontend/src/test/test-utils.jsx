import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { BrandingProvider } from '../context/BrandingContext';
import { ThemeProvider } from '../context/ThemeContext';

export function renderWithProviders(ui, options = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider>
          <BrandingProvider>
            {children}
          </BrandingProvider>
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}
