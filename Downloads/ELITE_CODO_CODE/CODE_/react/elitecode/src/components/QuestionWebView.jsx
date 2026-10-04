import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../axios';

const QuestionWebView = () => {
  const [searchParams] = useSearchParams();

  const questionId = searchParams.get('questionId');

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getQuestionById();
  }, [questionId]);

  const getQuestionById = async () => {
    if (!questionId) {
      setError('Question ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // const res = await httpClient.get(
      //   `/api/question/search?searchTerm=${questionId}&page=0&size=100&status=&subject=&chapter=`
      // );

      // console.log('Question API Response:', res.data);

      // const questionList = res?.data?.questions || [];

            const res = await httpClient.get(
        `/api/question/search?searchTerm=${questionId}&page=0&size=100&status=&subject=&chapter=`
      );

      console.log("Question API Response:", res.data);

      const questionList = res?.data?.questions || [];

      console.log("Question ID from URL:", questionId);
      console.log("Questions returned:", questionList);

      questionList.forEach((q) => {
        console.log("Returned Question ID:", q.questionId);
      });

      const selectedQuestion = questionList.find(
        (question) =>
          Number(question.questionId) === Number(questionId)
      );

      if (selectedQuestion) {
        setQuestions([selectedQuestion]);
      } else {
        setQuestions([]);
        setError(`Question ${questionId} not found`);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setQuestions([]);
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const generateWebViewHTML = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <title>Question Display</title>

          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }

              body {
                  font-family: -apple-system, BlinkMacSystemFont,
                    'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6;
                  color: #374151;
                  background-color: #f9fafb;
                  padding: 20px;
              }

              .question-container {
                  max-width: 800px;
                  margin: 0 auto;
              }

              .question-card {
                  background-color: white;
                  border-radius: 12px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                  overflow: hidden;
                  margin-bottom: 24px;
              }

              .question-header {
                  display: flex;
                  align-items: flex-start;
                  gap: 16px;
                  padding: 24px;
              }

              .question-id {
                  background-color: #eef2ff;
                  color: #3730a3;
                  font-weight: 500;
                  padding: 8px 12px;
                  border-radius: 8px;
                  font-size: 14px;
              }

              .question-content {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  gap: 20px;
              }

              .question-text {
                  color: #1f2937;
                  font-size: 16px;
                  line-height: 1.7;
              }

              .options-grid {
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 16px;
              }

              @media (min-width: 768px) {
                  .options-grid {
                      grid-template-columns: 1fr 1fr;
                  }
              }

              .option {
                  padding: 12px;
                  border-radius: 8px;
                  border: 1px solid #e5e7eb;
                  background-color: #f9fafb;
              }

              .option.correct {
                  background-color: #f0fdf4;
                  border: 2px solid #10b981;
              }

              .explanation {
                  background-color: #f9fafb;
                  padding: 16px;
                  border-radius: 8px;
                  border-left: 4px solid #6366f1;
              }

              .explanation-title {
                  font-weight: 500;
                  color: #3730a3;
                  margin-bottom: 8px;
              }

              .metadata-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 8px;
                  font-size: 14px;
              }

              @media (min-width: 768px) {
                  .metadata-grid {
                      grid-template-columns: 1fr 1fr 1fr;
                  }
              }

              .metadata-label {
                  color: #6b7280;
                  font-weight: 500;
              }

              .metadata-value {
                  color: #1f2937;
              }
          </style>
      </head>

      <body>

          <div class="question-container">

              ${(questions || [])
                .map(
                  (question) => `
                  <div class="question-card">

                      <div class="question-header">

                          <div class="question-id">
                              #${question.questionId || ''}
                          </div>

                          <div class="question-content">

                              <div class="question-text">
                                  ${question.question || ''}
                              </div>

                              <div class="options-grid">

                                  ${[
                                    'option1',
                                    'option2',
                                    'option3',
                                    'option4',
                                  ]
                                    .map(
                                      (option) => `
                                      <div class="option ${
                                        question.multiAnswers?.includes(
                                          option
                                        )
                                          ? 'correct'
                                          : ''
                                      }">
                                          ${
                                            question[option] || ''
                                          }
                                      </div>
                                  `
                                    )
                                    .join('')}

                              </div>

                              <div class="explanation">

                                  <p class="explanation-title">
                                      Explanation:
                                  </p>

                                  <div>
                                      ${
                                        question.explanation || ''
                                      }
                                  </div>

                              </div>

                              <div class="metadata-grid">

                                  <div>
                                      <span class="metadata-label">
                                          Exam:
                                      </span>

                                      <span class="metadata-value">
                                          ${
                                            question.entranceExamName ||
                                            ''
                                          }
                                          (${
                                            question.yearOfAppearance ||
                                            ''
                                          })
                                      </span>
                                  </div>

                                  <div>
                                      <span class="metadata-label">
                                          Subject:
                                      </span>

                                      <span class="metadata-value">
                                          ${
                                            question.subjectName || ''
                                          }
                                      </span>
                                  </div>

                                  <div>
                                      <span class="metadata-label">
                                          Chapter:
                                      </span>

                                      <span class="metadata-value">
                                          ${
                                            question.chapterName || ''
                                          }
                                      </span>
                                  </div>

                                  <div>
                                      <span class="metadata-label">
                                          Type:
                                      </span>

                                      <span class="metadata-value">
                                          ${
                                            question.questionType || ''
                                          }
                                      </span>
                                  </div>

                                  <div>
                                      <span class="metadata-label">
                                          Level:
                                      </span>

                                      <span class="metadata-value">
                                          ${
                                            question.questionLevel ||
                                            ''
                                          }
                                      </span>
                                  </div>

                                  <div>
                                      <span class="metadata-label">
                                          Pattern:
                                      </span>

                                      <span class="metadata-value">
                                          ${
                                            question.patternName || ''
                                          }
                                      </span>
                                  </div>

                              </div>

                          </div>

                      </div>

                  </div>
              `
                )
                .join('')}

          </div>

      </body>
      </html>
    `;
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading question...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <iframe
      srcDoc={generateWebViewHTML()}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
      }}
      title='Questions Display'
    />
  );
};

export default QuestionWebView;


// import React from 'react';

// const QuestionWebView = ({ questions }) => {
//   const generateWebViewHTML = () => {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Question Display</title>
//           <style>
//               * {
//                   margin: 0;
//                   padding: 0;
//                   box-sizing: border-box;
//               }
              
//               body {
//                   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
//                   line-height: 1.6;
//                   color: #374151;
//                   background-color: #f9fafb;
//                   padding: 20px;
//               }
              
//               .question-container {
//                   max-width: 800px;
//                   margin: 0 auto;
//               }
              
//               .question-card {
//                   background-color: white;
//                   border-radius: 12px;
//                   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
//                   overflow: hidden;
//                   margin-bottom: 24px;
//                   transition: box-shadow 0.3s ease;
//               }
              
//               .question-card:hover {
//                   box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
//               }
              
//               .question-header {
//                   display: flex;
//                   align-items: flex-start;
//                   gap: 16px;
//                   padding: 24px;
//               }
              
//               .question-id {
//                   background-color: #eef2ff;
//                   color: #3730a3;
//                   font-weight: 500;
//                   padding: 8px 12px;
//                   border-radius: 8px;
//                   font-size: 14px;
//                   flex-shrink: 0;
//               }
              
//               .question-content {
//                   flex: 1;
//                   display: flex;
//                   flex-direction: column;
//                   gap: 20px;
//               }
              
//               .question-text {
//                   color: #1f2937;
//                   font-size: 16px;
//                   line-height: 1.7;
//               }
              
//               .options-grid {
//                   display: grid;
//                   grid-template-columns: 1fr;
//                   gap: 16px;
//               }
              
//               @media (min-width: 768px) {
//                   .options-grid {
//                       grid-template-columns: 1fr 1fr;
//                   }
//               }
              
//               .option {
//                   padding: 12px;
//                   border-radius: 8px;
//                   border: 1px solid #e5e7eb;
//                   background-color: #f9fafb;
//               }
              
//               .option.correct {
//                   background-color: #f0fdf4;
//                   border: 2px solid #10b981;
//               }
              
//               .explanation {
//                   background-color: #f9fafb;
//                   padding: 16px;
//                   border-radius: 8px;
//                   border-left: 4px solid #6366f1;
//               }
              
//               .explanation-title {
//                   font-weight: 500;
//                   color: #3730a3;
//                   margin-bottom: 8px;
//               }
              
//               .metadata-grid {
//                   display: grid;
//                   grid-template-columns: 1fr 1fr;
//                   gap: 8px;
//                   font-size: 14px;
//               }
              
//               @media (min-width: 768px) {
//                   .metadata-grid {
//                       grid-template-columns: 1fr 1fr 1fr;
//                   }
//               }
              
//               .metadata-item {
//                   display: flex;
//                   align-items: center;
//                   gap: 8px;
//               }
              
//               .metadata-label {
//                   color: #6b7280;
//                   font-weight: 500;
//               }
              
//               .metadata-value {
//                   color: #1f2937;
//               }
//           </style>
//       </head>
//       <body>
//           <div class="question-container">
//               ${questions.map(question => `
//                   <div class="question-card">
//                       <div class="question-header">
//                           <div class="question-id">#${question.questionId}</div>
//                           <div class="question-content">
//                               <div class="question-text">
//                                   <div>${question.question}</div>
//                               </div>
                              
//                               <div class="options-grid">
//                                   ${['option1', 'option2', 'option3', 'option4'].map((option, index) => `
//                                       <div class="option ${question.multiAnswers?.includes(option) ? 'correct' : ''}">
//                                           <div>${question[option]}</div>
//                                       </div>
//                                   `).join('')}
//                               </div>
                              
//                               <div class="explanation">
//                                   <p class="explanation-title">Explanation:</p>
//                                   <div class="explanation-content">
//                                       <div>${question.explanation}</div>
//                                   </div>
//                               </div>
                              
//                               <div class="metadata-grid">
//                                   <div class="metadata-item">
//                                       <span class="metadata-label">Exam:</span>
//                                       <span class="metadata-value">${question.entranceExamName} (${question.yearOfAppearance})</span>
//                                   </div>
//                                   <div class="metadata-item">
//                                       <span class="metadata-label">Subject:</span>
//                                       <span class="metadata-value">${question.subjectName}</span>
//                                   </div>
//                                   <div class="metadata-item">
//                                       <span class="metadata-label">Chapter:</span>
//                                       <span class="metadata-value">${question.chapterName}</span>
//                                   </div>
//                                   <div class="metadata-item">
//                                       <span class="metadata-label">Type:</span>
//                                       <span class="metadata-value">${question.questionType}</span>
//                                   </div>
//                                   <div class="metadata-item">
//                                       <span class="metadata-label">Level:</span>
//                                       <span class="metadata-value">${question.questionLevel}</span>
//                                   </div>
//                                   <div class="metadata-item">
//                                       <span class="metadata-label">Pattern:</span>
//                                       <span class="metadata-value">${question.patternName}</span>
//                                   </div>
//                               </div>
//                           </div>
//                       </div>
//                   </div>
//               `).join('')}
//           </div>
//       </body>
//       </html>
//     `;
//   };

//   return (
//     <iframe
//       srcDoc={generateWebViewHTML()}
//       style={{
//         width: '100%',
//         height: '600px',
//         border: 'none',
//         borderRadius: '8px',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
//       }}
//       title="Questions Display"
//     />
//   );
// };

// export default QuestionWebView;