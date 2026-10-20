import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/ui/button';
import { Badge } from '../src/components/ui/badge';
import { Input } from '../src/components/ui/input';
import { Alert } from '../src/components/ui/alert';
import { StatCard } from '../src/components/ui/stat-card';
import { Modal } from '../src/components/ui/modal';

describe('UI Primitives and Components', () => {
  it('renders Button with variants and loading state', () => {
    const { rerender } = render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();

    rerender(<Button isLoading>Click Me</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  it('renders Badges for all invoice statuses', () => {
    const { rerender } = render(<Badge status="PAID" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();

    rerender(<Badge status="ISSUED" />);
    expect(screen.getByText('Issued')).toBeInTheDocument();

    rerender(<Badge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();

    rerender(<Badge status="OVERDUE" />);
    expect(screen.getByText('Overdue')).toBeInTheDocument();

    rerender(<Badge status="CANCELLED" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders Input with label, helperText, and error', () => {
    const { rerender } = render(
      <Input label="Recipient Email" placeholder="client@acme.com" helperText="We will send a copy." />
    );
    expect(screen.getByLabelText('Recipient Email')).toBeInTheDocument();
    expect(screen.getByText('We will send a copy.')).toBeInTheDocument();

    rerender(<Input label="Recipient Email" error="Invalid email address" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address');
  });

  it('renders Alert with different variants', () => {
    const { rerender } = render(
      <Alert variant="error" title="Critical Error">
        Transaction failed
      </Alert>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Critical Error')).toBeInTheDocument();
    expect(screen.getByText('Transaction failed')).toBeInTheDocument();

    rerender(
      <Alert variant="success" title="Success">
        Payment verified
      </Alert>
    );
    expect(screen.getByText('Payment verified')).toBeInTheDocument();
  });

  it('renders StatCard with title, value, and change indicator', () => {
    render(
      <StatCard
        title="Total Invoiced"
        value="5,000.00 XLM"
        change="+12.5%"
        changeType="positive"
        description="Compared to last month"
      />
    );
    expect(screen.getByText('Total Invoiced')).toBeInTheDocument();
    expect(screen.getByText('5,000.00 XLM')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('Compared to last month')).toBeInTheDocument();
  });

  it('renders Modal and triggers close event', () => {
    let closed = false;
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => { closed = true; }} title="Confirm Action">
        <p>Modal body content</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close dialog');
    fireEvent.click(closeBtn);
    expect(closed).toBe(true);

    rerender(
      <Modal isOpen={false} onClose={() => {}} title="Confirm Action">
        <p>Modal body content</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
