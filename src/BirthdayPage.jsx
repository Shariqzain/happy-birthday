import { useEffect, useRef, useState } from 'react';
import Iridescence from './Iridescence';
import './BirthdayPage.css';

const birthdayMessage = 'May allahh fulfill all your wishess and grant you a higher place in jannahhh !! ';
const notificationMessage = "You're my favourite notification !!!";
const letterMessage = "Waittt, I've something for youu";
const randomBetween = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);
const fireworkPositions = Array.from({ length: 10 }, (_, index) => ({
  left: `${Math.round(randomBetween(7, 93))}%`,
  bottom: `${Math.round(randomBetween(70, 86))}%`,
  delay: `${(index * 0.73 + randomBetween(0, 0.65)).toFixed(2)}s`,
  scale: randomBetween(1.15, 1.7).toFixed(2),
  burstDistance: Math.round(randomBetween(78, 128)),
}));
const particleAngles = [-90, -60, -30, 0, 30, 60, 90, 120, 150, 180, 210, 240];

function BirthdayTypewriter({ text, active, speed = 42, onComplete }) {
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
      {active && visibleText.length < text.length && <span className="typing-cursor" aria-hidden="true" />}
    </>
  );
}

function Firework({ left, bottom, delay, scale, burstDistance }) {
  return (
    <div className="firework" style={{ '--firework-left': left, '--firework-bottom': bottom, '--firework-delay': delay, '--firework-scale': scale }} aria-hidden="true">
      <span className="firework-core" />
      <div className="firework-particles">
        {particleAngles.map((angle, index) => (
          <span
            className="firework-particle"
            key={angle}
            style={{ '--particle-angle': `${angle}deg`, '--particle-distance': `${burstDistance + (index % 4) * 10}px`, '--particle-delay': `${Number.parseFloat(delay) + (index % 3) * 0.04}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function BirthdayPage({ onNext }) {
  const [headingVisible, setHeadingVisible] = useState(false);
  const [messageActive, setMessageActive] = useState(false);
  const [messageFinished, setMessageFinished] = useState(false);
  const [doodleVisible, setDoodleVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationFinished, setNotificationFinished] = useState(false);
  const [letterMessageVisible, setLetterMessageVisible] = useState(false);
  const [letterMessageFinished, setLetterMessageFinished] = useState(false);
  const [nextVisible, setNextVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);
    const headingTimer = window.setTimeout(() => setHeadingVisible(true), prefersReducedMotion ? 0 : 150);
    const messageTimer = window.setTimeout(() => setMessageActive(true), prefersReducedMotion ? 0 : 1250);
    return () => {
      window.clearTimeout(headingTimer);
      window.clearTimeout(messageTimer);
    };
  }, []);

  useEffect(() => {
    if (!messageFinished) return undefined;

    const doodleTimer = window.setTimeout(() => setDoodleVisible(true), 2000);
    return () => window.clearTimeout(doodleTimer);
  }, [messageFinished]);

  useEffect(() => {
    if (!doodleVisible) return undefined;

    const notificationTimer = window.setTimeout(() => setNotificationVisible(true), 2000);
    return () => window.clearTimeout(notificationTimer);
  }, [doodleVisible]);

  useEffect(() => {
    if (!notificationFinished) return undefined;

    const letterMessageTimer = window.setTimeout(() => setLetterMessageVisible(true), 2000);
    return () => window.clearTimeout(letterMessageTimer);
  }, [notificationFinished]);

  useEffect(() => {
    if (!letterMessageFinished) return undefined;

    setNextVisible(true);
    return undefined;
  }, [letterMessageFinished]);

  return (
    <main className={`birthday-page birthday-finale ${reducedMotion ? 'reduced-motion' : ''}`}>
      <div className="background-glow" aria-hidden="true" />
      <Iridescence color={[0.96, 0.42, 0.7]} mouseReact={false} amplitude={0} speed={1} />
      <div className="birthday-fireworks" aria-hidden="true">
        {fireworkPositions.map((firework) => <Firework key={firework.left} {...firework} />)}
      </div>
      <section className="birthday-finale-content" aria-labelledby="birthday-heading">
        <img className="birthday-kitty" src={`${import.meta.env.BASE_URL}kitty.png`} alt="Hello Kitty taking a photo" />
        <div className="birthday-message-glass">
          
          <h1 id="birthday-heading" className={`birthday-heading ${headingVisible ? 'visible' : ''}`}>
            <span>HAPPY BIRTHDAY MUBEENAAAW!</span><span className="birthday-emoji">✨✨</span>
          </h1>
          <p className={`birthday-wish ${messageActive ? 'visible' : ''} ${notificationVisible ? 'notification-message' : ''}`}>
            <BirthdayTypewriter
              text={letterMessageVisible ? letterMessage : notificationVisible ? notificationMessage : birthdayMessage}
              active={messageActive}
              onComplete={() => {
                if (!messageFinished) setMessageFinished(true);
                if (notificationVisible && !letterMessageVisible) setNotificationFinished(true);
                if (letterMessageVisible) setLetterMessageFinished(true);
              }}
            />
            {messageActive && !notificationVisible && <span className="birthday-emoji">🥰☺️</span>}
          </p>
        </div>
        <div className={`birthday-conversation ${doodleVisible ? 'visible' : ''}`} aria-hidden={!doodleVisible}>
          <img src={`${import.meta.env.BASE_URL}conv_doodle.png`} alt="" />
          <span>Captured your smile, Keep smiling</span>
        </div>
        <button className={`birthday-next ${nextVisible ? 'visible' : ''}`} type="button" onClick={onNext} disabled={!nextVisible}>
          Next <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  );
}

export default BirthdayPage;
