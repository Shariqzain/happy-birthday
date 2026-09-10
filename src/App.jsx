import { useEffect, useRef, useState } from 'react';
import './App.css';
import Iridescence from './Iridescence';
import PhysicsBalloonOverlay from './PhysicsBalloonOverlay';
import DriftWall from './DriftWall';
import BirthdayPage from './BirthdayPage';
import Letter from './letter';

const CYAN_BALLOON_COLORS = ['#00e5ff', '#00bcd4', '#26c6da', '#00acc1', '#4dd0e1', '#80deea'];
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWt3NAFRBWh4N7GvDLIGH3Rbwed6IqER-sDPAp6K2fkN_Y5LgIr_sS0H8onOMiJhU6/exec';

function Typewriter({ text, start, speed = 32, onComplete }) {
  const [visibleText, setVisibleText] = useState('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!start) {
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
  }, [speed, start, text]);

  return (
    <>
      {visibleText}
      {start && <span className="typing-cursor" aria-hidden="true" />}
    </>
  );
}

const questions = [
  {
    prompt: 'The most used word by us',
    type: 'choice',
    options: ['Jannat dreams', 'Bgn', 'aljfaksjhfkjasdhf', 'wowowow'],
  },
  {
    prompt: 'How would you rate your co-design teammate ?',
    type: 'rating',
  },
  {
    prompt: 'Are you glad or do you regret joining COSC, because you got to know about me ?',
    type: 'textarea',
  },
  {
    prompt: 'write a python code to print "Hello Shark". In 1st line it should print once, in the 2nd line it should print twice, repeat the process for 5 lines.',
    type: 'code',
  },
  {
    prompt: 'what is your favourite memory of us ?',
    type: 'textarea',
  },
];
const MINIMUM_LONG_ANSWER_WORDS = 25;

function countWords(value) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function QuestionnairePage({ onFinish }) {
  const [introFinished, setIntroFinished] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState({
    question1: '',
    question2: 0,
    question3: '',
    question4: '',
    question5: '',
  });
  const submissionStartedRef = useRef(false);

  const answerKey = `question${currentQuestion + 1}`;
  const currentAnswer = answers[answerKey];
  const currentQuestionData = currentQuestion >= 0 ? questions[currentQuestion] : null;
  const isLongAnswer = currentQuestionData?.type === 'textarea';
  const currentWordCount = isLongAnswer ? countWords(currentAnswer) : 0;
  const canContinue = isLongAnswer
    ? currentWordCount >= MINIMUM_LONG_ANSWER_WORDS
    : Boolean(currentAnswer);

  const updateAnswer = (value) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [answerKey]: value,
    }));
  };

  const renderQuestionInput = (question) => {
    if (question.type === 'choice') {
      return (
        <div className="question-options">
          {question.options.map((option) => (
            <label className={`answer-option ${currentAnswer === option ? 'selected' : ''}`} key={option}>
              <input
                type="radio"
                name="question-1"
                value={option}
                checked={currentAnswer === option}
                onChange={() => updateAnswer(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );
    }

    if (question.type === 'rating') {
      return (
        <div className="star-rating" aria-label="Choose a rating from one to five stars">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              className={`star-button ${rating <= currentAnswer ? 'selected' : ''}`}
              key={rating}
              type="button"
              aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
              aria-pressed={currentAnswer === rating}
              onClick={() => updateAnswer(rating)}
            >
              {rating <= currentAnswer ? '★' : '☆'}
            </button>
          ))}
        </div>
      );
    }

    if (question.type === 'textarea') {
      const wordCount = countWords(currentAnswer);
      return (
        <div className="long-answer-field">
          <textarea
            className="answer-field"
            value={currentAnswer}
            onChange={(event) => updateAnswer(event.target.value)}
            placeholder="Type your answer..."
            rows={5}
          />
          <p className={`word-count ${wordCount >= MINIMUM_LONG_ANSWER_WORDS ? 'complete' : ''}`}>
            Minimum {MINIMUM_LONG_ANSWER_WORDS} words · {wordCount}/{MINIMUM_LONG_ANSWER_WORDS}
          </p>
        </div>
      );
    }

    return (
      <textarea
        className="answer-field code-field"
        value={currentAnswer}
        onChange={(event) => updateAnswer(event.target.value)}
        placeholder="Type your answer..."
        rows={8}
      />
    );
  };

  if (currentQuestion === -1) {
    return (
      <section className="journey-panel questionnaire-intro">
        <p className="journey-message">
          <Typewriter
            text="Let's start with some questions"
            start
            speed={55}
            onComplete={() => setIntroFinished(true)}
          />
        </p>
        <button className={`choice-button journey-button ${introFinished ? 'revealed' : ''}`} type="button" onClick={() => setCurrentQuestion(0)} disabled={!introFinished}>
          Continue
        </button>
      </section>
    );
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const goNext = () => {
    if (!canContinue) return;
    if (isLastQuestion) {
      if (submissionStartedRef.current) return;
      submissionStartedRef.current = true;
      const formData = {
        answer1: answers.question1,
        answer2: answers.question2,
        answer3: answers.question3,
        answer4: answers.question4,
        answer5: answers.question5,
      };

      try {
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          keepalive: true,
          body: JSON.stringify(formData),
        }).catch((error) => {
          console.error('Google Sheets submission failed:', error);
        });
      } catch (error) {
        console.error('Submission error:', error);
      }

      onFinish(answers);
      return;
    }
    setCurrentQuestion((questionIndex) => questionIndex + 1);
  };

  return (
    <section className="journey-panel question-panel" key={currentQuestion}>
      <p className="question-count">Question {currentQuestion + 1} of {questions.length}</p>
      <h2 className="question-prompt">
        <Typewriter text={question.prompt} start speed={32} />
      </h2>
      <div className="question-input-area">{renderQuestionInput(question)}</div>
      <nav className="question-navigation" aria-label="Question navigation">
        {currentQuestion > 0 && (
          <button className="choice-button journey-button" type="button" onClick={() => setCurrentQuestion((questionIndex) => questionIndex - 1)}>
            Previous
          </button>
        )}
        <button className="choice-button journey-button" type="button" onClick={goNext} disabled={!canContinue}>
          {isLastQuestion ? 'Submit' : 'Next'}
        </button>
      </nav>
    </section>
  );
}

