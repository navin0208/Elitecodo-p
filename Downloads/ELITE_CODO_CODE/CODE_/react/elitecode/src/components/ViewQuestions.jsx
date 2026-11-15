import React, { useState, useEffect } from 'react';
import { httpClient } from '../axios';
import { useParams } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { CKEditor } from 'ckeditor4-react';
import { useRef } from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import EnhancedNavHeader from './EnhancedNavHeader';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import QuestionWebView from './QuestionWebView';

const StyledPopupEdit = styled(Popup)`
  // use your custom style for ".popup-overlay"
  /* &-overlay {
 ...;
} */
  // use your custom style for ".popup-content"
  &-content {
    background-color: #ffffff;
    color: #333333;
    border-radius: 32px;
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 16px;
    padding-right: 16px;
    width: fit-content;
    max-height: 90vh; // Set a maximum height (80% of the viewport height)
    overflow-y: auto; // Enable vertical scrolling when content overflows
  }
  &-overlay {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const ViewQuestions = () => {
  const [questionList, setQuestionList] = useState([]);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const navigate = useNavigate();

  const [subjectList, setsubjectList] = useState([]);
  const [entExamsList, setEntExamsList] = useState([]);
  const [standardList, setStandardList] = useState([]);
  const [chapterList, setChapterList] = useState([]);
  const [topicList, setTopicList] = useState([]);
  const [subtopicList, setSubTopicList] = useState([]);

  let { userId } = useParams();
  let { colorCode } = useParams();

  if (!userId || userId === 'null' || userId === 'undefined') {
    const sessionTeacherId = typeof window !== 'undefined' ? sessionStorage.getItem('teacherId') : null;
    userId = sessionTeacherId || '7';
  }

  const [filtertext, setFiltertext] = useState('');

  const [status, setStatus] = useState('pending');

  const GetActiveQuestions = async () => {
    try {
      const res = await httpClient.get(
        `/api/question/getByUserId/${userId}/${status}`
      );
      setQuestionList(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // useEffect(() => {
  //   GetActiveQuestionsFromSearchString();
  // }, [searchTerm, page, size]);

  useEffect(() => {
    GetActiveQuestionsFromSearchString();
    // GetActiveQuestions();
  }, [status]);

  const config = {
    // allowedContent: true,
    extraPlugins: 'image2,mathjax',
    // removeButtons: 'Paste,PasteText,PasteFromWord',
    // mathJaxLib:
    //   'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML',
    versionCheck: false,
    height: '400px',
    // Image settings
    image2_alignClasses: [
      'image-align-left',
      'image-align-center',
      'image-align-right',
    ], // optional, for alignment
  };

  const postImageApi = async (blobs, data, type) => {
    // Use Promise.all to wait for all file upload promises to resolve
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

          console.log('File uploaded successfully');
          console.log(res);

          // Return the uploaded file URL from the response
          return res.data.url;
        } catch (err) {
          console.error('File upload failed', err);
          throw err; // Optional: You could handle failed uploads differently
        }
      })
    );
    console.log('uploadedUrls', uploadedUrls);
    console.log('data', data);

    let finalData = replaceImageSrc(uploadedUrls, data);

    // setarrayWithLinks(uploadedUrls);

    console.log('finalData', finalData);

    if (type === 'question') {
      setEditObjTemp((prev) => ({
        ...prev,
        question: finalData,
      }));
    } else if (type === 'option1') {
      setEditObjTemp((prev) => ({
        ...prev,
        option1: finalData,
      }));
    } else if (type === 'option2') {
      setEditObjTemp((prev) => ({
        ...prev,
        option2: finalData,
      }));
    } else if (type === 'option3') {
      setEditObjTemp((prev) => ({
        ...prev,
        option3: finalData,
      }));
    } else if (type === 'option4') {
      setEditObjTemp((prev) => ({
        ...prev,
        option4: finalData,
      }));
    } else if (type === 'explanation') {
      setEditObjTemp((prev) => ({
        ...prev,
        explanation: finalData,
      }));
    } else if (type === 'solution') {
      setEditObjTemp((prev) => ({
        ...prev,
        solution: finalData,
      }));
    }

    // setData(finalData);
    // Return an array of URLs after all uploads have finished
    // return uploadedUrls;
  };

  function replaceImageSrc(uploadedUrls, data) {
    // Create a regular expression to match the img tags with src attributes
    const imgRegex = /<img[^>]+src="[^"]*"[^>]*>/g;

    // Find all img tags in the data string
    let imgTags = data.match(imgRegex);

    // Loop through each img tag and replace the src with the corresponding URL from uploadedUrls
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

  const editorRef = useRef(null);
  const editorRef1 = useRef(null);
  const editorRef2 = useRef(null);
  const editorRef3 = useRef(null);
  const editorRef4 = useRef(null);
  const editorRef5 = useRef(null);

  const handleDelete = async () => {
    // Nothing selected (e.g. called without a chosen question) - do nothing.
    if (questionToDelete === null || questionToDelete === undefined) {
      return;
    }
    try {
      await httpClient.delete(
        `/api/question/delete/${questionToDelete}`
      );
      setOpen(false);
      setQuestionToDelete(null);
      GetActiveQuestions();
    } catch (error) {
      console.log('Error deleting question:', error);
      setOpen(false);
      setQuestionToDelete(null);
      window.alert(
        error?.response?.data?.message ||
          'Unable to delete this question. Please try again.'
      );
    }
  };

  const handleClickOpen = (questionId) => {
    setQuestionToDelete(questionId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setQuestionToDelete(null);
  };

  const [editObj, setEditObj] = useState();
  const [editObjTemp, setEditObjTemp] = useState();

  useEffect(() => {
    console.log('editObjTemp', editObjTemp);
  }, [editObjTemp]);
  // Navigate to AddQuestion page with the current question object
  const handleEdit = (obj) => {
    console.log(obj);
    setEditObj(obj); // Update the object to edit
    setEditObjTemp(obj); // Update the object to edit

    // Set questionType based on the question type from the object
    if (obj?.questionType) {
      setQuestionType(obj.questionType.toLowerCase());
    }

    setOpenEdit(true); // Open the popup
  };

  useEffect(() => {
    if (openEdit && editorRef.current && editObj?.question) {
      // Set the editor content dynamically
      editorRef.current.setData(editObj.question);
    }
  }, [editObj?.question, openEdit]); // Re-run when `editObj.question` or `openEdit` changes

  useEffect(() => {
    GetActiveQuestionsFromSearchString();
    // GetActiveQuestions();
  }, []);

  const handleFilterChange = (e) => {
    setFiltertext(e.target.value);
  };
  const handleFilterChangeSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredQuestions = questionList.filter((question) =>
    question.question.toLowerCase().includes(filtertext.toLowerCase())
  );

  // Function to convert base64 to Blob
  function base64ToBlob(base64Data, contentType) {
    try {
      // Ensure the data is in the expected Base64 format
      if (!base64Data.includes(',')) {
        throw new Error('Invalid Base64 format: Missing data prefix');
      }
      const base64String = base64Data.split(',')[1]; // Extract the Base64 portion
      const byteCharacters = atob(base64String); // Decode Base64 string
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: contentType });
    } catch (error) {
      console.error(
        'Error converting Base64 to Blob:',
        error.message
      );
      return null; // Return null if conversion fails
    }
  }

  // Function to convert an array of base64 strings to an array of Blobs
  function convertBase64ArrayToBlobs(base64Array, contentType) {
    return base64Array
      .map((base64String) => {
        const blob = base64ToBlob(base64String, contentType);
        if (!blob) {
          console.warn(
            'Invalid Base64 string skipped:',
            base64String
          );
        }
        return blob;
      })
      .filter((blob) => blob !== null); // Exclude invalid Blobs
  }

  const extractImageSrc = (htmlString) => {
    // Create a temporary div element to parse the HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Get all <img> elements from the parsed HTML
    const imgElements = tempDiv.getElementsByTagName('img');

    // Extract the src attributes into an array
    const imgSrcArray = Array.from(imgElements).map((img) => img.src);

    return imgSrcArray;
  };

  // Memoize editObj to avoid unnecessary renders
  const stableEditObj = useMemo(() => editObj, [editObj]);

  const [loader, setloader] = useState(false);

  const EditFunc = async () => {
    setloader(true);
    try {
      const res = await httpClient.put(
        `/api/question/update`,
        editObjTemp
      );
      GetActiveQuestions();
      console.log(res.data);
      // setQuestionList((prevList) =>
      //   prevList.filter((question) => question.questionId !== questionToDelete)
      // );
      setOpenEdit(false);
    } catch (error) {
      console.log('Error updating question:', error);
      window.alert(
        error?.response?.data?.message ||
          'Unable to save the question. Please try again.'
      );
    } finally {
      setloader(false);
    }
  };

  const statusList = ['Accepted', 'Rejected', 'pending'];

  useEffect(() => {
    GetAllActiveEntExams();
  }, [editObjTemp?.['standardId']]);

  useEffect(() => {
    GetAllActiveSubjectsByStandardId();
    // console.log(editObjTemp);
  }, [editObjTemp?.['standardId']]);

  useEffect(() => {
    GetChaptersBySubjectId();
    // console.log(editObjTemp);
  }, [editObjTemp?.['subjectId']]);

  useEffect(() => {
    GetTopicsByChapterId();
    // console.log(editObjTemp);
  }, [editObjTemp?.['chapterId']]);

  useEffect(() => {
    GetSubTopicsByTopicId();
    // console.log(editObjTemp);
  }, [editObjTemp?.['topicId']]);

  useEffect(() => {
    GetStandardsByEntranceId();
    // GetAllActiveEntExams();
    GetQuestionLevel();
    GetQuestionType();
    GetYearOfAppearance();
    GetAllActivePattern();
    // GetAllActiveStandards();
    // GetAllActiveSubjects();
  }, []);

  const GetAllActiveSubjectsByStandardId = async () => {
    try {
      const res = await httpClient.get(
        `/api/subject/standardwisesubject/${editObjTemp.standardId}`
      );
      setsubjectList(res?.data?.subjectMasters);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const GetAllActiveEntExams = async () => {
    try {
      const res = await httpClient.get(
        `/api/standard/standardwiseentranceexam/${editObjTemp.standardId}`
      );
      setEntExamsList(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const GetStandardsByEntranceId = async () => {
    try {
      const res = await httpClient.get(
        `/api/standard/getallstandards`
      );
      setStandardList(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const GetChaptersBySubjectId = async () => {
    try {
      const res = await httpClient.get(
        `/api/chapter/subjectwisechapter/${editObjTemp?.subjectId}`
      );
      setChapterList(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const GetTopicsByChapterId = async () => {
    try {
      const res = await httpClient.get(
        `/api/topic/chapterwisetopics/${editObjTemp?.chapterId}`
      );
      setTopicList(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const GetSubTopicsByTopicId = async () => {
    try {
      const res = await httpClient.get(
        `/api/subtopic/topicwisesubtopics/${editObjTemp?.topicId}`
      );
      setSubTopicList(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [errors, setErrors] = useState({
    standardId: '', // Error for Standard dropdown
    entranceExamId: '', // Error for Exam dropdown
    subjectId: '', // Error for Subject dropdown
    chapterId: '', // Error for Chapter dropdown
    topicId: '', // Error for Topic dropdown
    questionTypeId: '', // Error for Question drop
    questionLevelId: '', // Error for Question
    marks: '',
    patternId: '', // Error for Pattern dropdown
    question: '', // Error for Question
    option1: '', // Error for
    option2: '', // Error for
    option3: '', // Error for
    option4: '', // Error for
    explanation: '', // Error for
    solution: '', // Error for
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
      // topicId: 'Topic is required',
      // subTopicId: 'Sub-topic is required',
      question: 'Question is required',
      option1: 'Option 1 is required',
      option2: 'Option 2 is required',
      option3: 'Option 3 is required',
      option4: 'Option 4 is required',
      // yearOfAppearanceId: 'Year of Appearance is required',
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
      (!editObjTemp.multiAnswers ||
        editObjTemp.multiAnswers.length === 0)
    ) {
      errorMessage = errorMessages.solution;
    } else if (!value?.trim()) {
      errorMessage = errorMessages[fieldName];
    }

    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
    return !errorMessage; // Return true if no error
  };

  const [YearofAppearList, setYearofAppearList] = useState([]);
  const [QuestionTypeList, setQuestionTypeList] = useState([]);
  const [QuestionLevelList, setQuestionLevelList] = useState([]);
  const [PatternsList, setPatternsList] = useState([]);

  const GetYearOfAppearance = async () => {
    try {
      const res = await httpClient.get(
        `/api/yearofappearance/getallactive`
      );
      setYearofAppearList(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const LatexContent = ({ content }) => {
    const parts = content.split(/(\$.*?\$)/g);

    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('$') && part.endsWith('$')) {
            const latex = part.slice(1, -1);
            return <InlineMath key={index} math={latex} />;
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
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
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [questionType, setQuestionType] = useState('');

  const GetAllActivePattern = async () => {
    try {
      const res = await httpClient.get(`/api/pattern/getallactive`);
      setPatternsList(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const validateFields = () => {
    const fieldErrors = {};

    if (!editObjTemp.id) fieldErrors.id = 'ID is required';
    if (!editObjTemp.entranceExamId)
      fieldErrors.entranceExamId = 'Entrance Exam is required';
    if (!editObjTemp.standardId)
      fieldErrors.standardId = 'Standard is required';
    if (!editObjTemp.subjectId)
      fieldErrors.subjectId = 'Subject is required';
    if (!editObjTemp.chapterId)
      fieldErrors.chapterId = 'Chapter is required';
    if (editObjTemp.marks === null || editObjTemp.marks <= 0) {
      fieldErrors.marks = 'Marks must be greater than 0';
    }
    // if (!editObjTemp.topicId)
    //   fieldErrors.topicId = 'Topic is required';
    // if (!editObjTemp.subTopicId)
    //   fieldErrors.subTopicId = 'Sub-topic is required';
    if (!editObjTemp.question?.trim())
      fieldErrors.question = 'Question is required';
    if (!editObjTemp.option1?.trim())
      fieldErrors.option1 = 'Option 1 is required';
    if (!editObjTemp.option2?.trim())
      fieldErrors.option2 = 'Option 2 is required';
    if (!editObjTemp.option3?.trim())
      fieldErrors.option3 = 'Option 3 is required';
    if (!editObjTemp.option4?.trim())
      fieldErrors.option4 = 'Option 4 is required';
    // if (!editObjTemp.yearOfAppearanceId)
    //   fieldErrors.yearOfAppearanceId =
    //     'Year of Appearance is required';
    if (!editObjTemp.questionLevelId)
      fieldErrors.questionLevelId = 'Question Level is required';
    if (!editObjTemp.questionTypeId)
      fieldErrors.questionTypeId = 'Question Type is required';
    if (!editObjTemp.explanation?.trim())
      fieldErrors.explanation = 'Explanation is required';
    if (!editObjTemp.patternId)
      fieldErrors.patternId = 'Pattern is required';
    if (!editObjTemp.questionCategory)
      fieldErrors.questionCategory = 'Question Category is required';

    // At least one of these must be valid
    if (
      !editObjTemp.solution?.trim() &&
      (!editObjTemp.multiAnswers ||
        editObjTemp.multiAnswers.length === 0)
    ) {
      fieldErrors.solution =
        'Provide either a solution or multi-answers';
    }

    // Update errors state
    setErrors(fieldErrors);

    // Return false if there are any errors
    return Object.keys(fieldErrors).length === 0;
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

  const SetMarks = (e) => {
    let val = Number(e.target.value); // Convert to number

    if (val >= 0) {
      setEditObjTemp((prev) => ({
        ...prev,
        marks: val,
      }));
    }
  };

  const handleOptionChange = (e) => {
    setEditObjTemp((prev) => ({
      ...prev,
      multiAnswers: [e.target.value],
    }));
  };

  const handleToggle = (option) => {
    if (editObjTemp?.multiAnswers?.includes(option)) {
      const tempArray = editObjTemp?.multiAnswers.filter(
        (item) => item !== option
      );

      setEditObjTemp((prev) => ({
        ...prev,
        multiAnswers: tempArray,
      }));
    } else {
      setEditObjTemp((prev) => ({
        ...prev,
        multiAnswers: [...prev.multiAnswers, option],
      }));
    }
  };

  const options = [
    { id: 1, label: 'option1' },
    { id: 2, label: 'option2' },
    { id: 3, label: 'option3' },
    { id: 4, label: 'option4' },
  ];

  // const totalPages = 20; // This would typically be calculated based on total items

  const [totalPages, settotalPages] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  const [subjectStr, setSubjectStr] = useState('');
  const [chapterStr, setChapterStr] = useState('');

  const GetActiveQuestionsFromSearchString = async () => {
    try {
      const res = await httpClient.get(
        `/api/question/search?searchTerm=${searchTerm}&page=${
          currentPage - 1
        }&size=${size}&status=${status}&subject=${subjectStr}&chapter=${chapterStr}`
      );
      setQuestionList(res.data.questions);

      settotalPages(res.data.totalPages);
      let pages = [];

      console.log(res.data);

      // Always show first page

      for (let i = 1; i <= res.data.totalPages; i++) {
        let obj = {
          num: i,
        };
        pages.push(obj);
      }
      setpagesArr(pages);
      // console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    GetActiveQuestionsFromSearchString();
  }, [currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const [pagesArr, setpagesArr] = useState([]);

  useEffect(() => {
    console.log('pagesArr', pagesArr);
  }, [pagesArr]);

  // Generate the page numbers to display
  const getPageNumbers = () => {};

  // useEffect(() => {
  //   getPageNumbers();
  // }, [totalPages]);

  // Create the editAccess state (default to false or true based on your needs)
  const [editAccess, setEditAccess] = useState(false);

  const GetUserEditDeleteAccess = async () => {
    try {
      const res = await httpClient.get(
        `/api/auth/getEditAccessById/${userId}`
      );
      setEditAccess(res.data.editAccess);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    GetUserEditDeleteAccess();
  }, []);

  const processedQuestion = (obj) => {
    const processedQuestionVar = obj?.replace(
      /height\s*:\s*18px/gi,
      'height:auto'
    );

    return processedQuestionVar;
  };

  return (
    <>
      <EnhancedNavHeader />
      {/* Header */}
      <div className='bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg'>
        <p className='text-2xl text-white font-light text-start py-5 px-6'>
          View{' '}
          <span className='text-indigo-200 font-medium hover:text-white underline transition-colors duration-300 cursor-pointer'>
            Questions
          </span>
        </p>
      </div>

      {/* Filter section */}
      <div className='px-6 py-4 flex gap-3 justify-end top-0 right-0 bg-white/90 backdrop-blur-sm shadow-md rounded-bl-lg z-10'>
        <div>
          <select
            className='form-select h-10 w-full max-w-[250px] border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200'
            aria-label='Question type selector'
            value={status || ''}
            onChange={(e) => {
              const selectedStatus = e.target.value;
              const selectedstatus = statusList?.find(
                (exam) => exam === selectedStatus
              );
              if (selectedstatus) {
                setStatus(selectedstatus);
              }
            }}
          >
            <option value=''>Select Type of Question</option>
            {statusList?.map((obj, index) => (
              <option key={index} value={obj}>
                {obj}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type='text'
            placeholder='Search questions...'
            value={searchTerm}
            onChange={handleFilterChangeSearch}
            className='border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200'
          />
        </div>

        <button
          className='bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 rounded-lg transition-colors duration-300 font-medium shadow-md hover:shadow-lg flex items-center gap-2'
          onClick={GetActiveQuestionsFromSearchString}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
          Search
        </button>
      </div>

      {/* Question list */}
      <div className='mt-20 px-6'>
        {questionList?.length > 0 ? (
          <div className='space-y-6'>
            {questionList?.map((obj) => (
              <>
                <div
                  key={obj.questionId}
                  className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden'
                >
                  <div className='flex items-start gap-4 p-6'>
                    {/* Question ID */}
                    <div className='bg-indigo-50 text-indigo-800 font-medium px-3 py-2 rounded-lg text-sm flex-shrink-0'>
                      #{obj.questionId}
                    </div>

                    {/* Question content */}

                    {/* <QuestionWebView questions={questionList} /> */}
                    <div className='flex-1 space-y-5'>
                      {/* Question text */}
                      <div className='text-gray-800'>
                        <p
                          className='text-base'
                          dangerouslySetInnerHTML={{
                            __html: processedQuestion(obj.question),
                          }}
                        ></p>
                      </div>

                      {/* Options */}
                      <div className='grid md:grid-cols-2 gap-4'>
                        {[
                          'option1',
                          'option2',
                          'option3',
                          'option4',
                        ].map((option, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              obj.multiAnswers?.includes(option)
                                ? 'bg-green-50 border-2 border-green-500'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                            dangerouslySetInnerHTML={{
                              // __html: obj[option],
                              __html: processedQuestion(obj[option]),
                            }}
                          />
                        ))}
                      </div>

                      {/* Explanation */}
                      <div className='bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500'>
                        <p className='font-medium text-indigo-800 mb-2'>
                          Explanation:
                        </p>
                        <div
                          className='text-gray-700'
                          dangerouslySetInnerHTML={{
                            // __html: obj.explanation,
                            __html: processedQuestion(
                              obj.explanation
                            ),
                          }}
                        ></div>
                      </div>

                      {/* Question metadata */}
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-2 text-sm'>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600 font-medium'>
                            Exam:
                          </span>
                          <span className='text-gray-800'>
                            {obj?.entranceExamName} (
                            {obj?.yearOfAppearance})
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600 font-medium'>
                            Subject:
                          </span>
                          <span className='text-gray-800'>
                            {obj?.subjectName}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600 font-medium'>
                            Chapter:
                          </span>
                          <span className='text-gray-800'>
                            {obj?.chapterName}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600 font-medium'>
                            Type:
                          </span>
                          <span className='text-gray-800'>
                            {obj?.questionType}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600 font-medium'>
                            Level:
                          </span>
                          <span className='text-gray-800'>
                            {obj?.questionLevel}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-gray-600 font-medium'>
                            Pattern:
                          </span>
                          <span className='text-gray-800'>
                            {obj?.patternName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons - Enabled (removed disabled condition) */}
                    <div className='flex flex-col items-center gap-2'>
                      <button
                        className={`group bg-indigo-50 hover:bg-indigo-100 p-2 rounded-full transition-colors duration-300`}
                        onClick={() => handleEdit(obj)}
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 text-indigo-600 group-hover:text-indigo-800'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                          />
                        </svg>
                      </button>
                      <button
                        className={`group bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors duration-300`}
                        onClick={() =>
                          handleClickOpen(obj.questionId)
                        }
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 text-red-500 group-hover:text-red-700'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                      </button>
                    </div>

                    <StyledPopupEdit
                      open={openEdit}
                      closeOnDocumentClick={false}
                      position={'top center'}
                      onClose={() => {
                        setOpenEdit(false);
                        document.body.classList.remove(
                          'body-no-scroll'
                        );
                        // setOpenOnMountPop2(true);
                      }}
                    >
                      <div
                        className='relative'
                        style={{
                          backgroundColor: 'white',
                          padding: '20px',
                          borderRadius: '10px',
                          width: '1000px',
                          textAlign: 'center',
                        }}
                      >
                        <i
                          onClick={() => setOpenEdit(false)}
                          className='fa-solid fa-xmark absolute top-[0px] right-[0px] cursor-pointer'
                        ></i>

                        <div className='flex justify-between text-[21px] mt-[15px]'>
                          <span className='text-[#757575]'>
                            Question Id. {editObj?.questionId}
                          </span>
                          <span className='text-[#757575]'>
                            Exam: {editObj?.entranceExamName}
                          </span>
                        </div>
                        <span className='text-[#757575] text-[21px] flex justify-start my-[15px]'>
                          Subject: {editObj?.subjectName}
                        </span>

                        <div className='flex justify-between'></div>

                        {/* Added missing fields */}
                        <div className='flex flex-wrap justify-start mt-[20px] gap-[20px]'>
                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col'
                          >
                            <p className='text-[#757575] text-start'>
                              Standard Name
                            </p>
                            <select
                              className='form-select w-[300px]'
                              aria-label='Default select example'
                              value={editObjTemp?.standardId || ''}
                              onChange={(e) => {
                                const selectedStandardId =
                                  e.target.value;
                                console.log(
                                  'Selected ID:',
                                  selectedStandardId
                                );

                                const selectedStandard =
                                  standardList.find(
                                    (exam) =>
                                      exam.standardId ===
                                      Number(selectedStandardId)
                                  );

                                if (selectedStandard) {
                                  setEditObjTemp((prev) => ({
                                    ...prev,
                                    standardId:
                                      selectedStandard.standardId,
                                  }));
                                }
                                validateField(
                                  'standardId',
                                  selectedStandardId
                                );
                              }}
                              onBlur={(e) =>
                                validateField(
                                  'standardId',
                                  e.target.value
                                )
                              }
                            >
                              <option
                                style={{ color: '#9ca3af' }}
                                value=''
                              >
                                Select Standard
                              </option>

                              {standardList?.map((obj, index) => (
                                <option
                                  key={index}
                                  value={obj.standardId}
                                >
                                  {obj.standardName}
                                </option>
                              ))}
                            </select>
                            {errors.standardId && (
                              <p className='text-red-500 text-sm  text-start'>
                                {errors.standardId}
                              </p>
                            )}
                          </div>

                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col'
                          >
                            <p className='text-[#757575] text-start'>
                              Exam Name
                            </p>
                            <select
                              className='form-select w-[300px]'
                              aria-label='Default select example'
                              value={
                                editObjTemp?.entranceExamId || ''
                              }
                              onChange={(e) => {
                                const selectedExamName =
                                  e.target.value;
                                const selectedExam =
                                  entExamsList?.find(
                                    (exam) =>
                                      exam.entranceExamId ===
                                      Number(selectedExamName)
                                  );

                                if (selectedExam) {
                                  setEditObjTemp((prev) => ({
                                    ...prev,
                                    entranceExamId:
                                      selectedExam.entranceExamId,
                                  }));
                                }
                                validateField(
                                  'entranceExamId',
                                  selectedExamName
                                );
                              }}
                              onBlur={(e) =>
                                validateField(
                                  'entranceExamId',
                                  e.target.value
                                )
                              }
                            >
                              <option value=''>Select exam</option>

                              {entExamsList?.length > 0 &&
                                entExamsList?.map((obj, index) => (
                                  <option
                                    key={index}
                                    value={obj.entranceExamId}
                                  >
                                    {obj.entranceExamName}
                                  </option>
                                ))}
                            </select>
                            {errors.entranceExamId && (
                              <p className='text-red-500 text-sm text-start'>
                                {errors.entranceExamId}
                              </p>
                            )}
                          </div>
                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col text-start'
                          >
                            <p className='text-[#757575]'>
                              Subject Name
                            </p>
                            <select
                              className='form-select w-[300px]'
                              aria-label='Default select example'
                              value={editObjTemp?.subjectId || ''}
                              onChange={(e) => {
                                const selectedSubjectName =
                                  e.target.value;

                                const selectedSubject =
                                  subjectList.find(
                                    (exam) =>
                                      exam.subjectId ===
                                      Number(selectedSubjectName)
                                  );

                                if (selectedSubject) {
                                  setEditObjTemp((prev) => ({
                                    ...prev,
                                    subjectId:
                                      selectedSubject.subjectId,
                                  }));
                                }
                                validateField(
                                  'subjectId',
                                  selectedSubjectName
                                );
                              }}
                              onBlur={(e) =>
                                validateField(
                                  'subjectId',
                                  e.target.value
                                )
                              }
                            >
                              <option value=''>Select Subject</option>

                              {subjectList?.map((obj, index) => (
                                <option
                                  key={index}
                                  value={obj.subjectId}
                                >
                                  {obj.subjectName}
                                </option>
                              ))}
                            </select>
                            {errors.subjectId && (
                              <p className='text-red-500 text-sm text-start'>
                                {errors.subjectId}
                              </p>
                            )}
                          </div>

                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col'
                          >
                            <p className='text-[#757575]  text-start'>
                              Chapter Name
                            </p>
                            <select
                              className='form-select w-[300px]'
                              aria-label='Default select example'
                              value={editObjTemp?.chapterId || ''}
                              onChange={(e) => {
                                const selectedChapterName =
                                  e.target.value;

                                const selectedChapter =
                                  chapterList.find(
                                    (exam) =>
                                      exam.chapterId ===
                                      Number(selectedChapterName)
                                  );

                                if (selectedChapter) {
                                  setEditObjTemp((prev) => ({
                                    ...prev,
                                    chapterId:
                                      selectedChapter.chapterId,
                                  }));
                                }
                                validateField(
                                  'chapterId',
                                  selectedChapterName
                                );
                              }}
                              onBlur={(e) =>
                                validateField(
                                  'chapterId',
                                  e.target.value
                                )
                              }
                            >
                              <option value=''>Select Chapter</option>

                              {chapterList?.map((obj, index) => (
                                <option
                                  key={index}
                                  value={obj.chapterId}
                                >
                                  {obj.chapterName}
                                </option>
                              ))}
                            </select>
                            {errors.chapterId && (
                              <p className='text-red-500 text-sm  text-start'>
                                {errors.chapterId}
                              </p>
                            )}
                          </div>

                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col'
                          >
                            <p className='text-[#757575]  text-start'>
                              Topic Name
                            </p>
                            <select
                              className='form-select w-[300px]'
                              aria-label='Default select example'
                              value={editObjTemp?.topicId || ''}
                              onChange={(e) => {
                                const selectedTopicName =
                                  e.target.value;

                                const selectedTopic =
                                  topicList.find(
                                    (exam) =>
                                      exam.topicId ===
                                      Number(selectedTopicName)
                                  );

                                if (selectedTopic) {
                                  setEditObjTemp((prev) => ({
                                    ...prev,
                                    topicId: selectedTopic.topicId,
                                  }));
                                }
                              }}
                            >
                              <option value=''>Select Topic</option>

                              {topicList?.map((obj, index) => (
                                <option
                                  key={index}
                                  value={obj.topicId}
                                >
                                  {obj.topicName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col'
                          >
                            <p className='text-[#757575]  text-start'>
                              Sub Topic Name
                            </p>
                            <select
                              className='form-select w-[300px]'
                              value={editObjTemp?.subTopicId || ''}
                              aria-label='Default select example'
                              onChange={(e) => {
                                const selectedSubTopicName =
                                  e.target.value;

                                const selectedsubTopic =
                                  subtopicList.find(
                                    (exam) =>
                                      exam.subTopicId ===
                                      Number(selectedSubTopicName)
                                  );

                                if (selectedsubTopic) {
                                  setEditObjTemp((prev) => ({
                                    ...prev,
                                    subTopicId:
                                      selectedsubTopic.subTopicId,
                                  }));
                                }
                              }}
                            >
                              <option value=''>Select SubTopic</option>

                              {subtopicList?.map((obj, index) => (
                                <option
                                  key={index}
                                  value={obj.subTopicId}
                                >
                                  {obj.subTopicName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col'
                          >
                            <p className='text-[#757575]  text-start'>
                              Year Of Appearance
                            </p>
                            <select
                              className='form-select w-[300px]'
                              aria-label='Default select example'
                              value={editObjTemp?.yearOfAppearanceId || ''}
                              onChange={(e) => {
                                const selectedYearOfAppearance = e.target.value;

                                if (selectedYearOfAppearance === '') {
                                  setEditObjTemp((prev) => ({
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
                                  setEditObjTemp((prev) => ({
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

                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col'
                          >
                            <p className='text-[#757575]  text-start'>
                              Question type
                            </p>
                            <select
                              className='form-select w-[300px]'
                              aria-label='Default select example'
                              value={
                                editObjTemp?.questionTypeId || ''
                              }
                              onChange={(e) => {
                                const selectedQuestionType =
                                  e.target.value;

                                const selectedquestionType =
                                  QuestionTypeList.find(
                                    (exam) =>
                                      exam.questionTypeId ===
                                      Number(selectedQuestionType)
                                  );

                                if (selectedquestionType) {
                                  setEditObjTemp((prev) => ({
                                    ...prev,
                                    questionTypeId:
                                      selectedquestionType.questionTypeId,
                                  }));

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
                                validateField(
                                  'questionTypeId',
                                  e.target.value
                                )
                              }
                            >
                              <option value=''>
                                Select Type of Question
                              </option>

                              {QuestionTypeList?.map((obj, index) => (
                                <option
                                  key={index}
                                  value={obj?.questionTypeId}
                                >
                                  {obj?.questionType}
                                </option>
                              ))}
                            </select>
                            {errors.questionTypeId && (
                              <p className='text-red-500 text-sm text-start'>
                                {errors.questionTypeId}
                              </p>
                            )}
                          </div>

                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col  text-start'
                          >
                            <p className='text-[#757575]'>
                              Level of Question
                            </p>
                            <select
                              className='form-select w-[300px]'
                              value={
                                editObjTemp?.questionLevelId || ''
                              }
                              aria-label='Default select example'
                              onChange={(e) => {
                                const selectedQuestionLevel =
                                  e.target.value;

                                const selectedquestionLevel =
                                  QuestionLevelList?.find(
                                    (exam) =>
                                      exam.questionLevelId ===
                                      Number(selectedQuestionLevel)
                                  );

                                if (selectedquestionLevel) {
                                  setEditObjTemp((prev) => ({
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
                                validateField(
                                  'questionLevelId',
                                  e.target.value
                                )
                              }
                            >
                              <option value=''>
                                Select Level of Question
                              </option>

                              {QuestionLevelList?.map(
                                (obj, index) => (
                                  <option
                                    key={index}
                                    value={obj?.questionLevelId}
                                  >
                                    {obj?.questionLevel}
                                  </option>
                                )
                              )}
                            </select>
                            {errors.questionLevelId && (
                              <p className='text-red-500 text-sm  text-start'>
                                {errors.questionLevelId}
                              </p>
                            )}
                          </div>
                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col  text-start'
                          >
                            <p className='text-[#757575]'>Marks</p>
                            <input
                              className='h-[38px] w-[300px] px-[10px]  border border-[#ced4da]'
                              type='number'
                              placeholder='Enter marks'
                              onChange={SetMarks}
                              value={editObjTemp?.marks}
                              onBlur={(e) =>
                                validateField('marks', e.target.value)
                              }
                            />
                            {errors.marks && (
                              <p className='text-red-500 text-sm  text-start'>
                                {errors.marks}
                              </p>
                            )}
                          </div>

                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col  text-start'
                          >
                            <p className='text-[#757575]'>
                              Question Category
                            </p>
                            <select
                              className='form-select w-[300px]'
                              value={
                                editObjTemp?.questionCategory || ''
                              }
                              aria-label='Default select example'
                              onChange={(e) => {
                                const selectedQuestionCategory =
                                  e.target.value;

                                const selectedquestionCategory =
                                  QuestionCategoryList?.find(
                                    (exam) =>
                                      exam.questionCategoryName ===
                                      selectedQuestionCategory
                                  );

                                if (selectedquestionCategory) {
                                  setEditObjTemp((prev) => ({
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

                              {QuestionCategoryList?.map(
                                (obj, index) => (
                                  <option
                                    key={index}
                                    value={obj?.questionCategoryName}
                                  >
                                    {obj?.questionCategoryName}
                                  </option>
                                )
                              )}
                            </select>
                            {errors.questionCategory && (
                              <p className='text-red-500 text-sm  text-start'>
                                {errors.questionCategory}
                              </p>
                            )}
                          </div>
                          <div
                            style={{
                              width: 'fit-content',
                            }}
                            className='flex flex-col'
                          >
                            <p className='text-[#757575]  text-start'>
                              Pattern
                            </p>
                            <select
                              className='form-select w-[300px]'
                              value={editObjTemp?.patternId || ''}
                              aria-label='Default select example'
                              onChange={(e) => {
                                const selectedPattern =
                                  e.target.value;

                                const selectedpattern =
                                  PatternsList?.find(
                                    (exam) =>
                                      exam.patternId ===
                                      Number(selectedPattern)
                                  );

                                if (selectedpattern) {
                                  setEditObjTemp((prev) => ({
                                    ...prev,
                                    patternId:
                                      selectedpattern.patternId,
                                  }));
                                }
                                validateField(
                                  'patternId',
                                  selectedPattern
                                );
                              }}
                              onBlur={(e) =>
                                validateField(
                                  'patternId',
                                  e.target.value
                                )
                              }
                            >
                              <option value=''>Select Pattern</option>

                              {PatternsList?.map((obj, index) => (
                                <option
                                  key={index}
                                  value={obj?.patternId}
                                >
                                  {obj?.patternName}
                                </option>
                              ))}
                            </select>
                            {errors.patternId && (
                              <p className='text-red-500 text-sm  text-start'>
                                {errors.patternId}
                              </p>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            width: 'fit-content',
                          }}
                          className='mx-[auto]'
                        >
                          <p className='mt-[30px] text-[#757575] flex flex-start'>
                            Question
                          </p>
                          <CKEditor
                            config={{
                              ...config,
                              width: '750px',
                              height: '250px', // Customize height
                            }}
                            onInstanceReady={(event) => {
                              editorRef.current = event.editor; // Save CKEditor instance
                              if (editObj?.question) {
                                event.editor.setData(
                                  editObj.question
                                );
                              }
                            }}
                            onChange={(event) => {
                              let dataa = event.editor.getData();

                              let data = dataa;
                              console.log('data', data);

                              // Replace <ol> and <li> tags with <span> tags for inline behavior
                              data = data
                                .replace(/<\/?ol>/g, '') // Remove <ol> and </ol> tags
                                .replace(/<\/li>/g, '</span>') // Replace </li> with </span>
                                .replace(
                                  /<li>/g,
                                  `<span style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                )
                                .replace(
                                  /<p>/g,
                                  `<p style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                );

                              const imageSources =
                                extractImageSrc(data);

                              // Convert base64 array to Blob array
                              const blobs = convertBase64ArrayToBlobs(
                                imageSources,
                                'image/png'
                              );

                              // Call API to upload images
                              const res = postImageApi(
                                blobs,
                                data,
                                'question'
                              );
                            }}
                          />
                        </div>

                        <div className='flex flex-col gap-[20px]'>
                          <div className='flex gap-[15px] mx-[auto] mt-[20px]'>
                            <div className='flex flex-col'>
                              <p className='mt-[30px] text-[#757575] flex flex-start'>
                                Option 1
                              </p>
                              <CKEditor
                                config={{
                                  ...config,
                                  width: '370px',
                                  height: '200px', // Customize height
                                }}
                                onInstanceReady={(event) => {
                                  editorRef1.current = event.editor; // Save CKEditor instance
                                  if (editObj?.option1) {
                                    event.editor.setData(
                                      editObj.option1
                                    ); // Set initial content
                                  }
                                }}
                                onChange={(event) => {
                                  let dataa = event.editor.getData();

                                  let data = dataa;
                                  console.log('data', data);

                                  // Replace <ol> and <li> tags with <span> tags for inline behavior
                                  data = data
                                    .replace(/<\/?ol>/g, '') // Remove <ol> and </ol> tags
                                    .replace(/<\/li>/g, '</span>') // Replace </li> with </span>
                                    .replace(
                                      /<li>/g,
                                      `<span style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    )
                                    .replace(
                                      /<p>/g,
                                      `<p style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    );

                                  const imageSources =
                                    extractImageSrc(data);

                                  // Convert base64 array to Blob array
                                  const blobs =
                                    convertBase64ArrayToBlobs(
                                      imageSources,
                                      'image/png'
                                    );

                                  // Call API to upload images
                                  const res = postImageApi(
                                    blobs,
                                    data,
                                    'option1'
                                  );
                                }}
                              />
                            </div>

                            <div className='flex flex-col'>
                              <p className='mt-[30px] text-[#757575] flex flex-start'>
                                Option 2
                              </p>
                              <CKEditor
                                config={{
                                  ...config,
                                  width: '370px',
                                  height: '200px', // Customize height
                                }}
                                onInstanceReady={(event) => {
                                  editorRef2.current = event.editor; // Save CKEditor instance
                                  if (editObj?.option2) {
                                    event.editor.setData(
                                      editObj.option2
                                    ); // Set initial content
                                  }
                                }}
                                onChange={(event) => {
                                  let dataa = event.editor.getData();

                                  let data = dataa;
                                  console.log('data', data);

                                  // Replace <ol> and <li> tags with <span> tags for inline behavior
                                  data = data
                                    .replace(/<\/?ol>/g, '') // Remove <ol> and </ol> tags
                                    .replace(/<\/li>/g, '</span>') // Replace </li> with </span>
                                    .replace(
                                      /<li>/g,
                                      `<span style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    )
                                    .replace(
                                      /<p>/g,
                                      `<p style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    );

                                  const imageSources =
                                    extractImageSrc(data);

                                  // Convert base64 array to Blob array
                                  const blobs =
                                    convertBase64ArrayToBlobs(
                                      imageSources,
                                      'image/png'
                                    );

                                  // Call API to upload images
                                  const res = postImageApi(
                                    blobs,
                                    data,
                                    'option2'
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div className='flex gap-[15px] mx-[auto] mt-[20px]'>
                            <div className='flex flex-col'>
                              <p className='mt-[30px] text-[#757575] flex flex-start'>
                                Option 3
                              </p>
                              <CKEditor
                                config={{
                                  ...config,
                                  width: '370px',
                                  height: '200px', // Customize height
                                }}
                                onInstanceReady={(event) => {
                                  editorRef3.current = event.editor; // Save CKEditor instance
                                  if (editObj?.option3) {
                                    event.editor.setData(
                                      editObj.option3
                                    ); // Set initial content
                                  }
                                }}
                                onChange={(event) => {
                                  let dataa = event.editor.getData();

                                  let data = dataa;
                                  console.log('data', data);

                                  // Replace <ol> and <li> tags with <span> tags for inline behavior
                                  data = data
                                    .replace(/<\/?ol>/g, '') // Remove <ol> and </ol> tags
                                    .replace(/<\/li>/g, '</span>') // Replace </li> with </span>
                                    .replace(
                                      /<li>/g,
                                      `<span style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    )
                                    .replace(
                                      /<p>/g,
                                      `<p style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    );

                                  const imageSources =
                                    extractImageSrc(data);

                                  // Convert base64 array to Blob array
                                  const blobs =
                                    convertBase64ArrayToBlobs(
                                      imageSources,
                                      'image/png'
                                    );

                                  // Call API to upload images
                                  const res = postImageApi(
                                    blobs,
                                    data,
                                    'option3'
                                  );
                                }}
                              />
                            </div>

                            <div className='flex flex-col'>
                              <p className='mt-[30px] text-[#757575] flex flex-start'>
                                Option 4
                              </p>
                              <CKEditor
                                config={{
                                  ...config,
                                  width: '370px',
                                  height: '200px', // Customize height
                                }}
                                onInstanceReady={(event) => {
                                  editorRef4.current = event.editor; // Save CKEditor instance
                                  if (editObj?.option4) {
                                    event.editor.setData(
                                      editObj.option4
                                    ); // Set initial content
                                  }
                                }}
                                onChange={(event) => {
                                  let dataa = event.editor.getData();

                                  let data = dataa;
                                  console.log('data', data);

                                  // Replace <ol> and <li> tags with <span> tags for inline behavior
                                  data = data
                                    .replace(/<\/?ol>/g, '') // Remove <ol> and </ol> tags
                                    .replace(/<\/li>/g, '</span>') // Replace </li> with </span>
                                    .replace(
                                      /<li>/g,
                                      `<span style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    )
                                    .replace(
                                      /<p>/g,
                                      `<p style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    );

                                  const imageSources =
                                    extractImageSrc(data);

                                  // Convert base64 array to Blob array
                                  const blobs =
                                    convertBase64ArrayToBlobs(
                                      imageSources,
                                      'image/png'
                                    );

                                  // Call API to upload images
                                  const res = postImageApi(
                                    blobs,
                                    data,
                                    'option4'
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div className='mx-[auto]'>
                            <div className='flex flex-col'>
                              <p className='mt-[30px] text-[#757575] flex flex-start'>
                                explanation
                              </p>
                              <CKEditor
                                config={{
                                  ...config,
                                  width: '370px',
                                  height: '200px', // Customize height
                                }}
                                onInstanceReady={(event) => {
                                  editorRef4.current = event.editor; // Save CKEditor instance
                                  if (editObj?.explanation) {
                                    event.editor.setData(
                                      editObj.explanation
                                    ); // Set initial content
                                  }
                                }}
                                onChange={(event) => {
                                  let dataa = event.editor.getData();

                                  let data = dataa;
                                  console.log('data', data);

                                  // Replace <ol> and <li> tags with <span> tags for inline behavior
                                  data = data
                                    .replace(/<\/?ol>/g, '') // Remove <ol> and </ol> tags
                                    .replace(/<\/li>/g, '</span>') // Replace </li> with </span>
                                    .replace(
                                      /<li>/g,
                                      `<span style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    )
                                    .replace(
                                      /<p>/g,
                                      `<p style="display: flex; flex-wrap: wrap; white-space: nowrap;">`
                                    );

                                  const imageSources =
                                    extractImageSrc(data);

                                  // Convert base64 array to Blob array
                                  const blobs =
                                    convertBase64ArrayToBlobs(
                                      imageSources,
                                      'image/png'
                                    );

                                  // Call API to upload images
                                  const res = postImageApi(
                                    blobs,
                                    data,
                                    'explanation'
                                  );
                                }}
                              />
                            </div>
                          </div>

                          {questionType === 'single' ? (
                            <div
                              style={{
                                width: 'fit-content',
                              }}
                              className='mx-[auto]'
                            >
                              <p className='mt-[30px]'>
                                Select your Answer
                              </p>

                              <div className='max-w-[600px] mt-[20px] flex-wrap  w-[100%] flex gap-[30px]'>
                                <div className='flex'>
                                  <input
                                    type='radio'
                                    id='option1'
                                    name='options'
                                    value='option1'
                                    checked={
                                      editObjTemp.multiAnswers[0] ===
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
                                        editObjTemp
                                          .multiAnswers[0] ===
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
                                        editObjTemp
                                          .multiAnswers[0] ===
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
                                        editObjTemp
                                          .multiAnswers[0] ===
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
                                {editObjTemp?.multiAnswers
                                  ?.map(
                                    (answer) =>
                                      answer.charAt(0).toUpperCase() +
                                      answer.slice(1)
                                  )
                                  .join(', ')}
                              </p>
                            </div>
                          ) : questionType === 'multiple' ? (
                            <div
                              style={{
                                width: 'fit-content',
                              }}
                              className='mx-auto mt-[30px]'
                            >
                              <p className='mt-[30px]'>
                                Select Multiple Options
                              </p>

                              <div className='max-w-[600px] mt-[20px] flex-wrap w-[100%] flex gap-[30px]'>
                                {options?.map((option) => (
                                  <div
                                    key={option.id}
                                    className='flex items-center'
                                  >
                                    <label>
                                      <input
                                        type='checkbox'
                                        checked={editObjTemp?.multiAnswers?.includes(
                                          option.label
                                        )}
                                        onChange={() =>
                                          handleToggle(option.label)
                                        }
                                      />{' '}
                                      {option.label
                                        .charAt(0)
                                        .toUpperCase() +
                                        option.label.slice(1)}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <p className='mt-[20px]'>
                                Selected Options:{' '}
                                {editObjTemp?.multiAnswers
                                  ?.map(
                                    (answer) =>
                                      answer.charAt(0).toUpperCase() +
                                      answer.slice(1)
                                  )
                                  .join(', ')}
                              </p>
                            </div>
                          ) : (
                            <>
                              <p className='mt-[30px] text-[#757575]'>
                                Solution
                              </p>
                              <CKEditor
                                initData=''
                                onChange={(event) => {
                                  let dataa = event.editor.getData();

                                  let data = dataa;
                                  // let data = updateImageStyles(dataa);

                                  console.log('data', data);

                                  // Replace <ol> and <li> tags with <span> tags and ensure inline behavior
                                  data = data
                                    .replace(/<\/?ol>/g, '') // Remove <ol> and </ol> tags
                                    .replace(/<\/li>/g, '</span>') // Replace </li> with </span>
                                    .replace(/<li>/g, `<span>`)
                                    .replace(/<p>/g, `<p>`);

                                  // Replace <img> tags with <img> tags and ensure inline style is added
                                  data = data
                                    .replace(
                                      /<img([^>]*?)style="([^"]*?)"([^>]*?)>/g, // Handles cases where style already exists
                                      `<img$1style="$2 display:inline;"$3>`
                                    )
                                    .replace(
                                      /<img(?![^>]*?style=")/g, // Handles cases where style attribute is missing
                                      `<img style="display:inline;"`
                                    );

                                  const imageSources =
                                    extractImageSrc(data);

                                  // Convert base64 array to Blob array
                                  const blobs =
                                    convertBase64ArrayToBlobs(
                                      imageSources,
                                      'image/png'
                                    );

                                  const res = postImageApi(
                                    blobs,
                                    data,
                                    'solution'
                                  );
                                }}
                                config={{
                                  ...config,
                                  height: '200px',
                                }}
                                onInstanceReady={(event) => {
                                  editorRef5.current = event.editor;
                                  // Load the existing solution so it is shown
                                  // and is not lost when the question is saved
                                  if (editObjTemp?.solution) {
                                    event.editor.setData(
                                      editObjTemp.solution
                                    );
                                  }

                                  // Hide all .cke_top elements
                                  const topEditorElements =
                                    document.querySelectorAll(
                                      '.cke_top'
                                    );
                                  topEditorElements.forEach(
                                    (editorElement) => {
                                      editorElement.style.display =
                                        'none';
                                    }
                                  );

                                  const bottomEditorElements =
                                    document.querySelectorAll(
                                      '.cke_bottom'
                                    );
                                  bottomEditorElements.forEach(
                                    (editorElementt) => {
                                      editorElementt.style.display =
                                        'none';
                                    }
                                  );
                                }}
                                onBlur={(event) => {
                                  const editorInstance = event.editor;
                                  const currentData =
                                    editorInstance.getData(); // Get the current content of the editor

                                  // Validate the field using current editor data
                                  validateField(
                                    'solution',
                                    currentData
                                  );
                                }}
                              />
                              {errors.solution && (
                                <p className='text-red-500 text-sm'>
                                  {errors.solution}
                                </p>
                              )}
                            </>
                          )}

                          <button
                            style={{
                              width: 'fit-content',
                              background:
                                '-webkit-linear-gradient(left, #8F94FB, #4E54C8)',
                            }}
                            onClick={() => {
                              if (!loader) {
                                EditFunc();
                              }
                            }}
                            className={`${
                              loader ? 'disabled' : ''
                            } px-[20px] h-[44px] rounded-[5000px] font-medium flex mt-[32px] mx-[auto] justify-center font-light items-center text-[18px] text-[#ffffff]`}
                          >
                            <i
                              className={`fa ${
                                loader ? 'fa-spin fa-spinner' : ''
                              }`}
                            ></i>
                            {loader ? 'Processing' : 'Save'}
                            {/* Submit */}
                          </button>
                        </div>
                      </div>
                    </StyledPopupEdit>
                  </div>
                </div>

                {/* Delete Confirmation Modal */}
                {open && (
                  <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm'>
                    <div className='bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all'>
                      <div className='text-center'>
                        <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-8 w-8 text-red-600'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                            />
                          </svg>
                        </div>
                        <h3 className='text-xl font-medium text-gray-900 mb-2'>
                          Confirm Delete
                        </h3>
                        <p className='text-gray-600 mb-6'>
                          Are you sure you want to delete this
                          question? This action cannot be undone.
                        </p>
                        <div className='flex justify-center gap-4'>
                          <button
                            onClick={handleClose}
                            className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors duration-300'
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              handleDelete();
                            }}
                            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2'
                          >
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-5 w-5'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ))}

            {/* Pagination */}
            <div className='flex flex-col items-center space-y-4 p-6 bg-white rounded-xl shadow-md'>
              {/* Pagination controls */}
              <div className='flex flex-wrap  items-center space-x-1 space-y-1'>
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-300'
                  }`}
                  aria-label='Previous page'
                >
                  <ChevronLeft size={18} />
                </button>

                {pagesArr?.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(page.num)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      page.num === currentPage
                        ? 'bg-indigo-600 text-white shadow-md'
                        : page.num === '...'
                        ? 'bg-white text-gray-600 cursor-default'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page.num}
                  </button>
                ))}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-300'
                  }`}
                  aria-label='Next page'
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Page indicator */}
              <div className='text-sm text-gray-600 font-medium'>
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center h-[60vh]'>
            <div className='text-center p-8 bg-white rounded-xl shadow-md'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-16 w-16 mx-auto text-gray-400 mb-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M9 4h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z'
                />
              </svg>
              <p className='text-xl text-gray-700 font-medium'>
                No Questions Available
              </p>
              <p className='text-gray-500 mt-2'>
                Try changing your filters or add new questions
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default ViewQuestions;