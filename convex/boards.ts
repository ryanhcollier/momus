import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBoards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("boards").order("desc").collect();
  },
});

export const getBoard = query({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createBoard = mutation({
  args: { title: v.string(), bgColor: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("boards", {
      title: args.title,
      bg_color: args.bgColor,
    });
  },
});

export const deleteBoard = mutation({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    // Delete all items associated with this board
    const items = await ctx.db
      .query("items")
      .withIndex("by_board", (q) => q.eq("board_id", args.id))
      .collect();
      
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    
    // Delete the board
    await ctx.db.delete(args.id);
  },
});
