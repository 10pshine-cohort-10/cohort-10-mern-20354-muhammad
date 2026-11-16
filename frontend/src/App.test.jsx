import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('tooling smoke test: React Testing Library renders App', () => {
  it('shows the "Notes" heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Notes' })).toBeInTheDocument();
  });
});
