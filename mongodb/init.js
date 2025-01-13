db = db.getSiblingDB('setharkk');

db.createUser({
  user: 'setharkk',
  pwd: 'setharkk',
  roles: [
    { role: 'readWrite', db: 'setharkk' },
    { role: 'dbAdmin', db: 'setharkk' }
  ]
});

// Collections initiales
db.createCollection('users');
db.createCollection('transactions');

// Index pour les métriques
db.users.createIndex({ "createdAt": 1 });
db.transactions.createIndex({ "createdAt": 1 });
db.transactions.createIndex({ "amount": 1 }); 