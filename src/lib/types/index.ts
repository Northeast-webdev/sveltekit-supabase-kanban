export interface User {
	id: string;
	email: string;
	full_name: string;
}

export interface Team {
	id: string;
	name: string;
	created_by: string;
}

export interface TeamMember {
	team_id: string;
	user_id: string;
	role: 'admin' | 'member';
}

export interface Board {
	id: string;
	name: string;
	owner_id: string;
	team_id?: string;
	is_personal: boolean;
}

export interface Column {
	id: string;
	name: string;
	board_id: string;
	order: number;
}

export interface Card {
	id: string;
	title: string;
	description: string;
	column_id: string;
	order: number;
	assigned_to?: string;
	due_date?: Date;
	is_complete: boolean;
	archived: boolean;
}
