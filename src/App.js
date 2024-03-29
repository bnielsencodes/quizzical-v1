import { useState, useEffect, useCallback } from "react";
import Confetti from "react-confetti";
import Quiz from "./components/Quiz";
import QAndA from "./components/QAndA";
import Start from "./components/Start";
import { nanoid } from "nanoid";
import "./App.css";

export default function App() {
  // const [newGame, setNewGame] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [allCorrect, setAllCorrect] = useState(false);
  const [gameOptions, setGameOptions] = useState({
    category: "",
    difficulty: "",
    type: "",
  });

  const startGame = useCallback(() => {
    setGameStarted(true);
    setQuestions([]);
  }, []);

  const playAgain = useCallback(() => {
    setGameStarted(false);
    setChecked(false);
    setAllCorrect(false);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setGameOptions((prevGameOptions) => {
      return {
        ...prevGameOptions,
        [name]: value,
      };
    });
  };

  // shuffle array function
  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  // fetch from API, create questionsArr, setQuestions
  useEffect(() => {
    async function getQuestions() {
      const { category, difficulty, type } = gameOptions;
      let categoryParameter = "";
      let difficultyParameter = "";
      let typeParameter = "";
      if (category !== "") categoryParameter = `&category=${category}`;
      if (difficulty !== "") difficultyParameter = `&difficulty=${difficulty}`;
      if (type !== "") typeParameter = `&type=${type}`;
      let url = `https://opentdb.com/api.php?amount=5${categoryParameter}${difficultyParameter}${typeParameter}&encode=base64`;
      const response = await fetch(url);
      const data = await response.json();
      let questionsArr = [];
      data.results.forEach((item) => {
        questionsArr.push({
          id: nanoid(),
          question: item.question,
          answers: shuffleArray([
            ...item.incorrect_answers,
            item.correct_answer,
          ]),
          correct: item.correct_answer,
          selected: null,
          checked: false,
        });
      });
      setQuestions(questionsArr);
    }
    getQuestions();
  }, [gameStarted, gameOptions]);

  function selectAnswer(id, answer) {
    setQuestions((questions) =>
      questions.map((question) => {
        return question.id === id
          ? { ...question, selected: answer }
          : question;
      })
    );
  }

  function checkAnswers() {
    let selected = true;
    questions.forEach((question) => {
      if (question.selected === null) {
        selected = false;
        return;
      }
    });
    if (!selected) {
      return;
    }
    setQuestions((questions) =>
      questions.map((question) => {
        return { ...question, checked: true };
      })
    );
    setChecked(true);
    let correct = 0;
    console.log(questions);
    questions.forEach((question) => {
      if (question.correct === question.selected) {
        correct += 1;
      }
    });
    setCorrect(correct);
    setAllCorrect(correct === 5);
  }

  // map through API data fetched to create QAndA components
  const questionElements = questions
    ? questions.map((item) => {
        return (
          <QAndA
            key={item.id}
            id={item.id}
            item={item}
            selectAnswer={selectAnswer}
            checked={checked}
          />
        );
      })
    : [];

  return (
    <main>
      {allCorrect && <Confetti />}
      {gameStarted ? (
        <Quiz
          questionElements={questionElements}
          checked={checked}
          correct={correct}
          playAgain={playAgain}
          checkAnswers={checkAnswers}
        />
      ) : (
        <Start
          startGame={startGame}
          gameOptions={gameOptions}
          handleChange={handleChange}
        />
      )}
    </main>
  );
}
