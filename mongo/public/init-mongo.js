db.auth('root', 'setharkk')

db = db.getSiblingDB('setharkk')

// Création des collections
db.createCollection('users')
db.createCollection('keywords')
db.createCollection('integrations')

// Création des index
db.users.createIndex({ "email": 1 }, { unique: true })
db.keywords.createIndex({ "userId": 1 })
db.keywords.createIndex({ "createdAt": 1 })
db.integrations.createIndex({ "userId": 1 })

// Création de l'utilisateur de l'application
db.createUser({
    user: "setharkk",
    pwd: "setharkk",
    roles: [
        {
            role: "readWrite",
            db: "setharkk"
        }
    ]
}) 