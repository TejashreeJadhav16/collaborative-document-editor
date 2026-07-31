const fs = require('fs');
const path = require('path');
const { Document, User, SharedDocument } = require('../models');

// Fetch all documents (owned and shared with me)
exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get owned documents
    const owned = await Document.findAll({
      where: { owner_id: userId },
      include: [
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Get shared documents
    const sharedRecords = await SharedDocument.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Document,
          include: [
            {
              model: User,
              as: 'Owner',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Map shared records to clean document objects with permission levels
    const shared = sharedRecords.map(record => {
      if (!record.Document) return null;
      const doc = record.Document.toJSON();
      doc.permission = record.permission;
      return doc;
    }).filter(doc => doc !== null);

    res.json({ owned, shared });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error fetching documents.' });
  }
};

// Fetch single document details
exports.getDocumentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;

    const doc = await Document.findByPk(docId, {
      include: [
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Check ownership
    if (doc.owner_id === userId) {
      const docData = doc.toJSON();
      docData.permission = 'owner';
      return res.json(docData);
    }

    // Check if shared
    const shared = await SharedDocument.findOne({
      where: { document_id: docId, user_id: userId }
    });

    if (!shared) {
      return res.status(403).json({ error: 'Unauthorized access. You do not have access to this document.' });
    }

    const docData = doc.toJSON();
    docData.permission = shared.permission;
    res.json(docData);
  } catch (error) {
    console.error('Get document by ID error:', error);
    res.status(500).json({ error: 'Internal server error fetching document.' });
  }
};

// Create a new document (or import from file upload)
exports.createDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    let title = req.body.title;
    let content = req.body.content || '';

    // Handle file upload import
    if (req.file) {
      const filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();

      // Check extension (must be .txt or .md)
      if (ext !== '.txt' && ext !== '.md') {
        fs.unlinkSync(filePath); // delete temp file
        return res.status(400).json({ error: 'Unsupported file type. Only .txt and .md files are supported.' });
      }

      try {
        // Read file contents
        const fileContent = fs.readFileSync(filePath, 'utf8');
        content = convertTextToHtml(fileContent, ext);
        // Use filename without extension as document title
        title = path.basename(req.file.originalname, ext);
      } catch (fileErr) {
        console.error('File read error:', fileErr);
        return res.status(500).json({ error: 'Failed to read uploaded file.' });
      } finally {
        // Delete the temporary uploaded file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } else {
      // If no file uploaded, title defaults to 'Untitled Document' only if undefined.
      // If title is explicitly passed as empty/whitespace, it's a validation error.
      if (title === undefined) {
        title = 'Untitled Document';
      }
      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Document title cannot be empty.' });
      }
    }

    const newDoc = await Document.create({
      title: title.trim(),
      content,
      owner_id: userId
    });

    // Fetch details to return with Owner
    const createdDoc = await Document.findByPk(newDoc.id, {
      include: [
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const docData = createdDoc.toJSON();
    docData.permission = 'owner';
    res.status(201).json(docData);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Internal server error creating document.' });
  }
};

// Update a document (Rename title and/or edit content)
exports.updateDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;
    const { title, content } = req.body;

    const doc = await Document.findByPk(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Check ownership or share with write permission
    let canEdit = false;
    if (doc.owner_id === userId) {
      canEdit = true;
    } else {
      const shared = await SharedDocument.findOne({
        where: { document_id: docId, user_id: userId, permission: 'write' }
      });
      if (shared) {
        canEdit = true;
      }
    }

    if (!canEdit) {
      return res.status(403).json({ error: 'Unauthorized access. You do not have write permissions for this document.' });
    }

    // Validate empty title if title is being updated
    if (title !== undefined && (!title || title.trim() === '')) {
      return res.status(400).json({ error: 'Document title cannot be empty.' });
    }

    if (title !== undefined) doc.title = title.trim();
    if (content !== undefined) doc.content = content;

    await doc.save();

    res.json({
      message: 'Document updated successfully.',
      document: doc
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Internal server error updating document.' });
  }
};

// Delete a document (only owner)
exports.deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;

    const doc = await Document.findByPk(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Verify ownership
    if (doc.owner_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access. Only the document owner can delete this document.' });
    }

    await doc.destroy();

    res.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error deleting document.' });
  }
};

// Share a document with another user by email
exports.shareDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId, email, permission } = req.body;

    if (!documentId || !email || !permission) {
      return res.status(400).json({ error: 'documentId, email, and permission are required fields.' });
    }

    if (permission !== 'read' && permission !== 'write') {
      return res.status(400).json({ error: "Permission must be either 'read' or 'write'." });
    }

    const doc = await Document.findByPk(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Only owners can share
    if (doc.owner_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized. Only the owner can share this document.' });
    }

    // Find the target user by email
    const targetUser = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!targetUser) {
      return res.status(404).json({ error: `User with email '${email}' not found.` });
    }

    // Owner cannot share with themselves
    if (targetUser.id === userId) {
      return res.status(400).json({ error: 'You cannot share a document with yourself.' });
    }

    // Check if sharing entry already exists
    let share = await SharedDocument.findOne({
      where: { document_id: documentId, user_id: targetUser.id }
    });

    if (share) {
      // Update existing permission
      share.permission = permission;
      await share.save();
    } else {
      // Create new sharing record
      share = await SharedDocument.create({
        document_id: documentId,
        user_id: targetUser.id,
        permission
      });
    }

    res.json({
      message: `Document successfully shared with ${targetUser.name}.`,
      share
    });
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({ error: 'Internal server error sharing document.' });
  }
};

// Convert plain text or markdown files into clean HTML for TipTap editor compatibility
const convertTextToHtml = (text, ext) => {
  if (!text) return '';

  if (ext === '.txt') {
    // Escape HTML characters
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Split by double newlines for paragraphs, and single newlines for line breaks
    return escaped
      .split(/\r?\n\r?\n/)
      .map(p => `<p>${p.replace(/\r?\n/g, '<br />')}</p>`)
      .join('');
  }

  if (ext === '.md') {
    const lines = text.split(/\r?\n/);
    let html = [];
    let inList = false;
    let listType = null; // 'ul' or 'ol'

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmed = line.trim();

      // Check if line matches lists
      const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
      const isNumList = /^\d+\.\s/.test(trimmed);

      // Close open list if we hit an empty line or non-list element
      if (inList && !isBullet && !isNumList && trimmed !== '') {
        html.push(`</${listType}>`);
        inList = false;
        listType = null;
      }

      if (trimmed === '') {
        if (inList) {
          html.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        continue;
      }

      // 1. Headings
      if (trimmed.startsWith('# ')) {
        html.push(`<h1>${parseInlineMarkdown(trimmed.substring(2))}</h1>`);
      } else if (trimmed.startsWith('## ')) {
        html.push(`<h2>${parseInlineMarkdown(trimmed.substring(3))}</h2>`);
      } else if (trimmed.startsWith('### ')) {
        html.push(`<h3>${parseInlineMarkdown(trimmed.substring(4))}</h3>`);
      }
      // 2. Bullet Lists
      else if (isBullet) {
        if (!inList || listType !== 'ul') {
          if (inList) html.push(`</${listType}>`);
          html.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        // Extract content after bullet (remove first 2 chars like '* ', '- ', '• ')
        const content = trimmed.substring(2);
        html.push(`<li>${parseInlineMarkdown(content)}</li>`);
      }
      // 3. Numbered Lists
      else if (isNumList) {
        if (!inList || listType !== 'ol') {
          if (inList) html.push(`</${listType}>`);
          html.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        // Extract content after number
        const content = trimmed.replace(/^\d+\.\s/, '');
        html.push(`<li>${parseInlineMarkdown(content)}</li>`);
      }
      // 4. Standard Paragraph
      else {
        html.push(`<p>${parseInlineMarkdown(line)}</p>`);
      }
    }

    if (inList) {
      html.push(`</${listType}>`);
    }

    return html.join('');
  }

  return text;
};

// Parse basic inline Markdown markers (bold, italic, inline code)
const parseInlineMarkdown = (text) => {
  if (!text) return '';
  return text
    // Escape HTML characters to prevent malformed tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **bold** or __bold__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *italic* or _italic_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`(.*?)`/g, '<code>$1</code>');
};
