"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitProfilePhotoForReview } from "@/app/profile-actions";
import styles from "./ProfilePhotoUploadForm.module.css";

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button primary" type="submit" disabled={pending}>
      {pending ? "Odesíláme fotku..." : "Poslat ke kontrole"}
    </button>
  );
}

export function ProfilePhotoUploadForm() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<string>("JPG, PNG nebo WebP do 5 MB");
  const [hasFile, setHasFile] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <form className={`search-panel section-action ${styles.uploadForm}`} action={submitProfilePhotoForReview} encType="multipart/form-data">
      <div className="card-heading">
        <p className="kicker">Moderace fotky</p>
        <h2>Odeslat novou fotku</h2>
        <p>Soubor uložíme do úložiště a veřejně ho zobrazíme až po schválení administrátorem.</p>
      </div>
      <div className={styles.previewGrid}>
        <div className={`${styles.previewBox} ${hasFile ? styles.previewBoxActive : ""}`}>
          {previewUrl ? <img src={previewUrl} alt="Náhled vybrané profilové fotky" /> : <span>Náhled fotky</span>}
        </div>
        <div className={styles.previewCopy}>
          <strong>Vyberte jasnou profilovou fotku</strong>
          <p>Ideálně obličej nebo profesionální fotka bez textů, reklam a nevhodného obsahu.</p>
          <span className={styles.fileMeta}>{fileMeta}</span>
          <div className={styles.checkRow} aria-label="Požadavky na profilovou fotku">
            <span>JPG</span>
            <span>PNG</span>
            <span>WebP</span>
            <span>max. 5 MB</span>
          </div>
        </div>
      </div>
      <label className={styles.fileField}>
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
              setHasFile(false);
              setFileMeta("JPG, PNG nebo WebP do 5 MB");
              return;
            }
            setPreviewUrl(URL.createObjectURL(file));
            setHasFile(true);
            setFileMeta(`${file.name} · ${formatFileSize(file.size)}`);
          }}
        />
      </label>
      <div className={styles.footerRow}>
        <p>Po odeslání se nová fotka přesune do fronty pro admina.</p>
        <SubmitButton />
      </div>
    </form>
  );
}
