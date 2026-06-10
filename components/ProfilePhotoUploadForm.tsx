"use client";

import { useEffect, useState } from "react";
import { submitProfilePhotoForReview } from "@/app/profile-actions";
import styles from "./ProfilePhotoUploadForm.module.css";

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProfilePhotoUploadForm() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<string>("JPG, PNG nebo WebP do 5 MB");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <form className={`search-panel section-action ${styles.uploadForm}`} action={submitProfilePhotoForReview} encType="multipart/form-data">
      <div className="card-heading">
        <h2>Odeslat novou fotku</h2>
        <p>Soubor uložíme do úložiště a veřejně ho zobrazíme až po schválení administrátorem.</p>
      </div>
      <div className={styles.previewGrid}>
        <div className={styles.previewBox}>
          {previewUrl ? <img src={previewUrl} alt="Náhled vybrané profilové fotky" /> : <span>Náhled fotky</span>}
        </div>
        <div className={styles.previewCopy}>
          <strong>Vyberte jasnou profilovou fotku</strong>
          <p>Ideálně obličej nebo profesionální fotka bez textů, reklam a nevhodného obsahu.</p>
          <span className={styles.fileMeta}>{fileMeta}</span>
        </div>
      </div>
      <label>
        Vybrat fotku
        <input
          name="avatar_file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (!file) {
              setPreviewUrl(null);
              setFileMeta("JPG, PNG nebo WebP do 5 MB");
              return;
            }
            setPreviewUrl(URL.createObjectURL(file));
            setFileMeta(`${file.name} · ${formatFileSize(file.size)}`);
          }}
        />
      </label>
      <button className="button primary" type="submit">Poslat ke kontrole</button>
    </form>
  );
}
