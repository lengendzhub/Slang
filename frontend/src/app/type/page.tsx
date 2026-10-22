"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { RotateCcw, Timer, Zap, Award, Sparkles, Volume2, VolumeX } from "lucide-react";

// Gen-Z Slang Lexicon & Standard English Lexicon
const SLANG_WORDS = [
  "rizz", "no cap", "bussing", "skibidi", "delulu", "sigma", "mid",
  "slay", "ate", "cook", "fanum tax", "sus", "glow up", "main character",
  "sheesh", "valid", "yeet", "vibe check", "touch grass", "ratio",
  "caught in 4k", "side eye", "snatched", "clout", "it is giving",
  "big yikes", "bop", "drip", "let him cook", "ong", "we ball",
  "locked in", "ghosting", "tea", "periodt", "gyatt", "lowkey",
  "highkey", "simp", "rent free", "based", "aura", "crash out",
  "banger", "slaps", "goated", "yap", "chud", "cooked"
];

const ENGLISH_WORDS = [
  "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
  "design", "apple", "system", "speed", "clarity", "minimal",
  "precision", "effortless", "modern", "future", "focus", "balance",
  "practice", "rhythm", "flow", "performance", "craft", "experience",
  "motion", "surface", "typography", "seamless", "pure", "refined"
];

type VocabularyMode = "slang" | "english";
type TimeOption = 15 | 30 | 60;

function getRandomWords(pool: string[], count = 60): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    result.push(pool[randomIndex]);
  }
  return result;
}

