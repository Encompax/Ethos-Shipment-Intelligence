import React, { useState } from 'react';

import { uploadFile } from '../api/client';

interface Props {

  dataSourceId: number | null;

}

const UploadPanel: React.FC<Props> = ({ dataSourceId }) => {

  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async () => {

    if (!dataSourceId || !file) return;

    setStatus('Uploading...');

    try {

      await uploadFile(dataSourceId, file);

      setStatus('Completed');

    } catch (e) {

      console.error(e);

      setStatus('Failed');

    }

  };

  return (
<section>
<h2>Upload Files</h2>
<input

        type="file"

        onChange={e => setFile(e.target.files?.[0] ?? null)}

      />
<button disabled={!file || !dataSourceId} onClick={handleUpload}>

        Upload Documents
</button>

      {status && <p>Status: {status}</p>}
</section>

  );

};

export default UploadPanel;
 