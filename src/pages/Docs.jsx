import React from 'react';
import LegalPage from '../components/LegalPage';

const Docs = () => (
  <LegalPage
    title="Documentation"
    description="Full AVbot documentation: getting started, core concepts, all 14 modules, workflows, and a glossary."
    file="documentation.md"
    toc
  />
);

export default Docs;
