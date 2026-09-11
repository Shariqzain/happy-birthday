import { useEffect, useRef, useState } from 'react';
import Iridescence from './Iridescence';
import './letter.css';

const promptMessage = "Here's something for you 😛";
const finalMessage = 'Thanks for giving your precious time !!';

function LetterTypewriter({ text, active, onComplete, speed = 52 }) {
  const [visibleText, setVisibleText] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      setVisibleText('');
      return undefined;
    }

    let characterIndex = 0;
    let timer;
    const typeNextCharacter = () => {
      characterIndex += 1;
      setVisibleText(text.slice(0, characterIndex));
      if (characterIndex < text.length) {
        timer = window.setTimeout(typeNextCharacter, speed);
      } else {
        onCompleteRef.current?.();
      }
    };

    timer = window.setTimeout(typeNextCharacter, speed);
    return () => window.clearTimeout(timer);
  }, [active, speed, text]);

  return (
    <>
      {visibleText}
      {active && visibleText.length < text.length && <span className="letter-typing-cursor" aria-hidden="true" />}
    </>
  );
}

function Letter() {
  const [promptActive, setPromptActive] = useState(false);
  const [promptFinished, setPromptFinished] = useState(false);
  const [showDoodle, setShowDoodle] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [finalMessageActive, setFinalMessageActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const openingTimerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);
    const promptTimer = window.setTimeout(() => setPromptActive(true), prefersReducedMotion ? 0 : 850);
    return () => window.clearTimeout(promptTimer);
  }, []);

  useEffect(() => {
    if (!promptFinished) return undefined;
    const doodleTimer = window.setTimeout(() => setShowDoodle(true), 1000);
    return () => window.clearTimeout(doodleTimer);
  }, [promptFinished]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const finalTimer = window.setTimeout(() => setFinalMessageActive(true), reducedMotion ? 0 : 500);
    return () => window.clearTimeout(finalTimer);
  }, [isOpen, reducedMotion]);

  useEffect(() => {
    const documentStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const previousDocumentOverflow = documentStyle.overflowY;
    const previousBodyOverflow = bodyStyle.overflowY;
    const overflow = isOpen ? 'auto' : 'hidden';

    documentStyle.overflowY = overflow;
    bodyStyle.overflowY = overflow;

    return () => {
      documentStyle.overflowY = previousDocumentOverflow;
      bodyStyle.overflowY = previousBodyOverflow;
    };
  }, [isOpen]);

  useEffect(() => () => window.clearTimeout(openingTimerRef.current), []);

  const openLetter = () => {
    if (isOpening || isOpen) return;
    setIsOpening(true);
    openingTimerRef.current = window.setTimeout(() => {
      setIsOpening(false);
      setIsOpen(true);
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    }, reducedMotion ? 0 : 1000);
  };

  const closeLetter = () => {
    window.clearTimeout(openingTimerRef.current);
    setFinalMessageActive(false);
    setIsOpen(false);
    setIsOpening(false);
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <main className={`birthday-page letter-page ${isOpen ? 'letter-is-open' : ''} ${reducedMotion ? 'letter-reduced-motion' : ''}`}>
      <div className="background-glow" aria-hidden="true" />
      <Iridescence color={[0.96, 0.42, 0.7]} mouseReact={false} amplitude={0} speed={1} />

      <section className={`letter-intro ${isOpening ? 'letter-is-opening' : ''} ${isOpen ? 'letter-is-hidden' : ''}`} aria-labelledby="letter-intro-heading">
        <div className="letter-intro-glass">
          <button className="kitty-letter-button" type="button" onClick={openLetter} disabled={isOpening} aria-label="Open the letter Kitty is holding">
            <img src={`${import.meta.env.BASE_URL}kitty_letter.png`} alt="Hello Kitty holding a letter" />
            <span className="letter-envelope-glow" aria-hidden="true" />
            <span className="letter-envelope-flap" aria-hidden="true" />
          </button>
          <p id="letter-intro-heading" className="letter-prompt">
            <LetterTypewriter text={promptMessage} active={promptActive} onComplete={() => setPromptFinished(true)} />
          </p>
          <button className={`conversation-doodle-button ${showDoodle ? 'visible' : ''}`} type="button" onClick={openLetter} disabled={!showDoodle || isOpening} aria-label="Click to open the letter">
            <img src={`${import.meta.env.BASE_URL}conv_doodle.png`} alt="" />
            <span>click me</span>
          </button>
        </div>
      </section>

      <section className={`letter-reveal ${isOpen ? 'visible' : ''}`} aria-labelledby="letter-heading" aria-hidden={!isOpen}>
        <article className="letter-paper">
          <button className="letter-close" type="button" onClick={closeLetter} aria-label="Close letter">Close <span aria-hidden="true">✕</span></button>
          <h1 id="letter-heading">Heyyy Mubeenaaaw,</h1>
          <div className="letter-copy">
            <p>A very happy happy birthdayyy to youuuu ✨✨ May allah fulfill all your wishes and grant you a higher place in jannahhh.</p>
            <p>You're my favourite notification 😊, and will always be. I want to thankk youuu for everything you did to mee, and for everything we did together ✨✨.</p>
            <p>From COSC design team to solving leecode problems together, it's indeeeeed been a long journey. I remember each and every moment spent with you. Thosee sticker battles are sooo funn with youu. Even our instgram blend never disappoints usss 😛😛. Sometimes darkk, sometimes funny, and mostly it'll spam with those couple reeeeelsss, ahhh. I've created a lott of memories with youuu, which I won't forget lifetime (Tum bhi nai bhulna).</p>
            <p>You're a veryy important person in my lifee and will always be ☺️. I'll be available at anytime you need me and will always be there for your support.</p>
            <p>I want you to stay happy forever, keep smiling like you alwaysss do, and do great things in your lifeee and the afterlife. ❤️</p>
          </div>
          <p className="letter-signature">~Shark</p>
        </article>
        <p className={`letter-final-message ${finalMessageActive ? 'visible' : ''}`}>
          <LetterTypewriter text={finalMessage} active={finalMessageActive} />
        </p>
      </section>
    </main>
  );
}

export default Letter;
