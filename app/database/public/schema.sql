-- Création de la base de données
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'setharkk_db')
BEGIN
    CREATE DATABASE setharkk_db;
END
GO

USE setharkk_db;
GO

-- Table des utilisateurs
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    )
END
GO

-- Table des conversations
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[conversations]') AND type in (N'U'))
BEGIN
    CREATE TABLE conversations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        title NVARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Conversations_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
END
GO

-- Table des messages
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[messages]') AND type in (N'U'))
BEGIN
    CREATE TABLE messages (
        id INT IDENTITY(1,1) PRIMARY KEY,
        conversation_id INT NOT NULL,
        content NTEXT NOT NULL,
        role NVARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_Messages_Conversations FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
END
GO

-- Table des documents d'édition
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[editor_documents]') AND type in (N'U'))
BEGIN
    CREATE TABLE editor_documents (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        title NVARCHAR(100) NOT NULL,
        content NTEXT,
        last_analyzed DATETIME,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_EditorDocuments_Users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
END
GO

-- Table des analyses SEO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[seo_analyses]') AND type in (N'U'))
BEGIN
    CREATE TABLE seo_analyses (
        id INT IDENTITY(1,1) PRIMARY KEY,
        document_id INT NOT NULL,
        score INT NOT NULL,
        recommendations NTEXT,
        analyzed_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_SeoAnalyses_Documents FOREIGN KEY (document_id) REFERENCES editor_documents(id) ON DELETE CASCADE
    )
END
GO

-- Table des mots-clés SEO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[seo_keywords]') AND type in (N'U'))
BEGIN
    CREATE TABLE seo_keywords (
        id INT IDENTITY(1,1) PRIMARY KEY,
        document_id INT NOT NULL,
        keyword NVARCHAR(100) NOT NULL,
        density FLOAT,
        suggestions NTEXT,
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_SeoKeywords_Documents FOREIGN KEY (document_id) REFERENCES editor_documents(id) ON DELETE CASCADE
    )
END
GO
