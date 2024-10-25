import { derived, writable } from 'svelte/store';
import { supabase } from '../supabase';
import type { Board, Card, Column } from '../types';

export const currentBoard = writable<Board | null>(null);
export const columns = writable<Column[]>([]);
export const cards = writable<Card[]>([]);
export const selectedCards = writable<Set<string>>(new Set());
export const undoHistory = writable<
	Array<{
		action: string;
		timestamp: number;
		cards: Card[];
		restore: () => Promise<void>;
	}>
>([]);

// Create derived store for column statistics
export const columnStats = derived([columns, cards], ([$columns, $cards]) => {
	return $columns.map((column) => {
		const columnCards = $cards.filter((card) => card.column_id === column.id && !card.archived);
		const completedCards = columnCards.filter((card) => card.is_complete);

		return {
			columnId: column.id,
			total: columnCards.length,
			completed: completedCards.length,
			percentage:
				columnCards.length > 0 ? Math.round((completedCards.length / columnCards.length) * 100) : 0
		};
	});
});
export const loadBoard = async (boardId: string) => {
	const { data: board, error: boardError } = await supabase
		.from('boards')
		.select('*')
		.eq('id', boardId)
		.single();

	if (boardError) throw boardError;
	currentBoard.set(board);

	const { data: columnsData, error: columnsError } = await supabase
		.from('columns')
		.select('*')
		.eq('board_id', boardId)
		.order('order');

	if (columnsError) throw columnsError;
	columns.set(columnsData);

	const { data: cardsData, error: cardsError } = await supabase
		.from('cards')
		.select('*')
		.eq(
			'column_id',
			columnsData.map((col) => col.id)
		)
		.order('order');

	if (cardsError) throw cardsError;
	cards.set(cardsData);
};
