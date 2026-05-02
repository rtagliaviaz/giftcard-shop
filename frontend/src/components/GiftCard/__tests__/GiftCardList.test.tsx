import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import GiftCardList from '../GiftCardList';
import { fetchGiftCardTypes } from '../../../services/giftCardService';

vi.mock('../../../services/giftCardService', () => ({
  fetchGiftCardTypes: vi.fn(),
}));

const mockFetch = fetchGiftCardTypes as ReturnType<typeof vi.fn>;

const mockCards = [
  { id: 1, name: 'Steam', image: '/steam.jpg', denominations: [{ id: 1, value: 10 }] },
  { id: 2, name: 'Amazon', image: '/amazon.jpg', denominations: [{ id: 2, value: 25 }] },
];

test('displays loading then gift cards', async () => {
  mockFetch.mockResolvedValue(mockCards);
  render(
    <MemoryRouter>
      <GiftCardList />
    </MemoryRouter>
  );
  expect(screen.getByText(/Loading gift cards/i)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('Steam')).toBeInTheDocument());
  expect(screen.getByText('Amazon')).toBeInTheDocument();
});