function CompletionPage({ onContinue }) {
  const [messageFinished, setMessageFinished] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    if (!messageFinished) return undefined;
    const timer = window.setTimeout(() => setButtonVisible(true), 2000);
    return () => window.clearTimeout(timer);
  }, [messageFinished]);

  return (
    <section className="journey-panel completion-panel">
      <p className="journey-message">
        <Typewriter
          text="Let me show my favourite memories of us !"
          start
          speed={55}
          onComplete={() => setMessageFinished(true)}
        />
      </p>
      <button className={`choice-button journey-button ${buttonVisible ? 'revealed' : ''}`} type="button" onClick={onContinue} disabled={!buttonVisible}>
        Let's goooo !
      </button>
    </section>
  );
}

function FinalPage({ answers }) {
  return (
    <div className="memories-page-content" data-questionnaire-complete={Boolean(answers)}>
      <DriftWall />
    </div>
  );
}

function MemoriesPage({ answers, onNext }) {
  const [showBalloons, setShowBalloons] = useState(true);
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    const balloonTimer = window.setTimeout(() => setShowBalloons(false), 7000);
    const nextTimer = window.setTimeout(() => setShowNext(true), 10000);
    return () => {
      window.clearTimeout(balloonTimer);
      window.clearTimeout(nextTimer);
    };
  }, []);

  return (
    <>
      <FinalPage answers={answers} />
      {showBalloons && <PhysicsBalloonOverlay balloonColors={CYAN_BALLOON_COLORS} />}
      <button className={`memories-next ${showNext ? 'visible' : ''}`} type="button" onClick={onNext} disabled={!showNext}>
        Next <span aria-hidden="true">→</span>
      </button>
    </>
  );
}

