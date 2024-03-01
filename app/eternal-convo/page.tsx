"use client";
import React, { useState } from "react";
import { Chat } from "../../components/chat";
import { EmptyScreen } from "../../components/empty-screen";
import { Language } from "../../lib/types";

function EternalConvoPage() {
  const [lang, setLang] = useState<Language>();

  if (lang) {
    return <Chat lang={lang} />;
  } else {
    return <EmptyScreen begin={setLang}></EmptyScreen>;
  }
}

export default EternalConvoPage;
