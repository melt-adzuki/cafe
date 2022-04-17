import deleteNote from './note.js';
import { IRemoteUser } from '@/models/entities/user.js';
import { IDelete, getApId, isTombstone, IObject, validPost, validActor } from '../../type.js';
import { toSingle } from '@/prelude/array.js';
import { deleteActor } from './actor.js';

/**
 * 削除アクティビティを捌きます
 */
export default async (actor: IRemoteUser, activity: IDelete): Promise<string> => {
	if ('actor' in activity && actor.uri !== activity.actor) {
		throw new Error('invalid actor');
	}

	// 削除対象objectのtype
	let formarType: string | undefined;

	if (typeof activity.object === 'string') {
		// typeが不明だけど、どうせ消えてるのでremote resolveしない
		formarType = undefined;
	} else {
		const object = activity.object as IObject;
		if (isTombstone(object)) {
			formarType = toSingle(object.formerType);
		} else {
			formarType = toSingle(object.type);
		}
	}

	const uri = getApId(activity.object);

	// type不明でもactorとobjectが同じならばそれはPersonに違いない
	if (!formarType && actor.uri === uri) {
		formarType = 'Person';
	}

	// それでもなかったらおそらくNote
	if (!formarType) {
		formarType = 'Note';
	}

	// 削除アクティビティーを無視します。
	// 他のインスタンスの迷惑になるため、アクセスできるIPアドレスに制限を施して自分以外のインスタンスと連合させないようにしてください。
	if (validPost.includes(formarType)) {
		// return await deleteNote(actor, uri);
		return 'ok: deleting note ignored.';
	} else if (validActor.includes(formarType)) {
		// return await deleteActor(actor, uri);
		return 'ok: deleting actor ignored.';
	} else {
		return `Unknown type ${formarType}`;
	}
};
