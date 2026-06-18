import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableTitle } from '../../src/components/EditableTitle';
import { DEFAULT_TITLE } from '../../src/state/document';

describe('EditableTitle', () => {
  it('opens an input when clicking the title and commits with Enter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableTitle value="Sin título" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Sin título' }));
    const input = screen.getByRole('textbox', { name: 'Título de la hoja' });

    await user.clear(input);
    await user.type(input, 'Mi hoja');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('Mi hoja');
    expect(screen.queryByRole('textbox', { name: 'Título de la hoja' })).not.toBeInTheDocument();
  });

  it('commits the title on blur', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableTitle value="Anterior" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    const input = screen.getByRole('textbox', { name: 'Título de la hoja' });

    await user.clear(input);
    await user.type(input, 'Nuevo');
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith('Nuevo');
  });

  it('restores the previous title with Escape', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableTitle value="Anterior" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    const input = screen.getByRole('textbox', { name: 'Título de la hoja' });

    await user.clear(input);
    await user.type(input, 'Temporal');
    await user.keyboard('{Escape}');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
  });

  it('uses the default title when the draft is blank', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableTitle value="Anterior" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    const input = screen.getByRole('textbox', { name: 'Título de la hoja' });

    await user.clear(input);
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(DEFAULT_TITLE);
  });
});
