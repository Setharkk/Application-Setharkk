db = db.getSiblingDB('admin');

db.auth('setharkk', 'setharkk');

db.createUser({
  user: "setharkk",
  pwd: "setharkk",
  roles: [
    {
      role: "userAdminAnyDatabase",
      db: "admin"
    },
    {
      role: "readWriteAnyDatabase",
      db: "admin"
    }
  ]
});

db = db.getSiblingDB('setharkk');

db.createCollection('users');
db.createCollection('transactions');

// Index pour les métriques
db.users.createIndex({ "createdAt": 1 });
db.transactions.createIndex({ "createdAt": 1 });
db.transactions.createIndex({ "amount": 1 }); 