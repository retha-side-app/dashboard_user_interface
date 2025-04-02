import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { noteService } from '../../../../services/noteService';
import type { UserNote } from '../../../../services/types/notes';
import NoteItem from './NoteItem';

interface NotesListProps {
  stepId: string;
}

const NotesList: React.FC<NotesListProps> = ({ stepId }) => {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stepId) {
      loadNotes();
    }
  }, [stepId]);

  const loadNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await noteService.getStepNotes(stepId);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
      console.error('Failed to load notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;
    
    setIsLoading(true);
    try {
      const newNote = await noteService.createNote({
        step_id: stepId,
        content: newNoteContent
      });
      setNotes([newNote, ...notes]);
      setNewNoteContent('');
      setIsAddingNote(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      console.error('Failed to create note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      const updatedNote = await noteService.updateNote(noteId, { content });
      setNotes(notes.map(note => 
        note.id === noteId ? updatedNote : note
      ));
    } catch (err) {
      console.error('Failed to update note:', err);
      throw err;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteService.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
      throw err;
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 p-3 rounded-[5px] text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-primary">My Notes</h3>
        {!isAddingNote && (
          <button
            onClick={() => setIsAddingNote(true)}
            className="flex items-center text-xs md:text-sm text-primary hover:text-opacity-80"
          >
            <PlusCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Add Note
          </button>
        )}
      </div>

      {isAddingNote && (
        <div className="bg-white rounded-[5px] shadow-sm p-3 md:p-4 mb-4">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-[5px] mb-2 min-h-[80px] md:min-h-[100px] text-sm"
            placeholder="Enter your note..."
            disabled={isLoading}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setNewNoteContent('');
                setIsAddingNote(false);
              }}
              className="px-2 py-1 text-xs md:text-sm text-secondary hover:bg-gray-100 rounded-[5px]"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateNote}
              className="px-2 py-1 text-xs md:text-sm bg-primary text-white rounded-[5px] hover:bg-opacity-90"
              disabled={isLoading || !newNoteContent.trim()}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {isLoading && notes.length === 0 ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-100 rounded-[5px] p-4 h-16 md:h-24"></div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-4 md:py-6 text-secondary text-xs md:text-sm">
          No notes yet. Click "Add Note" to create your first note for this step.
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto">
          {notes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;