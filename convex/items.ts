import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getItems = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_board", (q) => q.eq("board_id", args.boardId))
      .collect();
  },
});

export const addItem = mutation({
  args: {
    boardId: v.id("boards"),
    type: v.string(),
    content: v.string(),
    x: v.number(),
    y: v.number(),
    zIndex: v.number(),
    color: v.optional(v.string()),
    scale: v.optional(v.number()),
    width: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("items", {
      board_id: args.boardId,
      type: args.type,
      content: args.content,
      x: args.x,
      y: args.y,
      z_index: args.zIndex,
      color: args.color,
      scale: args.scale !== undefined ? args.scale : 1,
      width: args.width,
    });
  },
});

export const updateItem = mutation({
  args: {
    id: v.id("items"),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    zIndex: v.optional(v.number()),
    content: v.optional(v.string()),
    color: v.optional(v.string()),
    scale: v.optional(v.number()),
    width: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Map z_index explicitly if interacting with older JS standard
    const patchObj: any = { ...updates };
    if (updates.zIndex !== undefined) {
      patchObj.z_index = updates.zIndex;
      delete patchObj.zIndex;
    }
    
    await ctx.db.patch(id, patchObj);
  },
});

export const deleteItem = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getUploadUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
