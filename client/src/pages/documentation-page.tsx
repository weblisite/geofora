import React, { useState, useEffect } from "react";
import { DocumentationLayout } from "@/components/documentation/documentation-layout";
import { documentationSections } from "@/components/documentation/documentation-sections";

export default function DocumentationPage() {
  const [currentSectionId, setCurrentSectionId] = useState("getting-started");
  const [currentSection, setCurrentSection] = useState<any>(null);

  useEffect(() => {
    // Find the current section from the documentationSections
    const section = documentationSections.find((s) => s.id === currentSectionId);
    if (section) {
      setCurrentSection(section);
    }
  }, [currentSectionId]);

  return (
    <div className="container mx-auto py-8 px-4">
      <DocumentationLayout
        currentSectionId={currentSectionId}
        setCurrentSectionId={setCurrentSectionId}
        sections={documentationSections}
      >
        {currentSection && (
          <div className="documentation-content">
            <div dangerouslySetInnerHTML={{ __html: currentSection.content }} />
          </div>
        )}
      </DocumentationLayout>
    </div>
  );
}