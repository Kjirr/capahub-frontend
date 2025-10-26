import React, { useState } from "react";
import Box3DViewer from "./Box3DViewer";

export default function BoxViewerWrapper({ blueprint3D }) {
  const [topOpen, setTopOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);

  if (!blueprint3D) {
      return (
          <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
              Selecteer een model en klik op 'Berekenen'.
          </div>
      );
  }

  return (
    <div className="space-y-2 w-full h-full">
      <div className="flex gap-4 items-center">
        <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => setTopOpen(v => !v)}>
          {topOpen ? "Top sluiten" : "Top openen"}
        </button>
        <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => setBottomOpen(v => !v)}>
          {bottomOpen ? "Bodem sluiten" : "Bodem openen"}
        </button>
      </div>

      <Box3DViewer
        blueprint3D={blueprint3D}
        topFlapsOpen={topOpen}
        bottomFlapsOpen={bottomOpen}
      />
    </div>
  );
}