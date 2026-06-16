"use client";

import { useEffect, useState } from "react";

type ConsentChoice = "necessary" | "all";

const storageKey = "taskovo_cookie_consent";

function saveConsent(choice: ConsentChoice) {
  const payload = {
    choice,
    necessary: true,
    analytics: choice === "all",
    marketing: choice === "all",
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("taskovo-cookie-consent", { detail: payload }));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setVisible(!window.localStorage.getItem(storageKey));
  }, []);

  if (!visible) return null;

  const accept = (choice: ConsentChoice) => {
    saveConsent(choice);
    setVisible(false);
  };

  return (
    <section className="cookie-consent" aria-label="Nastavení cookies">
      <div className="cookie-consent-copy">
        <p className="kicker">Cookies</p>
        <h2>Taskovo používá cookies</h2>
        <p>
          Technické cookies pomáhají s přihlášením, bezpečností a fungováním marketplace. Analytické a marketingové cookies použijeme jen se souhlasem.
        </p>
        {expanded ? (
          <div className="cookie-consent-details">
            <strong>Nezbytné cookies</strong><span>Vždy aktivní pro provoz webu a ochranu účtu.</span>
            <strong>Analytika a marketing</strong><span>Pomáhají měřit výkon a kampaně až po vašem souhlasu.</span>
          </div>
        ) : null}
        <a href="/cookies">Více o cookies</a>
      </div>
      <div className="cookie-consent-actions">
        <button className="button secondary" type="button" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Skrýt nastavení" : "Nastavení"}
        </button>
        <button className="button secondary" type="button" onClick={() => accept("necessary")}>Pouze nezbytné</button>
        <button className="button primary" type="button" onClick={() => accept("all")}>Přijmout vše</button>
      </div>
    </section>
  );
}
