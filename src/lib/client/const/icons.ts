// src/lib/client/const/icons.ts
const icons = {
  // home: 'icon-[lucide--home]',
  // cog: 'icon-[lucide--cog]',
  user: 'icon-[lucide--user]',
  keyRound: 'icon-[lucide--key-round]',
  eye: 'icon-[lucide--eye]',
  eyeOff: 'icon-[lucide--eye-off]',
} as const;

export default icons;
// Export the type so you can reuse it easily in any component
export type IconKey = keyof typeof icons;
