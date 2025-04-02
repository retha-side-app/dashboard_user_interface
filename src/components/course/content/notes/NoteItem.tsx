import React, { useState } from 'react';
import { Edit, Trash2, Save, X } from 'lucide-react';
import type { UserNote } from '../../../../services/types/notes';

interface NoteItemProps {
  note: UserNote;
  onUpdate: (noteId: string, content: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleUpdate = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      await onUpdate(note.id, content);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsLoading(true);
      try {
        await onDelete(note.id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-[5px] shadow-sm p-3 md:p-4 mb-4">
      {isEditing ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-[5px] mb-2 min-h-[80px] md:min-h-[100px] text-sm"
            placeholder="Enter your note..."
            disabled={isLoading}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setContent(note.content);
                setIsEditing(false);
              }}
              className="p-1 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleUpdate}
              className="p-1 text-primary hover:text-opacity-80"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-secondary">
              {note.updated_at !== note.created_at 
                ? `Updated: ${formatDate(note.updated_at)}`
                : `Created: ${formatDate(note.created_at)}`
              }
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-500 hover:text-primary"
                disabled={isLoading}
              >
                <Edit className="h-3 w-3 md:h-4 md:w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-500 hover:text-red-500"
                disabled={isLoading}
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
              </button>
            </div>
          </div>
          <p className="text-xs md:text-sm text-secondary whitespace-pre-wrap">{note.content}</p>
        </>
      )}
    </div>
  );
};

export default NoteItem;