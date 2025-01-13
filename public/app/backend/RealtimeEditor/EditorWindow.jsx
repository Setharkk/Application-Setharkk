import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../config/db';
import { EditorController } from './EditorController';

const EditorWindow = () => {
  const editorRef = useRef(null);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDocuments(db.getDocuments());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (editorRef.current && currentDocument) {
      const controller = new EditorController(editorRef.current);
      controller.setContent(currentDocument.content);
      
      return () => {
        controller.destroy();
      };
    }
  }, [currentDocument]);

  const handleNewDocument = () => {
    const newDoc = {
      id: Date.now(),
      title: 'Nouveau document',
      content: '',
      timestamp: Date.now()
    };
    db.saveDocument(newDoc);
    setDocuments([newDoc, ...documents]);
    setCurrentDocument(newDoc);
  };

  const handleSave = () => {
    if (currentDocument && editorRef.current) {
      const updatedDoc = {
        ...currentDocument,
        content: editorRef.current.innerHTML,
        timestamp: Date.now()
      };
      db.saveDocument(updatedDoc);
      setDocuments(documents.map(doc => 
        doc.id === updatedDoc.id ? updatedDoc : doc
      ));
      setCurrentDocument(updatedDoc);
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button onClick={handleNewDocument}>Nouveau document</button>
        <button onClick={handleSave} disabled={!currentDocument}>Enregistrer</button>
        <select 
          value={currentDocument?.id || ''} 
          onChange={(e) => {
            const doc = documents.find(d => d.id === Number(e.target.value));
            setCurrentDocument(doc);
          }}
        >
          <option value="">Sélectionner un document</option>
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>
              {doc.title} - {new Date(doc.timestamp).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>
      
      <div 
        ref={editorRef}
        className="editor-content"
        contentEditable={true}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default EditorWindow;
