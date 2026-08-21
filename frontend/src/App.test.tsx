import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Decentralized Employment Verification link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Decentralized Employment Verification/i);
  expect(linkElement).toBeInTheDocument();
});
