import React, { useState } from 'react';
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
  arrayMove // Utilisation directe de la lib
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const [items, setItems] = useState(INSTITUTES); 
  const [saving, setSaving] = useState(false);

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
      const { error } = await supabase
        .from('profiles')
        .update({ institute_priority: instituteNames })
        .eq('id', user.id);

      if (error) throw error;

      console.log('Priority saved.');
      
      // Petit délai pour l'effet UX
      setTimeout(() => {
        onSave(instituteNames); 
        onClose(); 
      }, 500);
      
    } catch (error) {
      console.error('Error saving priority:', error.message);
      setSaving(false);
    }
  };

  return (
    <div className="institute-sorter-overlay">
      <div className="institute-sorter-modal">
        
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
    </div>
  );
};

export default InstituteSorterModal;