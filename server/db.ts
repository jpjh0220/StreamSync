import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertPlaylist, InsertPlaylistTrack, InsertTrack, InsertUser, playlistTracks, playlists, tracks, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Track management
export async function upsertTrack(track: InsertTrack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(tracks)
    .where(and(eq(tracks.userId, track.userId), eq(tracks.sourceId, track.sourceId)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(tracks).values(track);
  return { id: Number(result[0].insertId), ...track };
}

export async function getTrackById(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(tracks).where(eq(tracks.id, trackId)).limit(1);
  return result[0];
}

export async function getUserTracks(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(tracks).where(eq(tracks.userId, userId)).orderBy(desc(tracks.createdAt));
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(tracks)
    .where(and(eq(tracks.userId, userId), eq(tracks.isFavorite, 1)))
    .orderBy(desc(tracks.createdAt));
}

export async function updateTrackFavorite(trackId: number, userId: number, isFavorite: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(tracks)
    .set({ isFavorite: isFavorite ? 1 : 0 })
    .where(and(eq(tracks.id, trackId), eq(tracks.userId, userId)));
}

export async function toggleTrackFavorite(
  userId: number,
  trackData: {
    sourceId: string;
    source: string;
    title: string;
    artist?: string;
    duration?: number;
    thumbnail?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find existing track
  const existing = await db
    .select()
    .from(tracks)
    .where(and(eq(tracks.userId, userId), eq(tracks.sourceId, trackData.sourceId)))
    .limit(1);

  if (existing.length > 0) {
    // Toggle favorite status
    const newStatus = existing[0].isFavorite === 1 ? 0 : 1;
    await db
      .update(tracks)
      .set({ isFavorite: newStatus })
      .where(eq(tracks.id, existing[0].id));
    return { isFavorite: newStatus === 1, trackId: existing[0].id };
  } else {
    // Create new track as favorite
    const result = await db.insert(tracks).values({
      userId,
      source: trackData.source as 'youtube' | 'soundcloud',
      sourceId: trackData.sourceId,
      title: trackData.title,
      artist: trackData.artist || '',
      duration: trackData.duration || 0,
      thumbnail: trackData.thumbnail || '',
      isFavorite: 1,
      playCount: 0,
    });
    return { isFavorite: true, trackId: Number(result[0].insertId) };
  }
}

export async function updateTrackPlayCount(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current track
  const track = await getTrackById(trackId);
  if (!track) return;

  await db
    .update(tracks)
    .set({ 
      playCount: (track.playCount || 0) + 1,
      lastPlayedAt: new Date()
    })
    .where(eq(tracks.id, trackId));
}

// Playlist management
export async function createPlaylist(playlist: InsertPlaylist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playlists).values(playlist);
  return { id: Number(result[0].insertId), ...playlist };
}

export async function getUserPlaylists(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(playlists).where(eq(playlists.userId, userId)).orderBy(desc(playlists.createdAt));
}

export async function getPlaylistById(playlistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(playlists).where(eq(playlists.id, playlistId)).limit(1);
  return result[0];
}

export async function updatePlaylist(playlistId: number, userId: number, updates: Partial<InsertPlaylist>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(playlists)
    .set(updates)
    .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));
}

export async function deletePlaylist(playlistId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete playlist tracks first
  await db.delete(playlistTracks).where(eq(playlistTracks.playlistId, playlistId));
  
  // Delete playlist
  await db.delete(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));
}

// Playlist tracks management
export async function addTrackToPlaylist(playlistTrack: InsertPlaylistTrack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playlistTracks).values(playlistTrack);
  return { id: Number(result[0].insertId), ...playlistTrack };
}

export async function getPlaylistTracks(playlistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      id: playlistTracks.id,
      position: playlistTracks.position,
      addedAt: playlistTracks.addedAt,
      track: tracks,
    })
    .from(playlistTracks)
    .leftJoin(tracks, eq(playlistTracks.trackId, tracks.id))
    .where(eq(playlistTracks.playlistId, playlistId))
    .orderBy(playlistTracks.position);

  return result;
}

export async function removeTrackFromPlaylist(playlistTrackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(playlistTracks).where(eq(playlistTracks.id, playlistTrackId));
}
