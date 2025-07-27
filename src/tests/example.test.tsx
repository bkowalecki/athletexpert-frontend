
/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';

test('renders hello world', () => {
  render(<div>Hello world</div>);
  expect(screen.getByText(/hello world/i)).toBeInTheDocument();
});