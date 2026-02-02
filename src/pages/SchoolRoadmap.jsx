import React from 'react';
import { useParams } from 'react-router-dom';
import NeuralPathRoadmap from '../components/Roadmap/NeuralPathRoadmap';
import { normalizeMasterschoolSlug, getSchoolConfig } from '../services/roadmapService';

/**
 * SchoolRoadmap - Generic roadmap page driven by :masterschool URL param.
 * Maps param to data via roadmapService (getSchoolConfig) and renders NeuralPathRoadmap with correct school.
 */
const SchoolRoadmap = () => {
  const { masterschool: masterschoolSlug } = useParams();
  const masterschool = normalizeMasterschoolSlug(masterschoolSlug);
  const schoolConfig = getSchoolConfig(masterschool);

  return <NeuralPathRoadmap masterschool={masterschool} schoolConfig={schoolConfig} />;
};

export default SchoolRoadmap;
