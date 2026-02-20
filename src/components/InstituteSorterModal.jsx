import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Helper function to move an item in an array
const arrayMove = (array, from, to) => {
  const newArray = [...array];
  const [movedItem] = newArray.splice(from, 1);
  newArray.splice(to, 0, movedItem);
  return newArray;
};
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { INSTITUTES } from '../constants/institutes'; 

// Import du CSS
import './InstituteSorterModal.css';

// --- COMPOSANT CARTE INDIVIDUELLE ---
const SortableInstitute = ({ institute, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // État crucial pour le style
  } = useSortable({ id: institute.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : 'auto', // Passe au premier plan quand on drag
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`institute-card ${isDragging ? 'is-dragging' : ''}`}
    >
      {/* Numéro de priorité (1, 2, 3...) */}
      <div className="rank-badge">
        {index + 1 < 10 ? `0${index + 1}` : index + 1}
      </div>

      <div className="card-content">
        <h3>{institute.name}</h3>
        <p>{institute.description}</p>
      </div>

      {/* Icône Poignée (Grip) SVG */}
      <div className="drag-handle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </div>
    </div>
  );
};

// --- MODAL PRINCIPAL ---
const InstituteSorterModal = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]); 
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Don't render if no user
  if (!user) {
    return null;
  }

  // Load user's existing priority or use default order
  useEffect(() => {
    const loadUserPriority = async () => {
      if (!user?.id) {
        setItems(INSTITUTES);
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('institute_priority')
          .eq('id', user.id)
          .single();

        if (profile?.institute_priority && profile.institute_priority.length > 0) {
          // Reorder INSTITUTES based on user's priority
          const priorityMap = new Map();
          profile.institute_priority.forEach((name, index) => {
            priorityMap.set(name, index);
          });

          const sorted = [...INSTITUTES].sort((a, b) => {
            const aIndex = priorityMap.has(a.name) ? priorityMap.get(a.name) : Infinity;
            const bIndex = priorityMap.has(b.name) ? priorityMap.get(b.name) : Infinity;
            return aIndex - bIndex;
          });

          setItems(sorted);
        } else {
          // No priority set, use default order
          setItems(INSTITUTES);
        }
      } catch (error) {
        console.error('Error loading user priority:', error);
        setItems(INSTITUTES);
      } finally {
        setLoading(false);
      }
    };

    loadUserPriority();
  }, [user]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Évite le drag accidentel au clic simple
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id);
        const newIndex = items.findIndex((item) => item.name === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const savePriority = async () => {
    if (!user) return;
    setSaving(true);

    const instituteNames = items.map((item) => item.name);

    try {
      // Try using RPC function first (bypasses triggers)
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_institute_priority', {
        p_user_id: user.id,
        p_institute_priority: instituteNames
      });

      if (!rpcError && rpcData?.success) {
        // RPC succeeded
        console.log('Priority saved successfully via RPC:', rpcData);
        setTimeout(() => {
          onSave(instituteNames); 
          onClose(); 
        }, 500);
        return;
      }

      // If RPC doesn't exist or fails, fall back to direct update
      console.warn('RPC not available, trying direct update:', rpcError?.message);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ institute_priority: instituteNames })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('Error saving priority:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Check error type and provide helpful message
        let errorMessage = `Error saving priority: ${error.message || 'Unknown error'}`;
        
        if (error.code === '42703') {
          // Undefined column
          if (error.message?.includes('user_id')) {
            errorMessage = 'Database trigger error: A trigger is trying to access "user_id" on profiles table, but profiles uses "id".\n\nSOLUTIONS:\n1. Run: supabase/migrations/disable_all_profile_triggers_then_fix.sql\n2. OR run: supabase/migrations/update_institute_priority_rpc.sql (creates RPC function to bypass triggers)';
          } else {
            errorMessage = 'Column not found error. Please ensure institute_priority column exists. Run: supabase/migrations/add_institute_priority_column.sql';
          }
        } else if (error.message?.includes('column') || error.message?.includes('field')) {
          errorMessage = 'Column error. Please run migrations:\n1. supabase/migrations/add_institute_priority_column.sql\n2. supabase/migrations/disable_all_profile_triggers_then_fix.sql\n\nOR use RPC: supabase/migrations/update_institute_priority_rpc.sql';
        }
        
        alert(errorMessage);
        setSaving(false);
        return;
      }

      console.log('Priority saved successfully:', data);
      
      // Petit délai pour l'effet UX
      setTimeout(() => {
        onSave(instituteNames); 
        onClose(); 
      }, 500);
      
    } catch (error) {
      console.error('Exception saving priority:', error);
      alert(`Failed to save priority: ${error.message || 'Unknown error'}`);
      setSaving(false);
    }
  };

  if (loading) {
    return createPortal(
      <div className="institute-sorter-overlay">
        <div className="institute-sorter-modal">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
            <p>Loading institutes...</p>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="institute-sorter-overlay" onClick={onClose}>
      <div className="institute-sorter-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* En-tête */}
        <div className="modal-header">
          <h2>WELCOME TO THE NODE NEURAL MAP</h2>
          <p>
            It seems that you are ready to step into this journey. Before starting you must decide the path.
            Please order these cards, it will define your taste and how the path will be created.
            Be careful, this choice is definitive; if you want to start over you'll have to create another account.
          </p>
        </div>

        {/* Zone de Drag & Drop Scrollable */}
        <div className="institute-list-container">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map(item => item.name)} 
              strategy={verticalListSortingStrategy}
            >
              {items.map((institute, index) => (
                <SortableInstitute 
                  key={institute.name} 
                  institute={institute} 
                  index={index} // On passe l'index pour afficher le rang
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Pied de page avec actions */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel" disabled={saving}>
            CANCEL
          </button>
          <button onClick={savePriority} className="btn-confirm" disabled={saving}>
            {saving ? (
               <span><i className="fas fa-spinner fa-spin"></i> SYNCING...</span>
            ) : "CONFIRM PROTOCOL"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default InstituteSorterModal;