function App() {
  const [view, setView] = useState('home');
  const [submittedAnswers, setSubmittedAnswers] = useState(null);
  const [showHome, setShowHome] = useState(false);
  const [showIntroMessage, setShowIntroMessage] = useState(true);
  const [subtitleFinished, setSubtitleFinished] = useState(false);
  const [headingFinished, setHeadingFinished] = useState(false);
  const [subtitleStarted, setSubtitleStarted] = useState(false);
  const [secondMessageStarted, setSecondMessageStarted] = useState(false);
  const [finalMessageFinished, setFinalMessageFinished] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const noButtonRef = useRef(null);
  const [noButtonPosition, setNoButtonPosition] = useState(null);
  const previousNoButtonPositionRef = useRef(null);

  useEffect(() => {
    if (!headingFinished) {
      return undefined;
    }

    const subtitleTimer = window.setTimeout(() => setSubtitleStarted(true), 500);
    return () => window.clearTimeout(subtitleTimer);
  }, [headingFinished]);

  useEffect(() => {
    if (!subtitleFinished) {
      return undefined;
    }

    const messageTimer = window.setTimeout(() => setSecondMessageStarted(true), 1000);
    return () => window.clearTimeout(messageTimer);
  }, [subtitleFinished]);

  useEffect(() => {
    if (!finalMessageFinished) {
      return undefined;
    }

    const buttonsTimer = window.setTimeout(() => setButtonsVisible(true), 1000);
    return () => window.clearTimeout(buttonsTimer);
  }, [finalMessageFinished]);

  const moveNoButton = (event) => {
    event.preventDefault();
    const button = noButtonRef.current;
    if (!button) return;

    const { width, height } = button.getBoundingClientRect();
    const padding = 20;
    const maxX = Math.max(padding, window.innerWidth - width - padding);
    const maxY = Math.max(padding, window.innerHeight - height - padding);
    const previousPosition = previousNoButtonPositionRef.current;
    let nextPosition;

    do {
      nextPosition = {
        left: padding + Math.random() * Math.max(0, maxX - padding),
        top: padding + Math.random() * Math.max(0, maxY - padding),
      };
    } while (
      previousPosition
      && Math.abs(nextPosition.left - previousPosition.left) < 1
      && Math.abs(nextPosition.top - previousPosition.top) < 1
    );

    previousNoButtonPositionRef.current = nextPosition;
    setNoButtonPosition(nextPosition);
  };

  useEffect(() => {
    const messageTimer = window.setTimeout(() => setShowIntroMessage(false), 4000);
    const homeTimer = window.setTimeout(() => setShowHome(true), 7400);

    return () => {
      window.clearTimeout(messageTimer);
      window.clearTimeout(homeTimer);
    };
  }, []);

  if (view === 'questionnaire') {
    return (
      <main className="birthday-page journey-page">
        <div className="background-glow" aria-hidden="true" />
        <Iridescence color={[0.96, 0.42, 0.7]} mouseReact={false} amplitude={0} speed={1} />
        <QuestionnairePage onFinish={(answers) => {
          setSubmittedAnswers(answers);
          setView('completion');
        }} />
      </main>
    );
  }

  if (view === 'completion') {
    return (
      <main className="birthday-page journey-page">
        <div className="background-glow" aria-hidden="true" />
        <Iridescence color={[0.96, 0.42, 0.7]} mouseReact={false} amplitude={0} speed={1} />
        <CompletionPage onContinue={() => setView('final')} />
      </main>
    );
  }

  if (view === 'final') {
    return (
      <main className="birthday-page journey-page memories-page">
        <div className="background-glow" aria-hidden="true" />
        <Iridescence color={[0.96, 0.42, 0.7]} mouseReact={false} amplitude={0} speed={1} />
        <MemoriesPage answers={submittedAnswers} onNext={() => setView('birthday')} />
      </main>
    );
  }

  if (view === 'birthday') {
    return <BirthdayPage onNext={() => setView('letter')} />;
  }

  if (view === 'letter') {
    return <Letter />;
  }

  return (
    <main className={`birthday-page ${showHome ? 'ready' : ''}`}>
      <div className="background-glow" aria-hidden="true" />
      
      <Iridescence
        color={[0.96, 0.42, 0.7]}
        mouseReact={false}
        amplitude={0}
        speed={1}
      />

      {!showHome && <PhysicsBalloonOverlay />}

      <div className={`intro-message ${showIntroMessage ? 'visible' : ''}`}>
        <div className="intro-message-glass">
          <p>
            <Typewriter
              text="Hint : The balloons hide something special. Try moving the balloons."
              start={showIntroMessage}
              speed={45}
            />
          </p>
        </div>
      </div>

      <section className={`card ${showHome ? 'visible' : ''}`}>
        <img className="homepage-kitty" src={`${import.meta.env.BASE_URL}kitty.png`} alt="Hello Kitty taking a photo" />
        <div className="message-block">
          <h2>
            <Typewriter
              text="Hii Mubeenaaaw !"
              start={showHome}
              speed={100}
              onComplete={() => setHeadingFinished(true)}
            />
          </h2>
          <p className="text">
            {!secondMessageStarted ? (
              <Typewriter
                text="Hmmmmmmm! You might be thinking what's this? Let's find out!"
                start={showHome && subtitleStarted}
                speed={50}
                onComplete={() => setSubtitleFinished(true)}
              />
            ) : (
              <Typewriter
                text="Wanna see what I made ?"
                start={showHome && subtitleStarted}
                speed={50}
                onComplete={() => setFinalMessageFinished(true)}
              />
            )}
          </p>
          <div className={`choice-buttons ${buttonsVisible ? 'visible' : ''}`}>
            <button type="button" className="choice-button yes-button" onClick={() => setView('questionnaire')}>Yes</button>
            <button
              ref={noButtonRef}
              type="button"
              className="choice-button no-button"
              style={noButtonPosition ? {
                position: 'fixed',
                left: `${noButtonPosition.left}px`,
                top: `${noButtonPosition.top}px`,
              } : undefined}
              onPointerEnter={moveNoButton}
              onPointerDown={moveNoButton}
              onClick={moveNoButton}
            >
              No
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
