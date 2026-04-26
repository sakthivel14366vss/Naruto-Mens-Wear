// seeds\rolePermissions.js

export default [
  {
    role: 'Admin',
    permissions: ['permission.all'],
    createdAt: new Date(),
    updatedAt: null,
  },
  {
    role: 'Bill Generator',
    permissions: ['permission.bill.all'],
    createdAt: new Date(),
    updatedAt: null,
  },
];