export default function SlangTypePage() {
  const [vocabMode, setVocabMode] = useState<VocabularyMode>("slang");
  const [timeLimit, setTimeLimit] = useState<TimeOption>(30);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Typing Game State
  const [words, setWords] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Keystroke history for char-level feedback
  // Map wordIndex -> string of typed letters
  const [wordHistories, setWordHistories] = useState<Record<number, string>>({});

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize word set
  const initGame = useCallback((mode: VocabularyMode = vocabMode, duration: TimeOption = timeLimit) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const pool = mode === "slang" ? SLANG_WORDS : ENGLISH_WORDS;
    setWords(getRandomWords(pool, 80));
    setInputVal("");
    setCurrentWordIdx(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    setStartTime(null);
    setTimeLeft(duration);
    setIsFinished(false);
    setIsStarted(false);
    setWordHistories({});

    // Refocus input after reset
    setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 50);
  }, [vocabMode, timeLimit]);

  useEffect(() => {
    initGame(vocabMode, timeLimit);
  }, [vocabMode, timeLimit, initGame]);

  // Audio click feedback
  const playClickSound = useCallback((correct: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(correct ? 640 : 220, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio not permitted without interaction
    }
  }, [soundEnabled]);

  // Timer countdown
  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isFinished]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const value = e.target.value;

    // Start timer on first keystroke
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    // Spacebar triggers word submission
    if (value.endsWith(" ")) {
      const trimmed = value.trim();
      const targetWord = words[currentWordIdx];

      // Record character stats
      let matches = 0;
      for (let i = 0; i < targetWord.length; i++) {
        if (i < trimmed.length && trimmed[i] === targetWord[i]) {
          matches++;
        }
      }
      const mistakes = Math.max(0, trimmed.length - matches) + Math.max(0, targetWord.length - trimmed.length);

      setCorrectChars((c) => c + matches + (trimmed === targetWord ? 1 : 0)); // include space
      setIncorrectChars((inc) => inc + mistakes);

      setWordHistories((prev) => ({
        ...prev,
        [currentWordIdx]: trimmed,
      }));

      setInputVal("");
      setCurrentWordIdx((idx) => {
        const next = idx + 1;
        // Extend pool if reaching end
        if (next >= words.length - 10) {
          const pool = vocabMode === "slang" ? SLANG_WORDS : ENGLISH_WORDS;
          setWords((w) => [...w, ...getRandomWords(pool, 40)]);
        }
        return next;
      });

      playClickSound(trimmed === targetWord);
      return;
    }

    setInputVal(value);

    // Audio feedback for current character
    const currentTarget = words[currentWordIdx] || "";
    const isCharCorrect = currentTarget.startsWith(value);
    playClickSound(isCharCorrect);
  };

  // Metrics calculation
  const elapsedTimeMinutes = (timeLimit - timeLeft) / 60 || 1 / 60;
  const grossWpm = Math.round((correctChars / 5) / elapsedTimeMinutes) || 0;
  const netWpm = Math.max(0, grossWpm);
  const totalCharsTyped = correctChars + incorrectChars;
  const accuracy = totalCharsTyped > 0 ? Math.round((correctChars / totalCharsTyped) * 100) : 100;

  // Active word and character rendering
  const currentTargetWord = words[currentWordIdx] || "";

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans antialiased transition-colors duration-300">
      {/* Sticky Frosted Glass Navigation */}
      <FrostedNav />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16 max-w-5xl mx-auto w-full">
        {/* Header / Sub-badge */}
        <div className="text-center space-y-2 mb-8 animate-apple-fade">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
            <span className="text-[12px] font-semibold text-[#0071E3] tracking-wide uppercase">
              Gen-Z Typing Engine
            </span>
          </div>

          <h1 className="text-[36px] sm:text-[44px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Slang Type
          </h1>

          <p className="text-[17px] text-[#86868B] max-w-md mx-auto">
            Test your keyboard velocity with modern internet vernacular. Designed with Apple precision.
          </p>
        </div>

        {/* Mode Selector (iOS-style Segmented Control) */}
        {!isFinished && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 animate-apple-fade">
            {/* Vocabulary Segmented Control */}
            <div
              className="flex items-center bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-full p-[3px] transition-all duration-200"
              role="radiogroup"
              aria-label="Vocabulary selector"
            >
              <button
                type="button"
                onClick={() => setVocabMode("slang")}
                aria-checked={vocabMode === "slang"}
                role="radio"
                className={`px-4 py-1.5 text-[14px] font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  vocabMode === "slang"
                    ? "bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                }`}
              >
                Gen-Z Slang
              </button>
              <button
                type="button"
                onClick={() => setVocabMode("english")}
                aria-checked={vocabMode === "english"}
                role="radio"
                className={`px-4 py-1.5 text-[14px] font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  vocabMode === "english"
                    ? "bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                }`}
              >
                English
              </button>
            </div>

            {/* Time Option Segmented Control */}
            <div
              className="flex items-center bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-full p-[3px] transition-all duration-200"
              role="radiogroup"
              aria-label="Time limit selector"
            >
              {([15, 30, 60] as TimeOption[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeLimit(t)}
                  aria-checked={timeLimit === t}
                  role="radio"
                  className={`px-3.5 py-1.5 text-[14px] font-medium rounded-full transition-all duration-200 cursor-pointer ${
                    timeLimit === t
                      ? "bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute audio" : "Enable typing audio"}
              aria-label="Toggle typing audio"
              className="w-8 h-8 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-all active:scale-95 shadow-[0_1px_4px_rgba(0,0,0,0.06)] cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#0071E3]" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Live HUD (Timer, WPM, Accuracy) */}
        {!isFinished && (
          <div className="flex items-center justify-between w-full max-w-[720px] px-3 mb-3 text-[14px] font-medium text-[#86868B]">
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-[#0071E3]" />
              <span className="font-mono text-[16px] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">
                {timeLeft}s
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#0071E3]" />
                <span>WPM:</span>
                <span className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">
                  {isStarted ? grossWpm : 0}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#34C759]" />
                <span>Acc:</span>
                <span className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">
                  {accuracy}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Typing Area or Results View */}
        {!isFinished ? (
          <div
            onClick={() => hiddenInputRef.current?.focus()}
            className="w-full max-w-[720px] bg-white dark:bg-[#1C1C1E] rounded-[16px] p-8 sm:p-10 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-black/5 dark:border-white/10 relative cursor-text transition-all duration-300 min-h-[220px] flex flex-col justify-between"
          >
            {/* Hidden Input Capturing Keystrokes */}
            <input
              ref={hiddenInputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              className="absolute opacity-0 pointer-events-none -top-10"
              autoFocus
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              aria-label="Typing input field"
            />

            {/* Word Display Stream */}
            <div className="font-mono text-[22px] leading-[1.8] flex flex-wrap gap-x-3 gap-y-2 select-none overflow-hidden max-h-[140px]">
              {words.slice(Math.max(0, currentWordIdx - 3), currentWordIdx + 20).map((word, relIdx) => {
                const actualIdx = Math.max(0, currentWordIdx - 3) + relIdx;
                const isCurrent = actualIdx === currentWordIdx;
                const pastTyped = wordHistories[actualIdx];

                if (isCurrent) {
                  return (
                    <span
                      key={actualIdx}
                      className="inline-flex items-center relative rounded px-1 bg-black/5 dark:bg-white/10"
                    >
                      {word.split("").map((char, charIdx) => {
                        let colorClass = "text-[#86868B]";
                        if (charIdx < inputVal.length) {
                          colorClass =
                            inputVal[charIdx] === char
                              ? "text-[#1D1D1F] dark:text-[#F5F5F7] font-medium"
                              : "text-[#FF3B30] bg-red-100 dark:bg-red-950/40 rounded-sm";
                        }

                        const isCursorHere = charIdx === inputVal.length;

                        return (
                          <span key={charIdx} className="relative">
                            {isCursorHere && (
                              <span className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-[#0071E3] rounded-[1px] animate-typing-cursor" />
                            )}
                            <span className={colorClass}>{char}</span>
                          </span>
                        );
                      })}

                      {/* Cursor at word end */}
                      {inputVal.length >= word.length && (
                        <span className="relative inline-block w-0">
                          <span className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-[#0071E3] rounded-[1px] animate-typing-cursor" />
                          {inputVal.slice(word.length).split("").map((overflowChar, ovIdx) => (
                            <span key={ovIdx} className="text-[#FF3B30] bg-red-100 dark:bg-red-950/40">
                              {overflowChar}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  );
                }

                // Completed word
                if (pastTyped !== undefined) {
                  const isMatch = pastTyped === word;
                  return (
                    <span
                      key={actualIdx}
                      className={`${
                        isMatch
                          ? "text-[#1D1D1F] dark:text-[#F5F5F7]"
                          : "text-[#FF3B30] line-through decoration-[#FF3B30]"
                      } transition-colors`}
                    >
                      {word}
                    </span>
                  );
                }

                // Upcoming untyped word
                return (
                  <span key={actualIdx} className="text-[#86868B]">
                    {word}
                  </span>
                );
              })}
            </div>

            {/* Quick Restart Bar */}
            <div className="mt-8 pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[13px] text-[#86868B]">
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 rounded bg-[#E5E5EA] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] font-mono text-[11px]">
                  Tab
                </kbd>
                <span>or click restart to reset test</span>
              </span>

              <button
                type="button"
                onClick={() => initGame()}
                className="flex items-center gap-1.5 text-[#0071E3] hover:text-[#0077ED] font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        ) : (
          /* Results Screen (Apple Hero Cards) */
          <div className="w-full max-w-[620px] bg-white dark:bg-[#1C1C1E] rounded-[20px] p-8 sm:p-12 shadow-[0_4px_40px_rgba(0,0,0,0.08)] border border-black/5 dark:border-white/10 text-center space-y-8 animate-apple-fade">
            {/* Header */}
            <div className="space-y-1">
              <span className="text-[13px] font-semibold text-[#0071E3] uppercase tracking-wider">
                Session Complete
              </span>
              <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Test Results
              </h2>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-black/5 dark:border-white/10">
              <div className="space-y-1">
                <div className="text-[56px] sm:text-[64px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] leading-none tracking-tight">
                  {netWpm}
                </div>
                <div className="text-[13px] text-[#86868B] uppercase tracking-[0.5px] font-medium">
                  Words Per Minute
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[56px] sm:text-[64px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] leading-none tracking-tight">
                  {accuracy}%
                </div>
                <div className="text-[13px] text-[#86868B] uppercase tracking-[0.5px] font-medium">
                  Accuracy
                </div>
              </div>
            </div>

            {/* Detailed Diagnostics */}
            <div className="grid grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-[12px] bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                <div className="text-[12px] text-[#86868B] uppercase">Mode</div>
                <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] capitalize">
                  {vocabMode}
                </div>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                <div className="text-[12px] text-[#86868B] uppercase">Time</div>
                <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {timeLimit} seconds
                </div>
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#F5F5F7] dark:bg-[#2C2C2E]">
                <div className="text-[12px] text-[#86868B] uppercase">Characters</div>
                <div className="text-[15px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  <span className="text-[#34C759]">{correctChars}</span> /{" "}
                  <span className="text-[#FF3B30]">{incorrectChars}</span>
                </div>
              </div>
            </div>

            {/* Try Again CTA Pill */}
            <button
              type="button"
              onClick={() => initGame()}
              className="w-full h-[50px] rounded-full bg-[#0071E3] text-white text-[16px] font-semibold hover:bg-[#0077ED] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
