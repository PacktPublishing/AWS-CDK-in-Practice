import { render, screen } from '@testing-library/react';
import { App } from './components/App'
import '@testing-library/jest-dom'

test('renders Westpoint logo', () => {
  render(<App />);

  const westpointLogo = screen.getByTestId('header-logo');

  expect(westpointLogo).toBeInTheDocument();
});