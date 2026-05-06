// seed\users.js

/**
 * @type {import('mongodb').OptionalId<any>[]}
 */
export default [
  {
    username: 'Admin',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$UqTatrXJupVDkz6Qu6mcKA$FKUHNfkguSpVLJ03hs5ObjRMmoOEC+T9kTPCfE3Q9E4', // Admin1234
    role: 'Admin',
    isActive: true,
    isOut: true,
    shouldResetPassword: true,
    isTotpConfigured: false,
    tOtpSecret: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    username: 'Billing Staff',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$IhmjF1XZJaSSQgS7rnwicw$bXsEWvyf6/R0zbRDmU2Qq3OysF6Oo0n3ynqPmdwpxCY', // Staff1234
    role: 'Bill Generator',
    isActive: true,
    isOut: true,
    shouldResetPassword: true,
    isTotpConfigured: false,
    tOtpSecret: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
