import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { isRateLimited } from "./rateLimit";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  music: router({
    searchYouTube: publicProcedure
      .input(z.object({ query: z.string().min(1, 'Search query is required'), limit: z.number().min(1).max(50).optional() }))
      .mutation(async ({ input, ctx }) => {
        // Rate limiting: 30 requests per minute per user/IP
        const identifier = ctx.user?.id.toString() || ctx.req.ip || 'anonymous';
        if (isRateLimited(`youtube-search:${identifier}`, 30, 60000)) {
          throw new Error('Too many requests. Please wait a moment before searching again.');
        }

        try {
          const { searchYouTube } = await import('./music');
          return await searchYouTube(input.query, input.limit);
        } catch (error: any) {
          console.error('YouTube search endpoint error:', error);
          // Return empty array for graceful degradation rather than throwing
          return [];
        }
      }),

    searchSoundCloud: publicProcedure
      .input(z.object({ query: z.string().min(1, 'Search query is required'), limit: z.number().min(1).max(50).optional() }))
      .mutation(async ({ input, ctx }) => {
        // Rate limiting: 30 requests per minute per user/IP
        const identifier = ctx.user?.id.toString() || ctx.req.ip || 'anonymous';
        if (isRateLimited(`soundcloud-search:${identifier}`, 30, 60000)) {
          throw new Error('Too many requests. Please wait a moment before searching again.');
        }

        try {
          const { searchSoundCloud } = await import('./music');
          return await searchSoundCloud(input.query, input.limit);
        } catch (error: any) {
          console.error('SoundCloud search endpoint error:', error);
          // Return empty array for graceful degradation rather than throwing
          return [];
        }
      }),

    getYouTubeStream: publicProcedure
      .input(z.object({ videoId: z.string().min(1, 'Video ID is required') }))
      .mutation(async ({ input }) => {
        try {
          const { getYouTubeStreamUrl } = await import('./music');
          return await getYouTubeStreamUrl(input.videoId);
        } catch (error: any) {
          console.error('YouTube stream endpoint error:', error);
          throw new Error('Unable to get stream URL. The video may be restricted or unavailable.');
        }
      }),
  }),

  tracks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserTracks } = await import('./db');
      return await getUserTracks(ctx.user.id);
    }),

    favorites: protectedProcedure.query(async ({ ctx }) => {
      const { getUserFavorites } = await import('./db');
      return await getUserFavorites(ctx.user.id);
    }),

    toggleFavorite: protectedProcedure
      .input(z.object({ 
        sourceId: z.string(),
        source: z.enum(['youtube', 'soundcloud']),
        title: z.string(),
        artist: z.string().optional(),
        duration: z.number().optional(),
        thumbnail: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { toggleTrackFavorite } = await import('./db');
        return await toggleTrackFavorite(ctx.user.id, input);
      }),

    incrementPlayCount: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .mutation(async ({ input }) => {
        const { updateTrackPlayCount } = await import('./db');
        await updateTrackPlayCount(input.trackId);
        return { success: true };
      }),

    save: protectedProcedure
      .input(z.object({
        source: z.enum(['youtube', 'soundcloud']),
        sourceId: z.string(),
        title: z.string(),
        artist: z.string().optional(),
        duration: z.number().optional(),
        thumbnail: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { upsertTrack } = await import('./db');
        return await upsertTrack({
          userId: ctx.user.id,
          ...input,
          isFavorite: 0,
          playCount: 0,
        });
      }),
  }),

  playlists: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserPlaylists } = await import('./db');
      return await getUserPlaylists(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getPlaylistById, getPlaylistTracks } = await import('./db');
        const playlist = await getPlaylistById(input.id);
        if (!playlist) throw new Error('Playlist not found');
        const tracks = await getPlaylistTracks(input.id);
        return { ...playlist, tracks };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        coverImage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createPlaylist } = await import('./db');
        return await createPlaylist({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        coverImage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const { updatePlaylist } = await import('./db');
        await updatePlaylist(id, ctx.user.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deletePlaylist } = await import('./db');
        await deletePlaylist(input.id, ctx.user.id);
        return { success: true };
      }),

    addTrack: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        trackId: z.number(),
        position: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { addTrackToPlaylist } = await import('./db');
        return await addTrackToPlaylist(input);
      }),

    removeTrack: protectedProcedure
      .input(z.object({ playlistTrackId: z.number() }))
      .mutation(async ({ input }) => {
        const { removeTrackFromPlaylist } = await import('./db');
        await removeTrackFromPlaylist(input.playlistTrackId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
