import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boards: defineTable({
    title: v.string(),
    bg_color: v.string(),
  }),
  items: defineTable({
    board_id: v.id("boards"),
    type: v.string(), // 'note' or 'media'
    content: v.string(),
    x: v.number(),
    y: v.number(),
    z_index: v.number(),
    color: v.optional(v.string()), // for sticky notes
    scale: v.optional(v.number()), // for resizing elements
    width: v.optional(v.number()), // for custom width text wrapping
  }).index("by_board", ["board_id"]),
});
