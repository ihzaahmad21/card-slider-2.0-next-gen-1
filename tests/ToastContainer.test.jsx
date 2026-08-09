import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ToastContainer from '../src/components/ToastContainer.jsx';

describe('ToastContainer', () => {
  it('renders an empty polite live region with no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} />);
    const region = container.querySelector('.toast-container');

    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toBeEmptyDOMElement();
  });

  it('renders one notification per toast', () => {
    render(<ToastContainer toasts={[{ id: 1, message: 'First' }, { id: 2, message: 'Second' }]} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('animates each toast in on the next frame', async () => {
    render(<ToastContainer toasts={[{ id: 1, message: 'Saved' }]} />);

    await waitFor(() => {
      expect(screen.getByText('Saved').className).toContain('show');
    });
  });

  it('drops toasts that are removed from the list', () => {
    const { rerender } = render(<ToastContainer toasts={[{ id: 1, message: 'Bye' }]} />);

    rerender(<ToastContainer toasts={[]} />);

    expect(screen.queryByText('Bye')).toBeNull();
  });
});
