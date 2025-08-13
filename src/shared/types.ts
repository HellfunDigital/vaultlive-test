import z from "zod";

export const ChatMessageSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  username: z.string(),
  message: z.string(),
  platform: z.string().default('vaultkeeper'),
  external_user_id: z.string().nullable(),
  badges: z.string().nullable(),
  is_subscriber: z.boolean(),
  is_deleted: z.boolean(),
  picture: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  name_color: z.string().nullable().optional(),
  user_badges: z.string().nullable().optional(),
  displayed_badges: z.string().nullable().optional(),
  replied_to_message_id: z.number().nullable().optional(),
  replied_to_username: z.string().nullable().optional(),
  has_highlight_effect: z.boolean().optional(),
  has_rainbow_effect: z.boolean().optional(),
  name_glow_color: z.string().nullable().optional(),
});

export const DonationSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  donor_name: z.string(),
  donor_email: z.string().nullable(),
  amount: z.number(),
  message: z.string().nullable(),
  is_anonymous: z.boolean(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const LocalUserSchema = z.object({
  id: z.number(),
  mocha_user_id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  picture: z.string().nullable(),
  is_subscriber: z.boolean(),
  is_admin: z.boolean(),
  is_moderator: z.boolean().optional(),
  is_banned: z.boolean(),
  badges: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  name_color: z.string().nullable().optional(),
  displayed_badges: z.string().nullable().optional(),
  xp_total: z.number().optional(),
  user_level: z.number().optional(),
  points_balance: z.number().optional(),
  points_earned_total: z.number().optional(),
  watch_time_minutes: z.number().optional(),
  referral_token: z.string().nullable().optional(),
  referred_by: z.number().nullable().optional(),
  last_watch_time_update: z.string().nullable().optional(),
  last_name_change_at: z.string().nullable().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Donation = z.infer<typeof DonationSchema>;
export type LocalUser = z.infer<typeof LocalUserSchema>;

// Extended user type that includes local user data
export interface ExtendedMochaUser {
  id: string;
  email: string;
  google_sub: string;
  google_user_data: {
    email: string;
    email_verified: boolean;
    family_name?: string | null;
    given_name?: string | null;
    hd?: string | null;
    name?: string | null;
    picture?: string | null;
    sub: string;
  };
  last_signed_in_at: string;
  created_at: string;
  updated_at: string;
  localUser?: LocalUser;
}
