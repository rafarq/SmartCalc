import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LineRow } from '../../src/components/LineRow';

describe('LineRow', () => {
  it('renders the input value', () => {
    render(<LineRow value="2 + 2" result="4" onChange={() => {}} onEnter={() => {}} />);
    expect(screen.getByDisplayValue('2 + 2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    render(<LineRow value="" result="" onChange={onChange} onEnter={() => {}} />);
    await userEvent.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });
});
