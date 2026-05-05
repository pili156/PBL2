"use client";

import { useState } from 'react';
import UploadCard from "./UploadCard";

export default function Step2Dokumen({
  next,
  prev,
}: {
  next: () => void;
  prev: () => void;
}) {
  const [files, setFiles] = useState<any>({});

  return (
    <div className="flex gap-6">
      <div className="flex-1 grid grid-cols-2 gap-6">
        <UploadCard
          title="SK Kesehatan Jasmani"
          description="Dari RS Pemerintah"
          required
          file={files.jasmani}
          onUpload={(f) => setFiles({ ...files, jasmani: f })}
        />

        <UploadCard
          title="SK Kesehatan Rohani"
          description="Dari dokter"
          required
          file={files.rohani}
          onUpload={(f) => setFiles({ ...files, rohani: f })}
        />
      </div>
    </div>
  );
}

