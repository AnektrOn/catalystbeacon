import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './MissionModal.css';

const MissionModal = ({ isOpen, node, masterschool, onClose, onStart, onComplete }) => {
  const [buttonState, setButtonState] = useState('ready');
  const [chapterTitle, setChapterTitle] = useState('');
  const [loadingChapter, setLoadingChapter] = useState(false);

  useEffect(() => {
    if (isOpen && node) {
      setButtonState('ready');
      loadChapterTitle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, node]);

  const loadChapterTitle = async () => {
    if (!node?.lesson) return;
    
    setLoadingChapter(true);
    try {
      // Try to get chapter title from course_structure
      const { data: structure } = await supabase
        .from('course_structure')
        .select(`chapter_title_${node.lesson.chapter_number}`)
        .eq('course_id', node.lesson.course_id)
        .single();

      if (structure) {
        const chapterKey = `chapter_title_${node.lesson.chapter_number}`;
        setChapterTitle(structure[chapterKey] || `Chapter ${node.lesson.chapter_number}`);
      } else {
        // Fallback: check if course_content has attached_to_chapter
        const { data: content } = await supabase
          .from('course_content')
          .select('attached_to_chapter')
          .eq('course_id', node.lesson.course_id)
          .eq('chapter_number', node.lesson.chapter_number)
          .eq('lesson_number', node.lesson.lesson_number)
          .single();

        setChapterTitle(content?.attached_to_chapter || `Chapter ${node.lesson.chapter_number}`);
      }
    } catch (err) {
      console.error('Error loading chapter title:', err);
      setChapterTitle(`Chapter ${node.lesson.chapter_number}`);
    } finally {
      setLoadingChapter(false);
    }
  };

  const handleStart = () => {
    if (buttonState !== 'ready' && buttonState !== 'granted') return;

    setButtonState('encrypting');
    const states = ["ENCRYPTING...", "HANDSHAKING...", "LINK ESTABLISHED"];
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step < states.length) {
        setButtonState(states[step].toLowerCase().replace('...', '').replace(' ', '_'));
      } else {
        clearInterval(interval);
        setButtonState('granted');
        setTimeout(() => {
          onStart();
        }, 500);
      }
    }, 600);
  };

  if (!isOpen || !node) return null;

  const { lesson } = node;
  const level = node.id + 1;

  return (
    <div 
      id="modal-overlay" 
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => {
        if (e.target.id === 'modal-overlay') onClose();
      }}
    >
      <div className="mission-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wider glitch-text" data-text={`NODE ${level}`}>
              NODE {level}
            </h2>
            <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Masterschool: {masterschool}</p>
          </div>
          <div className="text-xs border border-gray-700 px-2 py-1 rounded text-gray-400">LVL {level}</div>
        </div>

        <div className="space-y-4 mb-6">
          {/* Lesson Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center border border-gray-800">
              <i className="fas fa-book text-blue-400 text-xs"></i>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase">Lesson</div>
              <div className="text-sm text-gray-300 font-semibold">{lesson?.lesson_title || 'Unknown Lesson'}</div>
            </div>
          </div>

          {/* Course Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center border border-gray-800">
              <i className="fas fa-graduation-cap text-purple-400 text-xs"></i>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase">Course</div>
              <div className="text-sm text-gray-300">{lesson?.course_title || 'Unknown Course'}</div>
            </div>
          </div>

          {/* Chapter Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center border border-gray-800">
              <i className="fas fa-list text-green-400 text-xs"></i>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase">Chapter</div>
              <div className="text-sm text-gray-300">
                {loadingChapter ? 'Loading...' : (chapterTitle || `Chapter ${lesson?.chapter_number || ''}`)}
              </div>
            </div>
          </div>

          {/* XP Reward */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center border border-gray-800">
              <i className="fas fa-star text-yellow-400 text-xs"></i>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase">XP Reward</div>
              <div className="text-sm text-gray-300">{lesson?.lesson_xp_reward || 0} XP</div>
            </div>
          </div>
        </div>

        <button 
          className={`btn-primary ${buttonState}`}
          onClick={handleStart}
          disabled={buttonState === 'encrypting' || buttonState === 'handshaking' || buttonState === 'link_established'}
        >
          {buttonState === 'ready' && 'Start Lesson'}
          {buttonState === 'encrypting' && <><i className="fas fa-spinner fa-spin"></i> ENCRYPTING...</>}
          {buttonState === 'handshaking' && <><i className="fas fa-spinner fa-spin"></i> HANDSHAKING...</>}
          {buttonState === 'link_established' && <><i className="fas fa-spinner fa-spin"></i> LINK ESTABLISHED</>}
          {buttonState === 'granted' && 'ACCESS GRANTED'}
        </button>
      </div>
    </div>
  );
};

export default MissionModal;
