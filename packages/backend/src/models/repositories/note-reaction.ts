import { EntityRepository, Repository } from 'typeorm';
import { NoteReaction } from '@/models/entities/note-reaction.js';
import { Notes, Users } from '../index.js';
import { Packed } from '@/misc/schema.js';
import { convertLegacyReaction } from '@/misc/reaction-lib.js';
import { User } from '@/models/entities/user.js';

@EntityRepository(NoteReaction)
export class NoteReactionRepository extends Repository<NoteReaction> {
	public async pack(
		src: NoteReaction['id'] | NoteReaction,
		me?: { id: User['id'] } | null | undefined,
		options?: {
			withNote: boolean;
		},
	): Promise<Packed<'NoteReaction'>> {
		const opts = Object.assign({
			withNote: false,
		}, options);

		const reaction = typeof src === 'object' ? src : await this.findOneOrFail(src);

		return {
			id: reaction.id,
			createdAt: reaction.createdAt.toISOString(),
			user: await Users.pack(reaction.user ?? reaction.userId, me),
			type: convertLegacyReaction(reaction.reaction),
			...(opts.withNote ? {
				note: await Notes.pack(reaction.note ?? reaction.noteId, me),
			} : {}),
		};
	}
}
