import React, { useRef } from 'react';
import { CKEditor } from 'ckeditor4-react';
import { httpClient } from '../axios';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { setQuestion } from '../store/questionSlice';
import EnhancedNavHeader from './EnhancedNavHeader';

const AddQuestions = () => {
  const [subjectList, setsubjectList] = useState([]);
  const [entExamsList, setEntExamsList] = useState([]);
  const [standardList, setStandardList] = useState([]);
  const [chapterList, setChapterList] = useState([]);
  const [topicList, setTopicList] = useState([]);
  const [subtopicList, setSubTopicList] = useState([]);

  const question = useSelector((state) => state.question.question);
  const dispatch = useDispatch();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const adminProfilePicture = searchParams.get('adminprofilePicture');
  const adminLogoImage = searchParams.get('adminlogoImage');
  const userFullName = searchParams.get('userFullName');
  const className = searchParams.get('className');

  let { userId, colorCode, entranceExamId, entranceExamName } =
    useParams();

  if (!userId || userId === 'null' || userId === 'undefined') {
    const sessionTeacherId = typeof window !== 'undefined' ? sessionStorage.getItem('teacherId') : null;
    const qUserId = searchParams.get('userId');
    userId = sessionTeacherId || qUserId || '7';
  }
  if (!entranceExamId || entranceExamId === 'null' || entranceExamId === 'undefined') {
    entranceExamId = searchParams.get('entranceExamId') || '1';
  }

  const [createQuestion, setCreateQuestion] = useState({
    id: Number(userId),
    entranceExamId: null,
    standardId: null,
    subjectId: null,
    chapterId: null,
    marks: 0,
    topicId: null,
    subTopicId: null,
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    yearOfAppearanceId: null,
    yearOfAppearance: '',
    asked: false,
    answer: '',
    questionLevelId: null,
    questionTypeId: null,
    multiAnswers: [],
    explanation: '',
    status: 'pending',
    patternId: null,
    solution: '',
    questionCategory: '',
  });

  useEffect(() => {
    if (
      createQuestion.yearOfAppearanceId === null ||
      createQuestion.yearOfAppearanceId === undefined ||
      createQuestion.yearOfAppearanceId === ''
    ) {
      setCreateQuestion((prev) => ({
        ...prev,
        asked: false,
      }));
    } else {
      setCreateQuestion((prev) => ({
        ...prev,
        asked: true,
      }));
    }
  }, [createQuestion.yearOfAppearanceId]);

  useEffect(() => {
    const payload = {
      entranceExamId: createQuestion?.entranceExamId,
      standardId: createQuestion?.standardId,
      subjectId: createQuestion?.subjectId,
      chapterId: createQuestion?.chapterId,
      marks: createQuestion?.marks,
      topicId: createQuestion?.topicId,
      subTopicId: createQuestion?.subTopicId,
      yearOfAppearanceId: createQuestion?.yearOfAppearanceId,
      questionLevelId: createQuestion?.questionLevelId,
      questionTypeId: createQuestion?.questionTypeId,
    };
    dispatch(setQuestion(payload));
  }, [createQuestion, dispatch]);

  useEffect(() => {
    console.log('question', question);
  }, [question]);

  const handleSetQuestionDataForEdit = () => {};

  useEffect(() => {
    console.log('createQuestion', createQuestion);
  }, [createQuestion]);

  useEffect(() => {
    if (createQuestion.standardId) {
      GetAllActiveSubjectsByStandardId();
    }
  }, [createQuestion.standardId]);

  useEffect(() => {
    if (createQuestion.subjectId && createQuestion.standardId) {
      GetChaptersBySubjectId();
    }
  }, [createQuestion.subjectId, createQuestion.standardId]);

  useEffect(() => {
    if (createQuestion?.chapterId) {
      GetTopicsByChapterId();
    }
  }, [createQuestion?.chapterId]);

  useEffect(() => {
    if (createQuestion?.topicId) {
      GetSubTopicsByTopicId();
    }
  }, [createQuestion?.topicId]);

  const GetAllActiveSubjectsByStandardId = async () => {
    if (!createQuestion.standardId) return;
    try {
      const res = await httpClient.get(
        `/api/subject/standardwiseActivesubject/${createQuestion.standardId}`
      );
      setsubjectList(res?.data?.subjectMasters);
    } catch (error) {
      console.log(error);
    }
  };

  const GetAllActiveEntExams = async () => {
    if (!createQuestion.standardId) return;
    try {
      const res = await httpClient.get(
        `/api/standard/standardwiseentranceexam/${createQuestion.standardId}`
      );
      setEntExamsList(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const GetStandardsByEntranceId = async () => {
    try {
      const res = await httpClient.get(
        `/api/entranceexam/entranceexamwisestandard/${entranceExamId}`
      );

      console.log('entranceexamwisestandard', res.data);
      const filteredData = res.data.standardMasters?.filter(
        (item) => item.standardName && item.standardName.trim() !== ''
      );

      setStandardList(filteredData);

      if (filteredData && filteredData.length > 0) {
        const matched = className
          ? filteredData.find(
              (item) => String(item.standardName).trim() === String(className).trim()
            )
          : null;
        const selected = matched || filteredData[0];
        if (selected && !createQuestion.standardId) {
          setCreateQuestion((prev) => ({
            ...prev,
            standardId: selected.standardId,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GetChaptersBySubjectId = async () => {
    if (!createQuestion?.subjectId || !createQuestion?.standardId) return;
    try {
      const res = await httpClient.get(
        `/api/chapter/subjectwisechapter/active/${createQuestion?.subjectId}/${createQuestion?.standardId}`
      );
      setChapterList(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const GetTopicsByChapterId = async () => {
    if (!createQuestion?.chapterId) return;
    try {
      const res = await httpClient.get(
        `/api/topic/chapterwisetopics/${createQuestion?.chapterId}`
      );
      setTopicList(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const GetSubTopicsByTopicId = async () => {
    if (!createQuestion?.topicId) return;
    try {
      const res = await httpClient.get(
        `/api/subtopic/topicwisesubtopics/${createQuestion?.topicId}`
      );
      setSubTopicList(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [YearofAppearList, setYearofAppearList] = useState([]);
  const [QuestionTypeList, setQuestionTypeList] = useState([]);
  const [QuestionLevelList, setQuestionLevelList] = useState([]);
  const [PatternsList, setPatternsList] = useState([]);

  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    const questionT = QuestionTypeList.find(
      (exam) => exam.questionTypeId === question?.questionTypeId
    );

    const lowerCaseType = questionT?.questionType?.toLowerCase();
    console.log('Setting questionType:', lowerCaseType);
    setQuestionType(lowerCaseType || '');

    setForceUpdate((prev) => !prev);
  }, [question, QuestionTypeList]);

  useEffect(() => {
    if (!question) return;

    setCreateQuestion((prev) => ({
      ...prev,
      entranceExamId: entranceExamId,
      standardId: question?.standardId,
      subjectId: question?.subjectId,
      chapterId: question?.chapterId,
      marks: question?.marks,
      topicId: question?.topicId,
      subTopicId: question?.subTopicId,
      yearOfAppearanceId: question?.yearOfAppearanceId,
      questionLevelId: question?.questionLevelId,
      questionTypeId: question?.questionTypeId,
    }));
  }, []);

  const GetYearOfAppearance = async () => {
    try {
      const res = await httpClient.get(
        `/api/yearofappearance/getallactive`
      );

      const sortedData = res.data.sort(
        (a, b) => b.yearOfAppearance - a.yearOfAppearance
      );

      setYearofAppearList(sortedData);
      console.log(sortedData);
    } catch (error) {
      console.log(error);
    }
  };

  const GetQuestionType = async () => {
    try {
      const res = await httpClient.get(
        `/api/questiontype/getallactive`
      );
      setQuestionTypeList(res.data);
      console.log('questiontype/getallactive', res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const GetQuestionLevel = async () => {
    try {
      const res = await httpClient.get(
        `/api/questionlevel/getallactive`
      );
      setQuestionLevelList(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [questionType, setQuestionType] = useState('');

  useEffect(() => {
    console.log('questionType', questionType);
  }, [questionType]);

  const GetAllActivePattern = async () => {
    try {
      const res = await httpClient.get(`/api/pattern/getallactive`);
      setPatternsList(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const validateFields = () => {
    const fieldErrors = {};

    if (!createQuestion.id) fieldErrors.id = 'ID is required';
    if (!createQuestion.entranceExamId)
      fieldErrors.entranceExamId = 'Entrance Exam is required';
    if (!createQuestion.standardId)
      fieldErrors.standardId = 'Standard is required';
    if (!createQuestion.subjectId)
      fieldErrors.subjectId = 'Subject is required';
    if (!createQuestion.chapterId)
      fieldErrors.chapterId = 'Chapter is required';
    if (createQuestion.marks === null || createQuestion.marks <= 0) {
      fieldErrors.marks = 'Marks must be greater than 0';
    }
    if (!createQuestion.question?.trim())
      fieldErrors.question = 'Question is required';
    if (!createQuestion.option1?.trim())
      fieldErrors.option1 = 'Option 1 is required';
    if (!createQuestion.option2?.trim())
      fieldErrors.option2 = 'Option 2 is required';
    if (!createQuestion.option3?.trim())
      fieldErrors.option3 = 'Option 3 is required';
    if (!createQuestion.option4?.trim())
      fieldErrors.option4 = 'Option 4 is required';
    if (!createQuestion.questionLevelId)
      fieldErrors.questionLevelId = 'Question Level is required';
    if (!createQuestion.questionTypeId)
      fieldErrors.questionTypeId = 'Question Type is required';
    if (!createQuestion.explanation?.trim())
      fieldErrors.explanation = 'Explanation is required';
    if (!createQuestion.patternId)
      fieldErrors.patternId = 'Pattern is required';
    if (!createQuestion.questionCategory)
      fieldErrors.questionCategory = 'Question Category is required';

    if (
      !createQuestion.solution?.trim() &&
      (!createQuestion.multiAnswers ||
        createQuestion.multiAnswers.length === 0)
    ) {
      fieldErrors.solution =
        'Provide either a solution or multi-answers';
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const [loader, setloader] = useState(false);

  const PostQuestion = async () => {
    console.log('bhvbdsvdbsdv');
    if (!validateFields()) {
      return;
    }
    setloader(true);
    try {
      const res = await httpClient.post(
        `/api/question/create`,
        createQuestion
      );
      ResetData();
      toast.success('Question created successfully');
    } catch (error) {
      toast.error('Something went wrong');
      console.log(error);
    } finally {
      setloader(false);
    }
  };

  const ResetData = () => {
    editorRef.current.setData('');
    editorRef1.current.setData('');
    editorRef2.current.setData('');
    editorRef3.current.setData('');
    editorRef4.current.setData('');
    editorRef5.current.setData('');
    setCreateQuestion((prev) => ({
      ...prev,
      answer: '',
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      explanation: '',
    }));
  };

  useEffect(() => {
    GetStandardsByEntranceId();
    GetQuestionLevel();
    GetQuestionType();
    GetYearOfAppearance();
    GetAllActivePattern();
  }, []);

  const editorRef = useRef(null);
  const editorRef1 = useRef(null);
  const editorRef2 = useRef(null);
  const editorRef3 = useRef(null);
  const editorRef4 = useRef(null);
  const editorRef5 = useRef(null);

  const [Data, setData] = useState();

  const config = {
    extraPlugins: 'image2,mathjax',
    versionCheck: false,
    height: '400px',
    image2_alignClasses: [
      'image-align-left',
      'image-align-center',
      'image-align-right',
    ],
  };

  const handleOptionChange = (e) => {
    setCreateQuestion((prev) => ({
      ...prev,
      multiAnswers: [e.target.value],
    }));
  };

  const extractImageSrc = (htmlString) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const imgElements = tempDiv.getElementsByTagName('img');
    const imgSrcArray = Array.from(imgElements).map((img) => img.src);
    return imgSrcArray;
  };

  function base64ToBlob(base64Data, contentType) {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  function convertBase64ArrayToBlobs(base64Array, contentType) {
    return base64Array.map((base64String) =>
      base64ToBlob(base64String, contentType)
    );
  }

  function replaceImageSrc(uploadedUrls, data) {
    const imgRegex = /<img[^>]+src="[^"]*"[^>]*>/g;
    let imgTags = data.match(imgRegex);

    if (imgTags && uploadedUrls.length === imgTags.length) {
      imgTags.forEach((imgTag, index) => {
        const newImgTag = imgTag.replace(
          /src="[^"]*"/,
          `src="${uploadedUrls[index]}"`
        );
        data = data.replace(imgTag, newImgTag);
      });
    } else {
      console.warn(
        'The number of uploaded URLs and image tags do not match.'
      );
    }
    return data;
  }

  const postImageApi = async (blobs, data, type) => {
    const uploadedUrls = await Promise.all(
      blobs.map(async (blob) => {
        let formData = new FormData();
        formData.append('file', blob);

        try {
          const res = await httpClient.post(
            '/api/v1/upload/file',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          return res.data.url;
        } catch (err) {
          console.error('File upload failed', err);
          throw err;
        }
      })
    );

    let finalData = replaceImageSrc(uploadedUrls, data);

    if (type === 'question') {
      setCreateQuestion((prev) => ({
        ...prev,
        question: finalData,
      }));
    } else if (type === 'option1') {
      setCreateQuestion((prev) => ({
        ...prev,
        option1: finalData,
      }));
    } else if (type === 'option2') {
      setCreateQuestion((prev) => ({
        ...prev,
        option2: finalData,
      }));
    } else if (type === 'option3') {
      setCreateQuestion((prev) => ({
        ...prev,
        option3: finalData,
      }));
    } else if (type === 'option4') {
      setCreateQuestion((prev) => ({
        ...prev,
        option4: finalData,
      }));
    } else if (type === 'explanation') {
      setCreateQuestion((prev) => ({
        ...prev,
        explanation: finalData,
      }));
    } else if (type === 'solution') {
      setCreateQuestion((prev) => ({
        ...prev,
        solution: finalData,
      }));
    }
  };

  const options = [
    { id: 1, label: 'option1' },
    { id: 2, label: 'option2' },
    { id: 3, label: 'option3' },
    { id: 4, label: 'option4' },
  ];

  const handleToggle = (option) => {
    if (createQuestion?.multiAnswers?.includes(option)) {
      const tempArray = createQuestion?.multiAnswers.filter(
        (item) => item !== option
      );
      setCreateQuestion((prev) => ({
        ...prev,
        multiAnswers: tempArray,
      }));
    } else {
      setCreateQuestion((prev) => ({
        ...prev,
        multiAnswers: [...prev.multiAnswers, option],
      }));
    }
  };

  const SetMarks = (e) => {
    let val = Number(e.target.value);
    if (val >= 0) {
      setCreateQuestion((prev) => ({
        ...prev,
        marks: val,
      }));
    }
  };
  const SetPattern = (e) => {
    let val = e.target.value;
    setCreateQuestion((prev) => ({
      ...prev,
      patternId: val,
    }));
  };

  const onCKEditorInstanceReady = (event) => {
    event.editor.on('beforeCommandExec', (event) => {
      if (event.data.name === 'paste') {
        event.editor._.forcePasteDialog = true;
      }
      if (
        event.data.name === 'pastetext' &&
        event.data.commandData.from === 'keystrokeHandler'
      ) {
        event.cancel();
      }
    });
  };

  const [errors, setErrors] = useState({
    standardId: '',
    entranceExamId: '',
    subjectId: '',
    chapterId: '',
    topicId: '',
    questionTypeId: '',
    questionLevelId: '',
    marks: '',
    patternId: '',
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    explanation: '',
    solution: '',
    questionCategory: '',
  });

  const validateField = (fieldName, value) => {
    const errorMessages = {
      id: 'ID is required',
      entranceExamId: 'Entrance Exam is required',
      standardId: 'Standard is required',
      subjectId: 'Subject is required',
      chapterId: 'Chapter is required',
      marks: 'Marks must be greater than 0',
      question: 'Question is required',
      option1: 'Option 1 is required',
      option2: 'Option 2 is required',
      option3: 'Option 3 is required',
      option4: 'Option 4 is required',
      questionLevelId: 'Question Level is required',
      questionTypeId: 'Question Type is required',
      explanation: 'Explanation is required',
      patternId: 'Pattern is required',
      solution: 'Provide either a solution or multi-answers',
      questionCategory: 'Question Category is required',
    };

    let errorMessage = '';

    if (fieldName === 'marks' && (value === null || value <= 0)) {
      errorMessage = errorMessages.marks;
    } else if (
      fieldName === 'solution' &&
      !value?.trim() &&
      (!createQuestion.multiAnswers ||
        createQuestion.multiAnswers.length === 0)
    ) {
      errorMessage = errorMessages.solution;
    } else if (!value?.trim()) {
      errorMessage = errorMessages[fieldName];
    }

    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
    return !errorMessage;
  };

  const QuestionCategoryList = [
    {
      questionCategoryId: 1,
      questionCategoryName: 'Numerical',
    },
    {
      questionCategoryId: 2,
      questionCategoryName: 'Theoretical',
    },
  ];

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [glowEffect, setGlowEffect] = useState(false);
  const [particlesActive, setParticlesActive] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 400);
    setTimeout(() => setParticlesActive(true), 1000);

    const glowInterval = setInterval(() => {
      setGlowEffect(true);
      setTimeout(() => setGlowEffect(false), 1500);
    }, 5000);

    return () => clearInterval(glowInterval);
  }, []);

  return (
    <>
      <EnhancedNavHeader />
      <a
        href='http://elitecodo.zplusglobalmarketinsights.com/teacher/cet/dashboard'
        style={{ textDecoration: 'none' }}
      >
        <button className='px-5 absolute top-5 left-5 h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full font-medium flex items-center gap-2 text-lg text-white shadow-lg transition-all duration-300'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
              clipRule='evenodd'
            />
          </svg>
          Back
        </button>
      </a>

      <div className='min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-8 flex items-center justify-center relative overflow-hidden'>
        <div className='absolute inset-0 bg-grid-pattern opacity-10' />

        {particlesActive && (
          <div className='absolute inset-0 pointer-events-none'>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className='absolute rounded-full bg-white'
                style={{
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.1,
                  animation: `floatParticle ${
                    Math.random() * 20 + 10
                  }s infinite linear`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        )}

        <div
          className={`w-full max-w-5xl transition-all duration-1000 transform `}
        >
          <div
            className={`bg-white bg-opacity-5 backdrop-filter backdrop-blur-lg rounded-3xl mx-auto border border-gray-200 border-opacity-20 overflow-hidden transition-all duration-500  ${
              glowEffect ? 'shadow-glow' : ''
            }`}
            style={{
              boxShadow: isHovered
                ? '0 25px 50px -12px rgba(79, 70, 229, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)'
                : '0 20px 35px -15px rgba(0, 0, 0, 0.3), 0 10px 20px -10px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className='relative overflow-hidden'>
              <div
                className='absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradientAnimation 8s ease infinite',
                }}
              />

              <div className='absolute inset-0 overflow-hidden'>
                <div
                  className='absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent top-0 opacity-50'
                  style={{
                    animation: 'slideRight 4s ease-in-out infinite',
                  }}
                />
                <div
                  className='absolute w-full h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent bottom-0 opacity-50'
                  style={{
                    animation: 'slideLeft 4s ease-in-out infinite',
                  }}
                />
              </div>

              <div
                className={`absolute inset-0 bg-radial-gradient opacity-0 transition-opacity duration-700 ease-out ${
                  isHovered ? 'opacity-70' : 'opacity-0'
                }`}
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
                  transform: isHovered ? 'scale(1)' : 'scale(0.8)',
                  transition: 'transform 1s ease-out',
                }}
              />

              <div
                className={`relative py-12 px-8 transition-all duration-500 ${
                  isHovered ? 'py-16' : 'py-12'
                }`}
              >
                <div className='absolute top-6 left-6 w-12 h-12 opacity-20'>
                  <div
                    className='absolute inset-0 rounded-full border-2 border-white'
                    style={{ animation: 'spin 10s linear infinite' }}
                  />
                  <div
                    className='absolute inset-2 rounded-full border border-white'
                    style={{
                      animation: 'spin 7s linear infinite reverse',
                    }}
                  />
                </div>
                <div className='absolute bottom-6 right-6 w-12 h-12 opacity-20'>
                  <div
                    className='absolute inset-0 rounded-full border-2 border-white'
                    style={{
                      animation: 'spin 10s linear infinite reverse',
                    }}
                  />
                  <div
                    className='absolute inset-2 rounded-full border border-white'
                    style={{ animation: 'spin 7s linear infinite' }}
                  />
                </div>

                <div className='relative text-center'>
                  <h1
                    className={`text-[20px] md:text-[30px] lg:text-[40px] font-bold text-center text-white transition-all duration-500 tracking-tight ${
                      isHovered ? 'tracking-normal' : ''
                    }`}
                  >
                    Submit your <span>Questions </span>
                  </h1>

                  <div className='mt-6 flex justify-center'>
                    <div
                      className={`w-2 h-2 rounded-full bg-yellow-300 transition-all duration-500 ${
                        isHovered
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-0'
                      }`}
                      style={{
                        boxShadow: isHovered
                          ? '0 0 10px rgba(252, 211, 77, 0.8)'
                          : 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className='p-[6px] md:p-8'>
              <div className='max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2 flex items-center'>
                    Exam Name{' '}
                    <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    aria-label='Default select example'
                    value={entranceExamId || ''}
                    disabled
                  >
                    <option value=''>{entranceExamName}</option>
                  </select>
                  {errors.entranceExamId && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.entranceExamId}
                    </p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2 flex items-center'>
                    Standard Name{' '}
                    <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    aria-label='Default select example'
                    value={createQuestion?.standardId || ''}
                    onChange={(e) => {
                      const selectedStandardId = e.target.value;

                      const selectedStandard = standardList.find(
                        (exam) =>
                          exam.standardId ===
                          Number(selectedStandardId)
                      );

                      if (selectedStandard) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          standardId: selectedStandard.standardId,
                        }));
                      }
                      validateField('standardId', selectedStandardId);
                    }}
                    onBlur={(e) =>
                      validateField('standardId', e.target.value)
                    }
                  >
                    <option style={{ color: '#9ca3af' }} value=''>
                      Select Standard
                    </option>

                    {standardList?.map((obj, index) => (
                      <option key={index} value={obj.standardId}>
                        {obj.standardName}
                      </option>
                    ))}
                  </select>
                  {errors.standardId && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.standardId}
                    </p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2 flex items-center'>
                    Subject Name{' '}
                    <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    aria-label='Default select example'
                    value={createQuestion?.subjectId || ''}
                    onChange={(e) => {
                      const selectedSubjectName = e.target.value;

                      const selectedSubject = subjectList.find(
                        (exam) =>
                          exam.subjectId ===
                          Number(selectedSubjectName)
                      );

                      if (selectedSubject) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          subjectId: selectedSubject.subjectId,
                        }));
                      }
                      validateField('subjectId', selectedSubjectName);
                    }}
                    onBlur={(e) =>
                      validateField('subjectId', e.target.value)
                    }
                  >
                    <option value=''>Select Subject</option>

                    {subjectList?.map((obj, index) => (
                      <option key={index} value={obj.subjectId}>
                        {obj.subjectName}
                      </option>
                    ))}
                  </select>
                  {errors.subjectId && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.subjectId}
                    </p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2 flex items-center'>
                    Chapter Name{' '}
                    <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    aria-label='Default select example'
                    value={createQuestion?.chapterId || ''}
                    onChange={(e) => {
                      const selectedChapterName = e.target.value;

                      const selectedChapter = chapterList.find(
                        (exam) =>
                          exam.chapterId ===
                          Number(selectedChapterName)
                      );

                      if (selectedChapter) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          chapterId: selectedChapter.chapterId,
                        }));
                      }
                      validateField('chapterId', selectedChapterName);
                    }}
                    onBlur={(e) =>
                      validateField('chapterId', e.target.value)
                    }
                  >
                    <option value=''>Select Chapter</option>

                    {chapterList?.map((obj, index) => (
                      <option key={index} value={obj.chapterId}>
                        {obj.chapterName}
                      </option>
                    ))}
                  </select>
                  {errors.chapterId && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.chapterId}
                    </p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2'>
                    Topic name
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    aria-label='Default select example'
                    value={createQuestion?.topicId || ''}
                    onChange={(e) => {
                      const selectedTopicName = e.target.value;

                      const selectedTopic = topicList.find(
                        (exam) =>
                          exam.topicId === Number(selectedTopicName)
                      );

                      if (selectedTopic) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          topicId: selectedTopic.topicId,
                        }));
                      }
                    }}
                  >
                    <option value=''>Select Topic</option>

                    {topicList?.map((obj, index) => (
                      <option key={index} value={obj.topicId}>
                        {obj.topicName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2'>
                    Sub Topic Name
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    value={createQuestion?.subTopicId || ''}
                    aria-label='Default select example'
                    onChange={(e) => {
                      const selectedSubTopicName = e.target.value;

                      const selectedsubTopic = subtopicList.find(
                        (exam) =>
                          exam.subTopicId ===
                          Number(selectedSubTopicName)
                      );

                      if (selectedsubTopic) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          subTopicId: selectedsubTopic.subTopicId,
                        }));
                      }
                    }}
                  >
                    <option value=''>Select SubTopic</option>

                    {subtopicList?.map((obj, index) => (
                      <option key={index} value={obj.subTopicId}>
                        {obj.subTopicName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2'>
                    Year Of Appearance
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    aria-label='Default select example'
                    value={createQuestion?.yearOfAppearanceId || ''}
                    onChange={(e) => {
                      const selectedYearOfAppearance = e.target.value;

                      if (selectedYearOfAppearance === '') {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          yearOfAppearanceId: '',
                          yearOfAppearance: '',
                        }));
                        return;
                      }

                      const selectedyearOfAppearance =
                        YearofAppearList.find(
                          (exam) =>
                            exam.yearOfAppearanceId ===
                            Number(selectedYearOfAppearance)
                        );

                      if (selectedyearOfAppearance) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          yearOfAppearanceId:
                            selectedyearOfAppearance.yearOfAppearanceId,
                          yearOfAppearance:
                            selectedyearOfAppearance.yearOfAppearance,
                        }));
                      }
                    }}
                  >
                    <option value={''}>
                      Select Year of Appearance
                    </option>

                    {YearofAppearList?.map((obj, index) => (
                      <option
                        key={index}
                        value={obj?.yearOfAppearanceId}
                      >
                        {obj?.yearOfAppearance}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2 flex items-center'>
                    Question type{' '}
                    <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    aria-label='Default select example'
                    value={createQuestion?.questionTypeId || ''}
                    onChange={(e) => {
                      const selectedQuestionType = e.target.value;
                      console.log(selectedQuestionType);
                      const selectedquestionType =
                        QuestionTypeList.find(
                          (exam) =>
                            exam.questionTypeId ===
                            Number(selectedQuestionType)
                        );
                      console.log(selectedquestionType);

                      if (selectedquestionType) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          questionTypeId:
                            selectedquestionType.questionTypeId,
                        }));

                        const payload = {
                          entranceExamId:
                            createQuestion?.entranceExamId,
                          standardId: createQuestion?.standardId,
                          subjectId: createQuestion?.subjectId,
                          chapterId: createQuestion?.chapterId,
                          marks: createQuestion?.marks,
                          topicId: createQuestion?.topicId,
                          subTopicId: createQuestion?.subTopicId,
                          yearOfAppearanceId:
                            createQuestion?.yearOfAppearanceId,
                          questionLevelId:
                            createQuestion?.questionLevelId,
                          questionTypeId:
                            selectedquestionType.questionTypeId,
                        };

                        dispatch(setQuestion(payload));
                        console.log('12345666');
                        setQuestionType(
                          selectedquestionType?.questionType?.toLowerCase()
                        );
                      }
                      validateField(
                        'questionTypeId',
                        selectedQuestionType
                      );
                    }}
                    onBlur={(e) =>
                      validateField('questionTypeId', e.target.value)
                    }
                  >
                    <option value=''>Select Type of Question</option>

                    {QuestionTypeList?.map((obj, index) => (
                      <option
                        key={index}
                        value={obj?.questionTypeId ?? ''}
                      >
                        {obj?.questionType}
                      </option>
                    ))}
                  </select>
                  {errors.questionTypeId && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.questionTypeId}
                    </p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2 flex items-center'>
                    Level of Question{' '}
                    <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    value={createQuestion?.questionLevelId || ''}
                    aria-label='Default select example'
                    onChange={(e) => {
                      const selectedQuestionLevel = e.target.value;

                      const selectedquestionLevel =
                        QuestionLevelList?.find(
                          (exam) =>
                            exam.questionLevelId ===
                            Number(selectedQuestionLevel)
                        );

                      if (selectedquestionLevel) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          questionLevelId:
                            selectedquestionLevel.questionLevelId,
                        }));
                      }
                      validateField(
                        'questionLevelId',
                        selectedQuestionLevel
                      );
                    }}
                    onBlur={(e) =>
                      validateField('questionLevelId', e.target.value)
                    }
                  >
                    <option value=''>Select Level of Question</option>

                    {QuestionLevelList?.map((obj, index) => (
                      <option
                        key={index}
                        value={obj?.questionLevelId}
                      >
                        {obj?.questionLevel}
                      </option>
                    ))}
                  </select>
                  {errors.questionLevelId && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.questionLevelId}
                    </p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2 flex items-center'>
                    Marks <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <input
                    className='h-[46px] w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all'
                    type='number'
                    placeholder='Enter marks'
                    onChange={SetMarks}
                    value={createQuestion?.marks}
                    onBlur={(e) =>
                      validateField('marks', e.target.value)
                    }
                  />
                  {errors.marks && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.marks}
                    </p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2 flex items-center'>
                    Question Category{' '}
                    <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    value={createQuestion?.questionCategory || ''}
                    aria-label='Default select example'
                    onChange={(e) => {
                      const selectedQuestionCategory = e.target.value;

                      const selectedquestionCategory =
                        QuestionCategoryList?.find(
                          (exam) =>
                            exam.questionCategoryName ===
                            selectedQuestionCategory
                        );

                      if (selectedquestionCategory) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          questionCategory:
                            selectedquestionCategory.questionCategoryName,
                        }));
                      }
                      validateField(
                        'questionCategory',
                        selectedQuestionCategory
                      );
                    }}
                    onBlur={(e) =>
                      validateField(
                        'questionCategory',
                        e.target.value
                      )
                    }
                  >
                    <option value=''>
                      Select Category of Question
                    </option>

                    {QuestionCategoryList?.map((obj, index) => (
                      <option
                        key={index}
                        value={obj?.questionCategoryName}
                      >
                        {obj?.questionCategoryName}
                      </option>
                    ))}
                  </select>
                  {errors.questionCategory && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.questionCategory}
                    </p>
                  )}
                </div>

                <div className='flex flex-col'>
                  <label className='text-gray-700 font-medium mb-2 flex items-center'>
                    Pattern{' '}
                    <span className='text-red-500 ml-1'>*</span>
                  </label>
                  <select
                    className='form-select w-full rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm transition-all py-2.5 px-3'
                    value={createQuestion?.patternId || ''}
                    aria-label='Default select example'
                    onChange={(e) => {
                      const selectedPattern = e.target.value;

                      const selectedpattern = PatternsList?.find(
                        (exam) =>
                          exam.patternId === Number(selectedPattern)
                      );

                      if (selectedpattern) {
                        setCreateQuestion((prev) => ({
                          ...prev,
                          patternId: selectedpattern.patternId,
                        }));
                      }
                      validateField('patternId', selectedPattern);
                    }}
                    onBlur={(e) =>
                      validateField('patternId', e.target.value)
                    }
                  >
                    <option value=''>Select Pattern</option>

                    {PatternsList?.map((obj, index) => (
                      <option key={index} value={obj?.patternId}>
                        {obj?.patternName}
                      </option>
                    ))}
                  </select>
                  {errors.patternId && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.patternId}
                    </p>
                  )}
                </div>
              </div>

              <div className='mt-[30px]'>
                <p className=' text-gray-700 font-medium mb-2'>
                  Question <span className='text-[red]'>*</span>
                </p>
                <CKEditor
                  config={{
                    ...config,
                    height: '200px',
                  }}
                  onChange={(event) => {
                    let dataa = event.editor.getData();

                    let data = dataa;

                    data = data
                      .replace(/<\/?ol>/g, '')
                      .replace(/<\/li>/g, '</span>')
                      .replace(/<li>/g, `<span>`)
                      .replace(/<p>/g, `<p>`);

                    data = data
                      .replace(
                        /<img([^>]*?)style="([^"]*?)"([^>]*?)>/g,
                        `<img$1style="$2 display:inline;"$3>`
                      )
                      .replace(
                        /<img(?![^>]*?style=")/g,
                        `<img style="display:inline;"`
                      );

                    const imageSources = extractImageSrc(data);

                    const blobs = convertBase64ArrayToBlobs(
                      imageSources,
                      'image/png'
                    );

                    const res = postImageApi(blobs, data, 'question');
                  }}
                  onInstanceReady={(event) => {
                    const editorInstance = event.editor;
                    editorRef.current = editorInstance;

                    const topEditorElements =
                      document.querySelectorAll('.cke_top');
                    topEditorElements.forEach((editorElement) => {
                      editorElement.style.display = 'none';
                    });

                    const bottomEditorElements =
                      document.querySelectorAll('.cke_bottom');
                    bottomEditorElements.forEach((editorElement) => {
                      editorElement.style.display = 'none';
                    });

                    onCKEditorInstanceReady(event);
                  }}
                  onBlur={(event) => {
                    const editorInstance = event.editor;
                    const currentData = editorInstance.getData();

                    validateField('question', currentData);
                  }}
                />
                {errors.question && (
                  <p className='text-red-500 text-sm'>
                    {errors.question}
                  </p>
                )}
                {questionType === 'multiple' ||
                questionType === 'single' ||
                questionType === 'mcqs' ? (
                  <div className='flex flex-col gap-[20px] mt-[30px] '>
                    <div className='flex w-[100%] items-between flex-wrap justify-center gap-[20px]'>
                      <div className='flex flex-col w-[100%] max-w-[467px]'>
                        <p className=' text-gray-700 font-medium mb-2'>
                          Option 1{' '}
                          <span className='text-[red]'>*</span>
                        </p>
                        <CKEditor
                          initData=''
                          onChange={(event) => {
                            let dataa = event.editor.getData();

                            let data = dataa;

                            data = data
                              .replace(/<\/?ol>/g, '')
                              .replace(/<\/li>/g, '</span>')
                              .replace(/<li>/g, `<span>`)
                              .replace(/<p>/g, `<p>`);
                            data = data
                              .replace(
                                /<img([^>]*?)style="([^"]*?)"([^>]*?)>/g,
                                `<img$1style="$2 display:inline;"$3>`
                              )
                              .replace(
                                /<img(?![^>]*?style=")/g,
                                `<img style="display:inline;"`
                              );

                            const imageSources =
                              extractImageSrc(data);

                            const blobs = convertBase64ArrayToBlobs(
                              imageSources,
                              'image/png'
                            );

                            const res = postImageApi(
                              blobs,
                              data,
                              'option1'
                            );
                          }}
                          config={{
                            ...config,
                            width: '100%',
                            height: '150px',
                          }}
                          onInstanceReady={(event) => {
                            editorRef1.current = event.editor;

                            const topEditorElements =
                              document.querySelectorAll('.cke_top');
                            topEditorElements.forEach(
                              (editorElement) => {
                                editorElement.style.display = 'none';
                              }
                            );

                            const bottomEditorElements =
                              document.querySelectorAll(
                                '.cke_bottom'
                              );
                            bottomEditorElements.forEach(
                              (editorElementt) => {
                                editorElementt.style.display = 'none';
                              }
                            );
                          }}
                          onBlur={(event) => {
                            const editorInstance = event.editor;
                            const currentData =
                              editorInstance.getData();

                            validateField('option1', currentData);
                          }}
                        />
                        {errors.option1 && (
                          <p className='text-red-500 text-sm'>
                            {errors.option1}
                          </p>
                        )}
                      </div>

                      <div className='flex flex-col w-[100%] max-w-[467px]'>
                        <p className=' text-gray-700 font-medium mb-2'>
                          Option 2{' '}
                          <span className='text-[red]'>*</span>
                        </p>
                        <CKEditor
                          initData=''
                          onChange={(event) => {
                            let dataa = event.editor.getData();

                            let data = dataa;

                            data = data
                              .replace(/<\/?ol>/g, '')
                              .replace(/<\/li>/g, '</span>')
                              .replace(/<li>/g, `<span>`)
                              .replace(/<p>/g, `<p>`);
                            data = data
                              .replace(
                                /<img([^>]*?)style="([^"]*?)"([^>]*?)>/g,
                                `<img$1style="$2 display:inline;"$3>`
                              )
                              .replace(
                                /<img(?![^>]*?style=")/g,
                                `<img style="display:inline;"`
                              );

                            const imageSources =
                              extractImageSrc(data);

                            const blobs = convertBase64ArrayToBlobs(
                              imageSources,
                              'image/png'
                            );

                            const res = postImageApi(
                              blobs,
                              data,
                              'option2'
                            );
                          }}
                          config={{
                            ...config,
                            width: '100%',
                            height: '150px',
                          }}
                          onInstanceReady={(event) => {
                            editorRef2.current = event.editor;

                            const topEditorElements =
                              document.querySelectorAll('.cke_top');
                            topEditorElements.forEach(
                              (editorElement) => {
                                editorElement.style.display = 'none';
                              }
                            );

                            const bottomEditorElements =
                              document.querySelectorAll(
                                '.cke_bottom'
                              );
                            bottomEditorElements.forEach(
                              (editorElementt) => {
                                editorElementt.style.display = 'none';
                              }
                            );
                          }}
                          onBlur={(event) => {
                            const editorInstance = event.editor;
                            const currentData =
                              editorInstance.getData();

                            validateField('option2', currentData);
                          }}
                        />
                        {errors.option2 && (
                          <p className='text-red-500 text-sm'>
                            {errors.option2}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='flex items-between flex-wrap justify-center gap-[20px]'>
                      <div className='flex flex-col w-[100%] max-w-[467px]'>
                        <p className=' text-gray-700 font-medium mb-2'>
                          Option 3{' '}
                          <span className='text-[red]'>*</span>
                        </p>
                        <CKEditor
                          initData=''
                          onChange={(event) => {
                            let dataa = event.editor.getData();

                            let data = dataa;

                            data = data
                              .replace(/<\/?ol>/g, '')
                              .replace(/<\/li>/g, '</span>')
                              .replace(/<li>/g, `<span>`)
                              .replace(/<p>/g, `<p>`);

                            data = data
                              .replace(
                                /<img([^>]*?)style="([^"]*?)"([^>]*?)>/g,
                                `<img$1style="$2 display:inline;"$3>`
                              )
                              .replace(
                                /<img(?![^>]*?style=")/g,
                                `<img style="display:inline;"`
                              );

                            const imageSources =
                              extractImageSrc(data);

                            const blobs = convertBase64ArrayToBlobs(
                              imageSources,
                              'image/png'
                            );

                            const res = postImageApi(
                              blobs,
                              data,
                              'option3'
                            );
                          }}
                          config={{
                            ...config,
                            width: '100%',
                            height: '150px',
                          }}
                          onInstanceReady={(event) => {
                            editorRef3.current = event.editor;

                            const topEditorElements =
                              document.querySelectorAll('.cke_top');
                            topEditorElements.forEach(
                              (editorElement) => {
                                editorElement.style.display = 'none';
                              }
                            );

                            const bottomEditorElements =
                              document.querySelectorAll(
                                '.cke_bottom'
                              );
                            bottomEditorElements.forEach(
                              (editorElementt) => {
                                editorElementt.style.display = 'none';
                              }
                            );
                          }}
                          onBlur={(event) => {
                            const editorInstance = event.editor;
                            const currentData =
                              editorInstance.getData();

                            validateField('option3', currentData);
                          }}
                        />
                        {errors.option3 && (
                          <p className='text-red-500 text-sm'>
                            {errors.option3}
                          </p>
                        )}
                      </div>

                      <div className='flex flex-col w-[100%] max-w-[467px]'>
                        <p className=' text-gray-700 font-medium mb-2'>
                          Option 4{' '}
                          <span className='text-[red]'>*</span>
                        </p>
                        <CKEditor
                          initData=''
                          onChange={(event) => {
                            let dataa = event.editor.getData();

                            let data = dataa;

                            data = data
                              .replace(/<\/?ol>/g, '')
                              .replace(/<\/li>/g, '</span>')
                              .replace(/<li>/g, `<span>`)
                              .replace(/<p>/g, `<p>`);

                            data = data
                              .replace(
                                /<img([^>]*?)style="([^"]*?)"([^>]*?)>/g,
                                `<img$1style="$2 display:inline;"$3>`
                              )
                              .replace(
                                /<img(?![^>]*?style=")/g,
                                `<img style="display:inline;"`
                              );

                            const imageSources =
                              extractImageSrc(data);

                            const blobs = convertBase64ArrayToBlobs(
                              imageSources,
                              'image/png'
                            );

                            const res = postImageApi(
                              blobs,
                              data,
                              'option4'
                            );
                          }}
                          config={{
                            ...config,
                            width: '100%',
                            height: '150px',
                          }}
                          onInstanceReady={(event) => {
                            editorRef4.current = event.editor;

                            const topEditorElements =
                              document.querySelectorAll('.cke_top');
                            topEditorElements.forEach(
                              (editorElement) => {
                                editorElement.style.display = 'none';
                              }
                            );

                            const bottomEditorElements =
                              document.querySelectorAll(
                                '.cke_bottom'
                              );
                            bottomEditorElements.forEach(
                              (editorElementt) => {
                                editorElementt.style.display = 'none';
                              }
                            );
                          }}
                          onBlur={(event) => {
                            const editorInstance = event.editor;
                            const currentData =
                              editorInstance.getData();

                            validateField('option4', currentData);
                          }}
                        />
                        {errors.option4 && (
                          <p className='text-red-500 text-sm'>
                            {errors.option4}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {questionType === 'single' ? (
                  <div
                    style={{
                      width: 'fit-content',
                    }}
                    className='mx-[auto]'
                  >
                    <p className='mt-[30px]'>Select your Answer</p>

                    <div className='max-w-[600px] mt-[20px] flex-wrap w-[100%] flex gap-[30px]'>
                      <div className='flex'>
                        <input
                          type='radio'
                          id='option1'
                          name='options'
                          value='option1'
                          checked={
                            createQuestion.multiAnswers[0] ===
                            'option1'
                          }
                          onChange={handleOptionChange}
                        />
                        <label htmlFor='option1'>
                          {' '}
                          &nbsp;Option 1
                        </label>
                      </div>

                      <div className='flex'>
                        <div>
                          <input
                            type='radio'
                            id='option2'
                            name='options'
                            value='option2'
                            checked={
                              createQuestion.multiAnswers[0] ===
                              'option2'
                            }
                            onChange={handleOptionChange}
                          />
                          <label htmlFor='option2'>
                            {' '}
                            &nbsp;Option 2
                          </label>
                        </div>
                      </div>

                      <div className='flex'>
                        <div>
                          <input
                            type='radio'
                            id='option3'
                            name='options'
                            value='option3'
                            checked={
                              createQuestion.multiAnswers[0] ===
                              'option3'
                            }
                            onChange={handleOptionChange}
                          />
                          <label htmlFor='option3'>
                            {' '}
                            &nbsp;Option 3
                          </label>
                        </div>
                      </div>

                      <div className='flex'>
                        <div>
                          <input
                            type='radio'
                            id='option4'
                            name='options'
                            value='option4'
                            checked={
                              createQuestion.multiAnswers[0] ===
                              'option4'
                            }
                            onChange={handleOptionChange}
                          />
                          <label htmlFor='option4'>
                            {' '}
                            &nbsp;Option 4
                          </label>
                        </div>
                      </div>
                    </div>

                    <p className='mt-[20px]'>
                      Selected option:{' '}
                      {createQuestion?.multiAnswers
                        ?.map(
                          (answer) =>
                            answer.charAt(0).toUpperCase() +
                            answer.slice(1)
                        )
                        .join(', ')}
                    </p>
                  </div>
                ) : questionType === 'multiple' ||
                  questionType === 'mcqs' ? (
                  <div className='w-full max-w-2xl mx-auto bg-white rounded-xl mt-[40px] shadow-md overflow-hidden p-6 border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
                      Select Multiple Options
                      <span className='ml-2 text-red-600 text-xl'>
                        *
                      </span>
                    </h3>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6'>
                      {options?.map((option) => (
                        <div
                          key={option.label}
                          className='flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200'
                        >
                          <input
                            type='checkbox'
                            id={`option-${option.label}`}
                            checked={createQuestion?.multiAnswers?.includes(
                              option.label
                            )}
                            onChange={() =>
                              handleToggle(option.label)
                            }
                            className='w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer'
                          />
                          <label
                            htmlFor={`option-${option.label}`}
                            className='text-gray-700 font-medium cursor-pointer select-none flex-1'
                          >
                            {option.label.charAt(0).toUpperCase() +
                              option.label.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className='mt-4'>
                      <div className='flex flex-wrap items-center'>
                        <span className='font-medium text-gray-700 mr-2'>
                          Selected Options:
                        </span>
                        {createQuestion?.multiAnswers?.length > 0 ? (
                          <div className='flex flex-wrap gap-2'>
                            {createQuestion?.multiAnswers.map(
                              (answer) => (
                                <span
                                  key={answer}
                                  className='px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium'
                                >
                                  {answer.charAt(0).toUpperCase() +
                                    answer.slice(1)}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <span className='text-gray-500 italic'>
                            None selected
                          </span>
                        )}
                      </div>
                    </div>

                    {errors.solution && (
                      <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
                        {errors.solution}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p className='mt-[30px] text-gray-700 font-medium mb-2'>
                      Solution <span className='text-[red]'>*</span>
                    </p>
                    <CKEditor
                      initData=''
                      onChange={(event) => {
                        let dataa = event.editor.getData();

                        let data = dataa;

                        data = data
                          .replace(/<\/?ol>/g, '')
                          .replace(/<\/li>/g, '</span>')
                          .replace(/<li>/g, `<span>`)
                          .replace(/<p>/g, `<p>`);

                        data = data
                          .replace(
                            /<img([^>]*?)style="([^"]*?)"([^>]*?)>/g,
                            `<img$1style="$2 display:inline;"$3>`
                          )
                          .replace(
                            /<img(?![^>]*?style=")/g,
                            `<img style="display:inline;"`
                          );

                        const imageSources = extractImageSrc(data);

                        const blobs = convertBase64ArrayToBlobs(
                          imageSources,
                          'image/png'
                        );

                        const res = postImageApi(
                          blobs,
                          data,
                          'solution'
                        );
                      }}
                      config={{ ...config, height: '200px' }}
                      onInstanceReady={(event) => {
                        editorRef5.current = event.editor;

                        const topEditorElements =
                          document.querySelectorAll('.cke_top');
                        topEditorElements.forEach((editorElement) => {
                          editorElement.style.display = 'none';
                        });

                        const bottomEditorElements =
                          document.querySelectorAll('.cke_bottom');
                        bottomEditorElements.forEach(
                          (editorElementt) => {
                            editorElementt.style.display = 'none';
                          }
                        );
                      }}
                      onBlur={(event) => {
                        const editorInstance = event.editor;
                        const currentData = editorInstance.getData();

                        validateField('solution', currentData);
                      }}
                    />
                    {errors.solution && (
                      <p className='text-red-500 text-sm'>
                        {errors.solution}
                      </p>
                    )}
                  </>
                )}

                {/* ========== EXPLANATION BOX - START ========== */}
                <div className='mt-[30px] border-2 border-indigo-300 rounded-lg p-4 bg-indigo-50'>
                  <p className='text-gray-700 font-medium mb-2 flex items-center'>
                    <span className='text-lg mr-2'>📝</span>
                    Explanation <span className='text-red-500 ml-1'>*</span>
                    <span className='ml-2 text-xs text-gray-500'>(Required)</span>
                  </p>
                  <CKEditor
                    initData=''
                    onChange={(event) => {
                      let dataa = event.editor.getData();

                      let data = dataa;

                      data = data
                        .replace(/<\/?ol>/g, '')
                        .replace(/<\/li>/g, '</span>')
                        .replace(/<li>/g, `<span>`)
                        .replace(/<p>/g, `<p>`);

                      data = data
                        .replace(
                          /<img([^>]*?)style="([^"]*?)"([^>]*?)>/g,
                          `<img$1style="$2 display:inline;"$3>`
                        )
                        .replace(
                          /<img(?![^>]*?style=")/g,
                          `<img style="display:inline;"`
                        );

                      const imageSources = extractImageSrc(data);

                      const blobs = convertBase64ArrayToBlobs(
                        imageSources,
                        'image/png'
                      );

                      const res = postImageApi(
                        blobs,
                        data,
                        'explanation'
                      );
                    }}
                    config={{ ...config, height: '200px' }}
                    onInstanceReady={(event) => {
                      editorRef5.current = event.editor;

                      const topEditorElements =
                        document.querySelectorAll('.cke_top');
                      topEditorElements.forEach((editorElement) => {
                        editorElement.style.display = 'none';
                      });

                      const bottomEditorElements =
                        document.querySelectorAll('.cke_bottom');
                      bottomEditorElements.forEach((editorElementt) => {
                        editorElementt.style.display = 'none';
                      });
                    }}
                    onBlur={(event) => {
                      const editorInstance = event.editor;
                      const currentData = editorInstance.getData();

                      validateField('explanation', currentData);
                    }}
                  />
                  {errors.explanation && (
                    <p className='text-red-500 text-sm mt-2 flex items-center'>
                      <span className='mr-1'>⚠️</span>
                      {errors.explanation}
                    </p>
                  )}
                </div>
                {/* ========== EXPLANATION BOX - END ========== */}
              </div>

              <div
                style={{
                  width: 'fit-content',
                }}
                className='flex gap-[10px] mx-[auto] mt-[32px]'
              >
                <button
                  style={{
                    background:
                      'linear-gradient(to right, #8F94FB, #4E54C8)',
                    boxShadow: '0 4px 10px rgba(78, 84, 200, 0.3)',
                  }}
                  onClick={() => {
                    if (!loader) {
                      PostQuestion();
                    }
                  }}
                  className={`px-8 h-12 rounded-full font-medium flex justify-center items-center text-lg text-white ${
                    loader ? 'disabled' : ''
                  }`}
                >
                  {loader ? (
                    <>
                      <svg
                        className='animate-spin h-5 w-5 text-white mr-2'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                      </svg>
                      Processing
                    </>
                  ) : (
                    <>
                      Submit
                      <svg
                        className='ml-2 h-5 w-5'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <p className='font-bold mt-[100px]'>Question</p>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(createQuestion.question),
                }}
                className='mt-[10px] w-[100%]'
              ></div>

              {questionType === 'multiple' ||
              questionType === 'single' ||
              questionType === 'mcqs' ? (
                <>
                  <div className='flex gap-[10px] mt-[20px]'>
                    <div className='flex flex-col'>
                      <p className='font-bold'>Option 1</p>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: createQuestion.option1,
                        }}
                        className='w-[500px]'
                      ></div>
                    </div>

                    <div className='flex flex-col'>
                      <p className='font-bold'>Option 2</p>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: createQuestion.option2,
                        }}
                        className='w-[500px]'
                      ></div>
                    </div>
                  </div>
                  <div className='flex gap-[10px] mt-[20px]'>
                    <div className='flex flex-col'>
                      <p className='font-bold'>Option 3</p>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: createQuestion.option3,
                        }}
                        className='w-[500px]'
                      ></div>
                    </div>

                    <div className='flex flex-col'>
                      <p className='font-bold'>Option 4</p>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: createQuestion.option4,
                        }}
                        className='w-[500px]'
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='flex mt-[12px] flex-col gap-[10px]'>
                    <p className='font-bold'>Solution</p>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: createQuestion.solution,
                      }}
                      className='w-[1000px]'
                    ></div>
                  </div>
                </>
              )}

              <div className='flex mt-[12px] flex-col gap-[10px]'>
                <p className='font-bold'>Explanation</p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: createQuestion.explanation,
                  }}
                  className='w-[1000px]'
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(
              to right,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            );
          background-size: 40px 40px;
        }

        .shadow-glow {
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.4),
            0 0 60px rgba(79, 70, 229, 0.2);
        }

        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes slideRight {
          0%,
          100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        @keyframes slideLeft {
          0%,
          100% {
            transform: translateX(100%);
          }
          50% {
            transform: translateX(-100%);
          }
        }

        @keyframes floatParticle {
          0% {
            transform: translateY(0) translateX(0);
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default AddQuestions;