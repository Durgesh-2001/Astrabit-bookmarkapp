import { z } from 'zod'

export const bookmarkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  url: z.string().url('Must be a valid URL'),
})

export type BookmarkInput = z.infer<typeof bookmarkSchema>
