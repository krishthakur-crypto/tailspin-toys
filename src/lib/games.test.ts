import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getGameById,
} from './games';

async function seedGames(db: Database, count: number): Promise<{ categoryId: number; otherCategoryId: number; publisherId: number; otherPublisherId: number }> {
    const [category, otherCategory] = await db
        .insert(categories)
        .values([
            { name: 'Strategy', description: 'cat' },
            { name: 'Puzzle', description: 'other cat' },
        ])
        .returning({ id: categories.id });
    const [publisher, otherPublisher] = await db
        .insert(publishers)
        .values([
            { name: 'Pub One', description: 'pub' },
            { name: 'Pub Two', description: 'other pub' },
        ])
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: i % 2 === 0 ? otherCategory.id : category.id,
            publisherId: i === 3 ? otherPublisher.id : publisher.id,
        });
    }

    return {
        categoryId: category.id,
        otherCategoryId: otherCategory.id,
        publisherId: publisher.id,
        otherPublisherId: otherPublisher.id,
    };
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('filters games by any selected category', async () => {
        const ids = await seedGames(db, 3);
        const filtered = await getAllGames(db, { categoryIds: [ids.otherCategoryId] });

        expect(filtered.map((game) => game.title)).toEqual(['Game 02']);
    });

    it('filters games by publisher', async () => {
        const ids = await seedGames(db, 3);
        const filtered = await getAllGames(db, { publisherId: ids.otherPublisherId });

        expect(filtered.map((game) => game.title)).toEqual(['Game 03']);
    });

    it('combines category and publisher filters', async () => {
        const ids = await seedGames(db, 3);
        const filtered = await getAllGames(db, {
            categoryIds: [ids.categoryId, ids.otherCategoryId],
            publisherId: ids.publisherId,
        });

        expect(filtered.map((game) => game.title)).toEqual(['Game 01', 'Game 02']);
    });

    it('returns an empty list when filters have no matches', async () => {
        const ids = await seedGames(db, 2);

        await expect(getAllGames(db, { categoryIds: [ids.otherCategoryId], publisherId: ids.otherPublisherId })).resolves.toEqual([]);
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });
});
