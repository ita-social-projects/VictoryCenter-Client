import React from 'react';
import { render } from '@testing-library/react';
import { NotFound } from './NotFound';

// new comment

describe('NotFound', () => {
  it('renders the component', () => {
    const { container } = render(<NotFound />);
    const pageContainer = container.querySelector('.not-found-page-container');

    expect(pageContainer).toBeInTheDocument();
  });
});
