/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

//Vibe coded by Shafeeq@google.com

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { Artifact, Session, ComponentVariation, LibraryItem } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId } from './utils';

import DottedGlowBackground from './components/DottedGlowBackground';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import FullscreenModal from './components/FullscreenModal';
import { 
    ThinkingIcon, 
    CodeIcon, 
    SparklesIcon, 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    ArrowUpIcon, 
    GridIcon,
    HomeIcon,
    PaperclipIcon,
    XIcon,
    CopyIcon,
    CheckIcon,
    LibraryIcon,
    TrashIcon,
    WandIcon,
    PlayIcon,
    PauseIcon,
    DownloadIcon,
    GlobeIcon,
    FileTextIcon
} from './components/Icons';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
  const [fullscreenArtifact, setFullscreenArtifact] = useState<Artifact | null>(null);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholders, setPlaceholders] = useState<string[]>(INITIAL_PLACEHOLDERS);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpecCopied, setIsSpecCopied] = useState(false);
  const [isActionBarCopied, setIsActionBarCopied] = useState(false);

  // Global Animation Controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);

  // Component Library State
  const [savedComponents, setSavedComponents] = useState<LibraryItem[]>(() => {
      const stored = localStorage.getItem('flash-ui-library');
      return stored ? JSON.parse(stored) : [];
  });
  
  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | 'variations' | 'library' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      inputRef.current?.focus();
  }, []);

  // Sync Library to LocalStorage
  useEffect(() => {
      localStorage.setItem('flash-ui-library', JSON.stringify(savedComponents));
  }, [savedComponents]);

  // Mobile specific: Close artifact on back button gesture
  useEffect(() => {
      const handlePopState = (e: PopStateEvent) => {
          if (focusedArtifactIndex !== null) {
              setFocusedArtifactIndex(null);
          }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, [focusedArtifactIndex]);

  // Fix for mobile: reset scroll when focusing an item to prevent "overscroll" state
  useEffect(() => {
    if (focusedArtifactIndex !== null && window.innerWidth <= 1024) {
        if (gridScrollRef.current) {
            gridScrollRef.current.scrollTop = 0;
        }
        window.scrollTo(0, 0);
        // Push state for back button handling on Android/Chrome
        window.history.pushState({ focused: true }, '');
    }
  }, [focusedArtifactIndex]);

  // Cycle placeholders
  useEffect(() => {
      const interval = setInterval(() => {
          setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
      }, 3000);
      return () => clearInterval(interval);
  }, [placeholders.length]);

  // Dynamic placeholder generation on load
  useEffect(() => {
      const fetchDynamicPlaceholders = async () => {
          try {
              const apiKey = process.env.API_KEY;
              if (!apiKey) return;
              const ai = new GoogleGenAI({ apiKey });
              const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: { 
                      role: 'user', 
                      parts: [{ 
                          text: 'Generate 20 creative, short, diverse UI component prompts (e.g. "bioluminescent task list"). Return ONLY a raw JSON array of strings. IP SAFEGUARD: Avoid referencing specific famous artists, movies, or brands.' 
                      }] 
                  }
              });
              const text = response.text || '[]';
              const jsonMatch = text.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                  const newPlaceholders = JSON.parse(jsonMatch[0]);
                  if (Array.isArray(newPlaceholders) && newPlaceholders.length > 0) {
                      const shuffled = newPlaceholders.sort(() => 0.5 - Math.random()).slice(0, 10);
                      setPlaceholders(prev => [...prev, ...shuffled]);
                  }
              }
          } catch (e) {
              console.warn("Silently failed to fetch dynamic placeholders", e);
          }
      };
      setTimeout(fetchDynamicPlaceholders, 1000);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              setAttachment(e.target?.result as string);
          };
          reader.readAsDataURL(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileSelect = () => {
      fileInputRef.current?.click();
  };

  const removeAttachment = () => {
      setAttachment(null);
  };

  const handleHome = () => {
      setFocusedArtifactIndex(null);
      setCurrentSessionIndex(-1);
      setInputValue('');
      setAttachment(null);
      setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCopyCode = (customData?: string) => {
      const dataToCopy = customData || drawerState.data;
      if (dataToCopy) {
          navigator.clipboard.writeText(dataToCopy);
          if (customData) {
            setIsActionBarCopied(true);
            setTimeout(() => setIsActionBarCopied(false), 2000);
          } else {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
          }
      }
  };

  const handleDownloadCode = () => {
      const dataToUse = drawerState.data || (focusedArtifactIndex !== null ? sessions[currentSessionIndex].artifacts[focusedArtifactIndex].html : null);
      if (!dataToUse) return;
      const blob = new Blob([dataToUse], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flash-ui-component-${generateId()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleCopyProjectSpec = async () => {
      const dataToAnalyze = drawerState.data || (focusedArtifactIndex !== null ? sessions[currentSessionIndex].artifacts[focusedArtifactIndex].html : null);
      if (!dataToAnalyze || isLoading) return;
      setIsLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `
Analyze this UI component code:
\`\`\`html
${dataToAnalyze}
\`\`\`

Generate a detailed "Project Specification" markdown block that another AI tool (like Cursor or v0) can use to recreate this. Include:
1. DESIGN PHILOSOPHY: The core visual metaphor.
2. COLOR SYSTEM: HEX codes and usage patterns.
3. COMPONENT ARCHITECTURE: Layout logic, flex/grid usage.
4. MOTION RULES: Animation durations and easing.
5. RESPONSIVENESS: How it should adapt to mobile.

Return ONLY the markdown specification.
          `.trim();
          
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: [{ role: 'user', parts: [{ text: prompt }] }]
          });
          
          const spec = response.text || '';
          navigator.clipboard.writeText(spec);
          setIsSpecCopied(true);
          setTimeout(() => setIsSpecCopied(false), 2000);
      } catch (e) {
          console.error("Failed to generate spec", e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSaveToLibrary = useCallback((artifact: Artifact) => {
      const currentSession = sessions[currentSessionIndex];
      const newItem: LibraryItem = {
          id: generateId(),
          name: currentSession?.prompt || 'Unnamed Component',
          styleName: artifact.styleName,
          html: artifact.html,
          timestamp: Date.now()
      };
      setSavedComponents(prev => [newItem, ...prev]);
  }, [sessions, currentSessionIndex]);

  const handleRemoveFromLibrary = (id: string) => {
      setSavedComponents(prev => prev.filter(item => item.id !== id));
  };

  const handleUseLibraryItem = (item: LibraryItem) => {
      const mockArtifact: Artifact = {
          id: item.id,
          html: item.html,
          styleName: item.styleName,
          status: 'complete'
      };
      setFullscreenArtifact(mockArtifact);
  };

  const handleOpenLibrary = () => {
      setDrawerState({ isOpen: true, mode: 'library', title: 'Library', data: null });
  };

  const parseJsonStream = async function* (responseStream: AsyncGenerator<{ text: string }>) {
      let buffer = '';
      for await (const chunk of responseStream) {
          const text = chunk.text;
          if (typeof text !== 'string') continue;
          buffer += text;
          let braceCount = 0;
          let start = buffer.indexOf('{');
          while (start !== -1) {
              braceCount = 0;
              let end = -1;
              for (let i = start; i < buffer.length; i++) {
                  if (buffer[i] === '{') braceCount++;
                  else if (buffer[i] === '}') braceCount--;
                  if (braceCount === 0 && i > start) {
                      end = i;
                      break;
                  }
              }
              if (end !== -1) {
                  const jsonString = buffer.substring(start, end + 1);
                  try {
                      yield JSON.parse(jsonString);
                      buffer = buffer.substring(end + 1);
                      start = buffer.indexOf('{');
                  } catch (e) {
                      start = buffer.indexOf('{', start + 1);
                  }
              } else {
                  break; 
              }
          }
      }
  };

  // Helper to inject the control script into artifacts
  const injectControlScript = (html: string) => {
    if (!html) return html;
    const script = `
<script>
(function() {
    function applyControls(isPaused, speed) {
        const styleId = 'flash-ui-runtime-controls';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }
        
        document.documentElement.style.setProperty('--flash-speed', speed || 1);
        
        styleEl.innerHTML = \`
            * {
                animation-play-state: \${isPaused ? 'paused' : 'running'} !important;
            }
        \`;
    }

    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'UPDATE_CONTROLS') {
            applyControls(e.data.isPaused, e.data.speed);
        }
    });
    
    if (window.parentState) {
        applyControls(window.parentState.isPaused, window.parentState.speed);
    }
})();
</script>
    `;
    return html + script;
  };

  const handleGenerateVariations = useCallback(async () => {
    const currentSession = sessions[currentSessionIndex];
    if (!currentSession || focusedArtifactIndex === null) return;
    const currentArtifact = currentSession.artifacts[focusedArtifactIndex];

    setIsLoading(true);
    setComponentVariations([]);
    setDrawerState({ isOpen: true, mode: 'variations', title: 'Variations', data: currentArtifact.id });

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY is not configured.");
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
You are a master UI/UX designer. Generate 3 RADICAL CONCEPTUAL VARIATIONS of: "${currentSession.prompt}".

**STRICT IP SAFEGUARD:**
No names of artists. 
Instead, describe the *Physicality* and *Material Logic* of the UI.

**YOUR TASK:**
For EACH variation:
- Invent a unique design persona name based on a NEW physical metaphor.
- Rewrite the prompt to fully adopt that metaphor's visual language.
- Generate high-fidelity HTML/CSS.

Required JSON Output Format (stream ONE object per line):
\`{ "name": "Persona Name", "html": "..." }\`
        `.trim();

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
             contents: [{ parts: [{ text: prompt }], role: 'user' }],
             config: { temperature: 1.2 }
        });

        for await (const variation of parseJsonStream(responseStream)) {
            if (variation.name && variation.html) {
                setComponentVariations(prev => [...prev, variation]);
            }
        }
    } catch (e: any) {
        console.error("Error generating variations:", e);
    } finally {
        setIsLoading(false);
    }
  }, [sessions, currentSessionIndex, focusedArtifactIndex]);

  const applyVariation = (html: string) => {
      if (focusedArtifactIndex === null) return;
      setSessions(prev => prev.map((sess, i) => 
          i === currentSessionIndex ? {
              ...sess,
              artifacts: sess.artifacts.map((art, j) => 
                j === focusedArtifactIndex ? { ...art, html, status: 'complete' } : art
              )
          } : sess
      ));
      setDrawerState(s => ({ ...s, isOpen: false }));
  };

  const handleShowCode = () => {
      const currentSession = sessions[currentSessionIndex];
      if (currentSession && focusedArtifactIndex !== null) {
          const artifact = currentSession.artifacts[focusedArtifactIndex];
          setDrawerState({ isOpen: true, mode: 'code', title: 'Source & Export', data: artifact.html });
      }
  };

  const handleConvertToWebsite = async () => {
      if (focusedArtifactIndex === null || isLoading) return;
      const currentArtifact = sessions[currentSessionIndex].artifacts[focusedArtifactIndex];
      
      setIsLoading(true);
      // Update status to streaming
      setSessions(prev => prev.map((s, si) => si === currentSessionIndex ? {
          ...s,
          artifacts: s.artifacts.map((art, ai) => ai === focusedArtifactIndex ? { ...art, status: 'streaming' } : art)
      } : s));

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `
You are a professional Web Architect. 
Take the design language and component DNA from this HTML:
\`\`\`html
${currentArtifact.html}
\`\`\`

**GOAL:**
Expand this single component into a FULL, professional landing page.
The layout must include:
1. A sticky navigation bar with logo and links.
2. A hero section using the current component's visual core.
3. Feature blocks, Testimonials, and a detailed Pricing section.
4. A professional Footer.

Maintain the core metaphor: "${currentArtifact.styleName}".
Ensure the site is responsive and uses high-end typography.
Use calc(durations / var(--flash-speed, 1)) for all transitions.

Return ONLY the raw HTML/CSS for the complete page. No markdown fences.
          `.trim();

          const responseStream = await ai.models.generateContentStream({
              model: 'gemini-3-flash-preview',
              contents: [{ parts: [{ text: prompt }], role: "user" }],
          });

          let accumulatedHtml = '';
          for await (const chunk of responseStream) {
              const text = chunk.text;
              if (typeof text === 'string') {
                  accumulatedHtml += text;
                  setSessions(prev => prev.map((sess, si) => 
                      si === currentSessionIndex ? {
                          ...sess,
                          artifacts: sess.artifacts.map((art, ai) => 
                              ai === focusedArtifactIndex ? { ...art, html: accumulatedHtml } : art
                          )
                      } : sess
                  ));
              }
          }

          let finalHtml = accumulatedHtml.trim();
          if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
          if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
          if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

          setSessions(prev => prev.map((sess, si) => 
              si === currentSessionIndex ? {
                  ...sess,
                  artifacts: sess.artifacts.map((art, ai) => 
                      ai === focusedArtifactIndex ? { ...art, html: finalHtml, status: 'complete' } : art
                  )
              } : sess
          ));
      } catch (e) {
          console.error("Website conversion failed", e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = manualPrompt || inputValue;
    const trimmedInput = promptToUse.trim();
    
    if ((!trimmedInput && !attachment) || isLoading) return;
    if (!manualPrompt) {
        setInputValue('');
        setAttachment(null);
    }

    setIsLoading(true);

    if (focusedArtifactIndex !== null && sessions[currentSessionIndex]) {
        const currentArtifact = sessions[currentSessionIndex].artifacts[focusedArtifactIndex];
        
        setSessions(prev => prev.map((s, si) => si === currentSessionIndex ? {
            ...s,
            artifacts: s.artifacts.map((art, ai) => ai === focusedArtifactIndex ? { ...art, status: 'streaming' } : art)
        } : s));

        try {
            const apiKey = process.env.API_KEY;
            const ai = new GoogleGenAI({ apiKey });
            
            const refinePrompt = `
You are a UI optimization engine.
Existing Component HTML:
\`\`\`html
${currentArtifact.html}
\`\`\`

User Request for Change: "${trimmedInput}"

**TASK:**
Update the existing HTML/CSS to satisfy the user request.
Maintain the core design direction: "${currentArtifact.styleName}".
Include subtle, high-performance CSS/JS animations. 
CRITICAL: Use the CSS variable var(--flash-speed, 1) to multiply your animation and transition durations (e.g., transition: all calc(0.3s / var(--flash-speed, 1)) ease).
Return ONLY the raw updated HTML. No markdown fences.
            `.trim();

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: refinePrompt }], role: "user" }],
            });

            let accumulatedHtml = '';
            for await (const chunk of responseStream) {
                const text = chunk.text;
                if (typeof text === 'string') {
                    accumulatedHtml += text;
                    setSessions(prev => prev.map((sess, si) => 
                        si === currentSessionIndex ? {
                            ...sess,
                            artifacts: sess.artifacts.map((art, ai) => 
                                ai === focusedArtifactIndex ? { ...art, html: accumulatedHtml } : art
                            )
                        } : sess
                    ));
                }
            }

            let finalHtml = accumulatedHtml.trim();
            if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
            if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
            if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

            setSessions(prev => prev.map((sess, si) => 
                si === currentSessionIndex ? {
                    ...sess,
                    artifacts: sess.artifacts.map((art, ai) => 
                        ai === focusedArtifactIndex ? { ...art, html: finalHtml, status: 'complete' } : art
                    )
                } : sess
            ));
        } catch (e) {
            console.error("Refinement failed", e);
        } finally {
            setIsLoading(false);
        }
        return;
    }

    const baseTime = Date.now();
    const sessionId = generateId();

    const placeholderArtifacts: Artifact[] = Array(3).fill(null).map((_, i) => ({
        id: `${sessionId}_${i}`,
        styleName: 'Designing...',
        html: '',
        status: 'streaming',
    }));

    const newSession: Session = {
        id: sessionId,
        prompt: trimmedInput || (attachment ? 'Image Reference' : 'Untitled'),
        timestamp: baseTime,
        artifacts: placeholderArtifacts
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionIndex(sessions.length); 
    setFocusedArtifactIndex(null); 

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API_KEY is not configured.");
        const ai = new GoogleGenAI({ apiKey });

        let imagePart = null;
        if (attachment) {
            const base64Data = attachment.split(',')[1];
            const mimeType = attachment.split(';')[0].split(':')[1];
            imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            };
        }

        const stylePrompt = `
Generate 3 distinct, highly evocative design directions for: "${trimmedInput}".
${attachment ? "A reference image has been provided. Use it as the primary visual inspiration for the layout, color palette, and mood." : ""}

**STRICT IP SAFEGUARD:**
Never use artist or brand names. Use physical and material metaphors.

**GOAL:**
Return ONLY a raw JSON array of 3 *NEW*, creative names for these directions (e.g. ["Tactile Risograph Press", "Kinetic Silhouette Balance", "Primary Pigment Gridwork"]).
        `.trim();

        const styleParts: any[] = [{ text: stylePrompt }];
        if (imagePart) styleParts.push(imagePart);

        const styleResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { role: 'user', parts: styleParts }
        });

        let generatedStyles: string[] = [];
        const styleText = styleResponse.text || '[]';
        const jsonMatch = styleText.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            try {
                generatedStyles = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.warn("Failed to parse styles, using fallbacks");
            }
        }

        if (!generatedStyles || generatedStyles.length < 3) {
            generatedStyles = ["Primary Pigment Gridwork", "Tactile Risograph Layering", "Kinetic Silhouette Balance"];
        }
        
        generatedStyles = generatedStyles.slice(0, 3);

        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            return {
                ...s,
                artifacts: s.artifacts.map((art, i) => ({
                    ...art,
                    styleName: generatedStyles[i]
                }))
            };
        }));

        const generateArtifact = async (artifact: Artifact, styleInstruction: string) => {
            try {
                const prompt = `
You are Flash UI. Create a stunning, high-fidelity UI component for: "${trimmedInput}".
${attachment ? "Use the provided image as a strict visual reference for the layout, colors, and components." : ""}

**CONCEPTUAL DIRECTION: ${styleInstruction}**

**VISUAL EXECUTION RULES:**
1. **Materiality**: Use the specified metaphor to drive every CSS choice.
2. **Typography**: Use high-quality web fonts. Pair a bold sans-serif with a refined monospace for data.
3. **Motion**: Include subtle, high-performance CSS/JS animations. 
   CRITICAL: Use the CSS variable var(--flash-speed, 1) to multiply your animation and transition durations (e.g., transition: all calc(0.3s / var(--flash-speed, 1)) ease).
4. **IP SAFEGUARD**: No artist names or trademarks. 
5. **Layout**: Be bold with negative space and hierarchy. Avoid generic cards.

Return ONLY RAW HTML. No markdown fences.
          `.trim();
          
                const artifactParts: any[] = [{ text: prompt }];
                if (imagePart) artifactParts.push(imagePart);

                const responseStream = await ai.models.generateContentStream({
                    model: 'gemini-3-flash-preview',
                    contents: [{ parts: artifactParts, role: "user" }],
                });

                let accumulatedHtml = '';
                for await (const chunk of responseStream) {
                    const text = chunk.text;
                    if (typeof text === 'string') {
                        accumulatedHtml += text;
                        setSessions(prev => prev.map(sess => 
                            sess.id === sessionId ? {
                                ...sess,
                                artifacts: sess.artifacts.map(art => 
                                    art.id === artifact.id ? { ...art, html: accumulatedHtml } : art
                                )
                            } : sess
                        ));
                    }
                }
                
                let finalHtml = accumulatedHtml.trim();
                if (finalHtml.startsWith('```html')) finalHtml = finalHtml.substring(7).trimStart();
                if (finalHtml.startsWith('```')) finalHtml = finalHtml.substring(3).trimStart();
                if (finalHtml.endsWith('```')) finalHtml = finalHtml.substring(0, finalHtml.length - 3).trimEnd();

                setSessions(prev => prev.map(sess => 
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art => 
                            art.id === artifact.id ? { ...art, html: finalHtml, status: finalHtml ? 'complete' : 'error' } : art
                        )
                    } : sess
                ));

            } catch (e: any) {
                console.error('Error generating artifact:', e);
                setSessions(prev => prev.map(sess => 
                    sess.id === sessionId ? {
                        ...sess,
                        artifacts: sess.artifacts.map(art => 
                            art.id === artifact.id ? { ...art, html: `<div style="color: #ff6b6b; padding: 20px;">Error: ${e.message}</div>`, status: 'error' } : art
                        )
                    } : sess
                ));
            }
        };

        await Promise.all(placeholderArtifacts.map((art, i) => generateArtifact(art, generatedStyles[i])));

    } catch (e) {
        console.error("Fatal error in generation process", e);
    } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, attachment, isLoading, sessions, currentSessionIndex, focusedArtifactIndex]);

  const handleSurpriseMe = () => {
      const currentPrompt = placeholders[placeholderIndex];
      setInputValue(currentPrompt);
      handleSendMessage(currentPrompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Tab' && !inputValue && !isLoading) {
        event.preventDefault();
        setInputValue(placeholders[placeholderIndex]);
    }
  };

  const nextItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex < 2) setFocusedArtifactIndex(focusedArtifactIndex + 1);
      } else {
          if (currentSessionIndex < sessions.length - 1) setCurrentSessionIndex(currentSessionIndex + 1);
      }
  }, [currentSessionIndex, sessions.length, focusedArtifactIndex]);

  const prevItem = useCallback(() => {
      if (focusedArtifactIndex !== null) {
          if (focusedArtifactIndex > 0) setFocusedArtifactIndex(focusedArtifactIndex - 1);
      } else {
           if (currentSessionIndex > 0) setCurrentSessionIndex(currentSessionIndex - 1);
      }
  }, [currentSessionIndex, focusedArtifactIndex]);

  const isLoadingDrawer = isLoading && (drawerState.mode === 'variations' || drawerState.mode === 'code') && !drawerState.data && componentVariations.length === 0;

  const hasStarted = (sessions.length > 0 && currentSessionIndex !== -1) || isLoading;
  const currentSession = sessions[currentSessionIndex];

  let canGoBack = false;
  let canGoForward = false;

  if (hasStarted) {
      if (focusedArtifactIndex !== null) {
          canGoBack = focusedArtifactIndex > 0;
          canGoForward = focusedArtifactIndex < (currentSession?.artifacts.length || 0) - 1;
      } else {
          canGoBack = currentSessionIndex > 0;
          canGoForward = currentSessionIndex < sessions.length - 1;
      }
  }

  const focusedArtifact = (currentSessionIndex !== -1 && focusedArtifactIndex !== null) 
    ? sessions[currentSessionIndex]?.artifacts[focusedArtifactIndex] 
    : null;

  return (
    <>
        {/* Native Mobile Header */}
        <div className={`native-header ${hasStarted ? 'visible' : ''}`}>
            <div className="header-left">
                {focusedArtifactIndex !== null ? (
                    <button className="header-icon-btn" onClick={() => setFocusedArtifactIndex(null)} aria-label="Back to Grid">
                        <ArrowLeftIcon />
                    </button>
                ) : (
                    <button className="header-icon-btn" onClick={handleHome} aria-label="Home">
                        <HomeIcon />
                    </button>
                )}
            </div>
            <div className="header-center">
                <span className="header-title">{focusedArtifact ? focusedArtifact.styleName : 'Flash UI'}</span>
            </div>
            <div className="header-right">
                <button className="header-icon-btn" onClick={handleOpenLibrary} aria-label="Library">
                    <LibraryIcon />
                </button>
            </div>
        </div>

        <a href="https://x.com/Shafeeq" target="_blank" rel="noreferrer" className={`creator-credit ${hasStarted && focusedArtifactIndex === null ? '' : hasStarted ? 'hide-on-mobile' : ''}`}>
            @Shafeeq
        </a>

        <FullscreenModal 
            artifact={fullscreenArtifact ? { ...fullscreenArtifact, html: injectControlScript(fullscreenArtifact.html) } : null} 
            onClose={() => setFullscreenArtifact(null)} 
            isPaused={isPaused}
            speed={animationSpeed}
        />

        <SideDrawer 
            isOpen={drawerState.isOpen} 
            onClose={() => setDrawerState(s => ({...s, isOpen: false}))} 
            title={drawerState.title}
        >
            {isLoadingDrawer && (
                 <div className="loading-state">
                     <ThinkingIcon /> 
                     {drawerState.mode === 'variations' ? 'Designing variations...' : 'Processing...'}
                 </div>
            )}

            {drawerState.mode === 'code' && (
                <div className="code-viewer-container">
                    <div className="drawer-actions-row">
                        <button className="drawer-action-btn" onClick={() => handleCopyCode()}>
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                            {isCopied ? 'Copied' : 'Copy HTML'}
                        </button>
                        <button className="drawer-action-btn" onClick={handleDownloadCode}>
                            <DownloadIcon /> Download
                        </button>
                        <button className="drawer-action-btn spec-btn" onClick={handleCopyProjectSpec} disabled={isLoading}>
                            {isSpecCopied ? <CheckIcon /> : <FileTextIcon />}
                            {isSpecCopied ? 'Copied Spec' : 'Project Spec'}
                        </button>
                    </div>
                    <pre className="code-block"><code>{drawerState.data}</code></pre>
                </div>
            )}
            
            {drawerState.mode === 'variations' && (
                <div className="sexy-grid">
                    {componentVariations.map((v, i) => (
                         <div key={i} className="sexy-card" onClick={() => applyVariation(v.html)}>
                             <div className="sexy-preview">
                                 <iframe srcDoc={v.html} title={v.name} sandbox="allow-scripts allow-same-origin" />
                             </div>
                             <div className="sexy-label">{v.name}</div>
                         </div>
                    ))}
                </div>
            )}

            {drawerState.mode === 'library' && (
                <div className="sexy-grid">
                    {savedComponents.length === 0 && (
                        <div className="loading-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                            Your library is empty. Save components from your sessions to see them here.
                        </div>
                    )}
                    {savedComponents.map((item) => (
                         <div key={item.id} className="sexy-card" onClick={() => handleUseLibraryItem(item)}>
                             <div className="sexy-preview">
                                 <iframe srcDoc={item.html} title={item.name} sandbox="allow-scripts allow-same-origin" />
                             </div>
                             <div className="library-item-info">
                                 <div className="library-item-title">{item.name}</div>
                                 <div className="library-item-meta">{item.styleName}</div>
                                 <button className="library-trash-btn" onClick={(e) => {
                                     e.stopPropagation();
                                     handleRemoveFromLibrary(item.id);
                                 }}>
                                     <TrashIcon />
                                 </button>
                             </div>
                         </div>
                    ))}
                </div>
            )}
        </SideDrawer>

        <div className="immersive-app">
            <DottedGlowBackground gap={24} radius={1.5} color="rgba(255, 255, 255, 0.02)" glowColor="rgba(255, 255, 255, 0.15)" speedScale={0.5} />

            <div className={`stage-container ${focusedArtifactIndex !== null ? 'mode-focus' : 'mode-split'}`}>
                 <div className={`empty-state ${hasStarted ? 'fade-out' : ''}`}>
                     <div className="empty-content">
                         <h1>Flash UI</h1>
                         <p>Creative UI generation in a flash</p>
                         <button className="surprise-button" onClick={handleSurpriseMe} disabled={isLoading}>
                             <SparklesIcon /> Surprise Me
                         </button>
                     </div>
                 </div>

                {sessions.map((session, sIndex) => {
                    let positionClass = 'hidden';
                    if (sIndex === currentSessionIndex) positionClass = 'active-session';
                    else if (sIndex < currentSessionIndex) positionClass = 'past-session';
                    else if (sIndex > currentSessionIndex) positionClass = 'future-session';
                    
                    return (
                        <div key={session.id} className={`session-group ${positionClass}`}>
                            <div className="artifact-grid" ref={sIndex === currentSessionIndex ? gridScrollRef : null}>
                                {session.artifacts.map((artifact, aIndex) => (
                                    <ArtifactCard 
                                        key={artifact.id}
                                        artifact={{ ...artifact, html: injectControlScript(artifact.html) }}
                                        isFocused={focusedArtifactIndex === aIndex}
                                        onClick={() => setFocusedArtifactIndex(aIndex)}
                                        onFullscreen={setFullscreenArtifact}
                                        onSave={handleSaveToLibrary}
                                        isPaused={isPaused}
                                        speed={animationSpeed}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

             {canGoBack && (
                <button className="nav-handle left" onClick={prevItem} aria-label="Previous">
                    <ArrowLeftIcon />
                </button>
             )}
             {canGoForward && (
                <button className="nav-handle right" onClick={nextItem} aria-label="Next">
                    <ArrowRightIcon />
                </button>
             )}

            <div className={`action-bar ${focusedArtifactIndex !== null ? 'visible focused-top' : 'visible'}`}>
                 <div className="active-prompt-label">{currentSession?.prompt}</div>
                 <div className="action-buttons scroll-x-mobile">
                    <div className="animation-control-group">
                        <button className="anim-toggle-btn" onClick={() => setIsPaused(!isPaused)}>
                            {isPaused ? <PlayIcon /> : <PauseIcon />}
                        </button>
                        <div className="speed-slider-container">
                            <span className="speed-label">{animationSpeed}x</span>
                            <input type="range" min="0.1" max="3" step="0.1" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))} />
                        </div>
                    </div>
                    <button onClick={() => setFocusedArtifactIndex(null)} className="hide-on-mobile">
                        <GridIcon /> Grid
                    </button>
                    <button onClick={handleGenerateVariations} disabled={isLoading}>
                        <SparklesIcon /> Variations
                    </button>
                    <button className="direct-copy-btn" onClick={() => handleCopyCode(focusedArtifact?.html)}>
                        {isActionBarCopied ? <CheckIcon /> : <CopyIcon />} {isActionBarCopied ? 'Copied' : 'Copy HTML'}
                    </button>
                    <button className="full-site-btn" onClick={handleConvertToWebsite} disabled={isLoading}>
                        <GlobeIcon /> Website
                    </button>
                    <button onClick={handleShowCode}>
                        <CodeIcon /> Export
                    </button>
                 </div>
            </div>

            <div className="floating-input-container">
                {focusedArtifact && !isLoading && (
                    <div className="quick-refine-chips scroll-x-mobile">
                        <button onClick={() => handleSendMessage("Switch to dark mode")}>Dark Mode</button>
                        <button onClick={() => handleSendMessage("Add minimalist animations")}>Animate</button>
                        <button onClick={() => handleSendMessage("Increase spacing and font size")}>Bolder</button>
                        <button onClick={() => handleSendMessage("Convert to glassmorphism style")}>Glassy</button>
                        <button onClick={() => handleSendMessage("Add a modern search bar")}>Search Bar</button>
                    </div>
                )}
                
                {attachment && (
                    <div className="attachment-preview">
                        <img src={attachment} alt="Reference" />
                        <button className="remove-attachment-btn" onClick={removeAttachment}><XIcon /></button>
                    </div>
                )}
                
                <div className={`input-wrapper ${isLoading ? 'loading' : ''} ${focusedArtifact ? 'refining' : ''}`}>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*" />
                    <button className={`attach-button ${attachment ? 'active' : ''}`} onClick={triggerFileSelect} disabled={isLoading} title="Attach reference image">
                        <PaperclipIcon />
                    </button>
                    
                    {(!inputValue && !isLoading && !attachment) && (
                        <div className="animated-placeholder" key={placeholderIndex}>
                            {focusedArtifact ? (
                                <span className="placeholder-text refining-text">Refine component...</span>
                            ) : (
                                <>
                                    <span className="placeholder-text">{placeholders[placeholderIndex]}</span>
                                    <span className="tab-hint">Tab</span>
                                </>
                            )}
                        </div>
                    )}
                    
                    {!isLoading ? (
                        <input ref={inputRef} type="text" value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} disabled={isLoading} />
                    ) : (
                        <div className="input-generating-label">
                            <span className="generating-prompt-text">{focusedArtifact ? `Updating...` : currentSession?.prompt}</span>
                            <ThinkingIcon />
                        </div>
                    )}
                    
                    <button className="send-button" onClick={() => handleSendMessage()} disabled={isLoading || (!inputValue.trim() && !attachment)}>
                        {focusedArtifact ? <WandIcon /> : <ArrowUpIcon />}
                    </button>
                </div>
                
                {focusedArtifact && !isLoading && (
                    <div className="refine-badge hide-on-mobile">
                        <WandIcon /> <span>Refining: {focusedArtifact.styleName}</span>
                    </div>
                )}
            </div>
        </div>
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}