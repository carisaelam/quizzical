import React, { useState, useEffect } from "react";
import he from "he";
import JSConfetti from "js-confetti";

import { nanoid } from "nanoid";

export default function QuestionItem(props) {
  const [questions, setQuestions] = useState([]);
  const [reset, setReset] = useState(false);
  const [clickedAnswers, setClickedAnswers] = useState([]);
  const [questionAnswered, setQuestionAnswered] = useState([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(questions.length);
  const [category, setCategory] = useState(null);
  const jsConfetti = new JSConfetti();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=easy&type=multiple`
        );
        if (!response.ok) {
          throw new Error("Network response not ok");
        }
        const data = await response.json();
        const shuffledQuestions = data.results.map((item) => ({
          ...item,
          answers: shuffleItems([
            item.correct_answer,
            ...item.incorrect_answers,
          ]),
        }));
        setQuestionAnswered(shuffledQuestions.map(() => false));
        setQuestions(shuffledQuestions);
        setTotalQuestions(shuffledQuestions.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
    setReset(false);
  }, [reset]);

  function resetGame() {
    setReset(true);
    setClickedAnswers([]);
    setQuestionAnswered(questionAnswered.map(() => false));
    setCorrectAnswersCount(0);
  }

  function handleAnswerClick(isCorrect, answer, questionIndex) {
    if (!questionAnswered[questionIndex]) {
      setClickedAnswers((prevAnswers) => [...prevAnswers, answer]);
      setQuestionAnswered((prevAnswers) => {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[questionIndex] = true;
        return updatedAnswers;
      });

      if (isCorrect) {
        setCorrectAnswersCount((prevCount) => prevCount + 1);
        jsConfetti.addConfetti({
          emojis: ["🌈", "⚡️", "💥", "✨", "💫", "🦄"],
        });
        jsConfetti.addConfetti();
      }
      if (!isCorrect) {
        jsConfetti.addConfetti({
          emojis: ["💩"],
        });
      }
    }
  }

  function handleInput(e) {
    if (e.target.value < 9 || e.target.value > 32) {
      console.log("pick a number between 9 and 32");
      return;
    }
    setCategory(e.target.value);
  }

  function shuffleItems(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const categoryText = [
    { 9: "general knowledge" },
    { 10: "books" },
    { 11: "Film" },
    { 12: "Music" },
    { 13: "musicals & theater" },
    { 14: "television" },
    { 15: "video games" },
    { 16: "board games" },
    { 17: "science & nature" },
    { 18: "Computers" },
    { 19: "Mathematics" },
    { 20: "mythology" },
    { 21: "Sports" },
    { 22: "Geography" },
    { 23: "History" },
    { 24: "Politics" },
    { 25: "Art" },
    { 26: "Celebrities" },
    { 27: "Animals" },
    { 28: "Vehicles" },
    { 29: "Comics" },
    { 30: "Gadgets" },
    { 31: "japanese anime and Manga" },
    { 32: "cartoon & animations" },
  ];

  const buttonText =
    // clickedAnswers.length !== totalQuestions ? "Get New Quiz" : "Start!";
    "Play!";

  return (
    <main>
      <div className="instructions">
        <input
          onChange={handleInput}
          type="number"
          className="category__input"
        />
        <h2 className="category__selection">Category: {category}</h2>
        <p className="category__description">Number between 9 and 32</p>
        <button onClick={resetGame} className="reset__button">
          {buttonText}
        </button>
        <button
          className="reload__button"
          onClick={() => {
            location.reload();
          }}
        >
          Refresh
        </button>
        {categoryText.map((categoryObj, index) => {
          const categoryId = Object.keys(categoryObj)[0];
          const categoryText = categoryObj[categoryId];
          const style = {
            display: category ? "none" : "flex",
          };
          return (
            <p style={style} key={index}>
              {categoryId}: {categoryText}
            </p>
          );
        })}

        {correctAnswersCount === 0 ? (
          <p className="correct__answer__counter">No right answers so far...</p>
        ) : (
          <p className="correct__answer__counter">
            You got {correctAnswersCount}{" "}
            {correctAnswersCount === 1 ? "answer" : "answers"} out of{" "}
            {totalQuestions} correct
          </p>
        )}
      </div>
      <div className="questions">
        {questions.map((item, index) => (
          <div key={index} className="question__item">
            <h2 className="question">
              {index + 1} - {he.decode(item.question)}
            </h2>
            {item.answers.map((answer, answerIndex) => {
              const isRight = answer === item.correct_answer;
              const isClicked = clickedAnswers.includes(answer);
              let nameOfClass = "answer ";
              if (isClicked) {
                nameOfClass += isRight ? "correct" : "incorrect";
              }

              return (
                <p
                  key={answerIndex}
                  onClick={() =>
                    handleAnswerClick(
                      answer === item.correct_answer,
                      answer,
                      index
                    )
                  }
                  onMouseUp={(e) => e.stopPropagation()}
                  className={nameOfClass}
                >
                  {he.decode(answer)}
                </p>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
