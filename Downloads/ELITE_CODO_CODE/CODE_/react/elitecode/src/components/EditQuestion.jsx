import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { httpClient } from '../axios';

const EditQuestion = () => {
  const { questionId } = useParams();
  const [searchParams] = useSearchParams();

  // Angular opens React like:
  // /edit-question/1285?teacherId=71
  const teacherIdParam = searchParams.get('teacherId');
  const teacherId =
    teacherIdParam && !Number.isNaN(Number(teacherIdParam))
      ? Number(teacherIdParam)
      : null;

  // =========================================================
  // MAIN STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =========================================================
  // DROPDOWN LISTS
  // =========================================================

  const [standardList, setStandardList] = useState([]);
  const [entExamsList, setEntExamsList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [chapterList, setChapterList] = useState([]);
  const [topicList, setTopicList] = useState([]);
  const [subTopicList, setSubTopicList] = useState([]);

  const [yearOfAppearList, setYearOfAppearList] = useState([]);
  const [questionTypeList, setQuestionTypeList] = useState([]);
  const [questionLevelList, setQuestionLevelList] = useState([]);
  const [patternsList, setPatternsList] = useState([]);

  // =========================================================
  // QUESTION CATEGORY
  // =========================================================

  const questionCategoryList = [
    {
      questionCategoryId: 1,
      questionCategoryName: 'Numerical',
    },
    {
      questionCategoryId: 2,
      questionCategoryName: 'Theoretical',
    },
  ];

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    questionId: null,

    // Teacher/User ID required by backend update()
    id: null,

    standardId: '',
    standardName: '',

    entranceExamId: '',
    entranceExamName: '',

    subjectId: '',
    subjectName: '',

    chapterId: '',
    chapterName: '',

    topicId: '',
    topicName: '',

    subTopicId: '',
    subTopicName: '',

    yearOfAppearanceId: '',
    yearOfAppearance: '',

    questionTypeId: '',
    questionType: '',

    questionLevelId: '',
    questionLevel: '',

    patternId: '',
    patternName: '',

    marks: '',

    questionCategory: '',

    question: '',

    option1: '',
    option2: '',
    option3: '',
    option4: '',

    explanation: '',
    solution: '',

    multiAnswers: [],

    asked: false,
    status: true,
  });

  // Store original status to preserve it during update
  const [originalStatus, setOriginalStatus] = useState(null);

  // =========================================================
  // NORMALIZE MULTI ANSWERS
  // =========================================================

  const normalizeMultiAnswers = (value) => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!questionId) {
      setError('Question ID not found in URL.');
      setLoading(false);
      return;
    }

    if (!teacherId) {
      setError('Teacher ID not found in URL.');
      setLoading(false);
      return;
    }

    loadInitialData();
    // teacherId is derived from the current URL query string.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, teacherId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      /*
       * Load master dropdowns and question first.
       */

      await Promise.all([
        getStandards(),
        getYearOfAppearance(),
        getQuestionType(),
        getQuestionLevel(),
        getPatterns(),
      ]);

      await getQuestionById();
    } catch (err) {
      console.error(err);

      setError(
        'Failed to load question data.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GET QUESTION BY ID
  // =========================================================

  const getQuestionById = async () => {
    try {
      const response = await httpClient.get(
        `/api/question/questionbyid1/${questionId}`
      );

      console.log(
        'Question By ID:',
        response.data
      );

      const data = response?.data;

      if (!data) {
        throw new Error(
          `Question ${questionId} not found`
        );
      }

      const questionData = {
        questionId:
          data.questionId ??
          Number(questionId),

        // Backend update() expects the teacher/user ID in the `id` field.
        // Use the teacherId passed by the Angular project in the URL.
        id: teacherId,

        standardId:
          data.standardId ?? '',

        standardName:
          data.standardName ?? '',

        entranceExamId:
          data.entranceExamId ?? '',

        entranceExamName:
          data.entranceExamName ?? '',

        subjectId:
          data.subjectId ?? '',

        subjectName:
          data.subjectName ?? '',

        chapterId:
          data.chapterId ?? '',

        chapterName:
          data.chapterName ?? '',

        topicId:
          data.topicId ?? '',

        topicName:
          data.topicName ?? '',

        subTopicId:
          data.subTopicId ?? '',

        subTopicName:
          data.subTopicName ?? '',

        yearOfAppearanceId:
          data.yearOfAppearanceId ?? '',

        yearOfAppearance:
          data.yearOfAppearance ?? '',

        questionTypeId:
          data.questionTypeId ?? '',

        questionType:
          data.questionType ?? '',

        questionLevelId:
          data.questionLevelId ?? '',

        questionLevel:
          data.questionLevel ?? '',

        patternId:
          data.patternId ?? '',

        patternName:
          data.patternName ?? '',

        marks:
          data.marks ?? '',

        questionCategory:
          data.questionCategory ?? '',

        question:
          data.question ?? '',

        option1:
          data.option1 ?? '',

        option2:
          data.option2 ?? '',

        option3:
          data.option3 ?? '',

        option4:
          data.option4 ?? '',

        explanation:
          data.explanation ?? '',

        solution:
          data.solution ?? '',

        multiAnswers:
          normalizeMultiAnswers(
            data.multiAnswers
          ),

        asked:
          data.asked ?? false,

        status:
          data.status ?? true,
      };

      setFormData(questionData);

      // ✅ FIX: Store the original status to preserve it during update
      setOriginalStatus(data.status);

      /*
       * Now load dependent dropdowns using
       * existing IDs.
       */

      if (questionData.standardId) {
        await Promise.all([
          getEntranceExams(
            questionData.standardId
          ),

          getSubjects(
            questionData.standardId
          ),
        ]);
      }

      if (questionData.subjectId) {
        await getChapters(
          questionData.subjectId
        );
      }

      if (questionData.chapterId) {
        await getTopics(
          questionData.chapterId
        );
      }

      if (questionData.topicId) {
        await getSubTopics(
          questionData.topicId
        );
      }
    } catch (err) {
      console.error(
        'Get Question Error:',
        err
      );

      console.error(
        'Backend:',
        err?.response?.data
      );

      throw err;
    }
  };

  // =========================================================
  // STANDARD LIST
  // =========================================================

  const getStandards = async () => {
    try {
      const response = await httpClient.get(
        '/api/standard/getallstandards'
      );

      console.log(
        'Standards:',
        response.data
      );

      setStandardList(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        'Standard API Error:',
        err
      );

      setStandardList([]);
    }
  };

  // =========================================================
  // ENTRANCE EXAMS BY STANDARD
  // =========================================================

  const getEntranceExams = async (
    standardId
  ) => {
    if (!standardId) {
      setEntExamsList([]);
      return;
    }

    try {
      const response = await httpClient.get(
        `/api/standard/standardwiseentranceexam/${standardId}`
      );

      console.log(
        'Entrance Exams:',
        response.data
      );

      setEntExamsList(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        'Entrance Exam API Error:',
        err
      );

      setEntExamsList([]);
    }
  };

  // =========================================================
  // SUBJECTS BY STANDARD
  // =========================================================

  const getSubjects = async (
    standardId
  ) => {
    if (!standardId) {
      setSubjectList([]);
      return;
    }

    try {
      const response = await httpClient.get(
        `/api/subject/standardwisesubject/${standardId}`
      );

      console.log(
        'Subjects:',
        response.data
      );

      const list =
        response?.data?.subjectMasters ??
        response?.data ??
        [];

      setSubjectList(
        Array.isArray(list)
          ? list
          : []
      );
    } catch (err) {
      console.error(
        'Subject API Error:',
        err
      );

      setSubjectList([]);
    }
  };

  // =========================================================
  // CHAPTERS BY SUBJECT
  // =========================================================

  const getChapters = async (
    subjectId
  ) => {
    if (!subjectId) {
      setChapterList([]);
      return;
    }

    try {
      const response = await httpClient.get(
        `/api/chapter/subjectwisechapter/${subjectId}`
      );

      console.log(
        'Chapters:',
        response.data
      );

      setChapterList(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        'Chapter API Error:',
        err
      );

      setChapterList([]);
    }
  };

  // =========================================================
  // TOPICS BY CHAPTER
  // =========================================================

  const getTopics = async (
    chapterId
  ) => {
    if (!chapterId) {
      setTopicList([]);
      return;
    }

    try {
      const response = await httpClient.get(
        `/api/topic/chapterwisetopics/${chapterId}`
      );

      console.log(
        'Topics:',
        response.data
      );

      setTopicList(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        'Topic API Error:',
        err
      );

      setTopicList([]);
    }
  };

  // =========================================================
  // SUB TOPICS BY TOPIC
  // =========================================================

  const getSubTopics = async (
    topicId
  ) => {
    if (!topicId) {
      setSubTopicList([]);
      return;
    }

    try {
      const response = await httpClient.get(
        `/api/subtopic/topicwisesubtopics/${topicId}`
      );

      console.log(
        'Sub Topics:',
        response.data
      );

      setSubTopicList(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        'Sub Topic API Error:',
        err
      );

      setSubTopicList([]);
    }
  };

  // =========================================================
  // YEAR OF APPEARANCE
  // =========================================================

  const getYearOfAppearance =
    async () => {
      try {
        const response =
          await httpClient.get(
            '/api/yearofappearance/getallactive'
          );

        console.log(
          'Years:',
          response.data
        );

        setYearOfAppearList(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (err) {
        console.error(
          'Year API Error:',
          err
        );

        setYearOfAppearList([]);
      }
    };

  // =========================================================
  // QUESTION TYPE
  // =========================================================

  const getQuestionType =
    async () => {
      try {
        const response =
          await httpClient.get(
            '/api/questiontype/getallactive'
          );

        console.log(
          'Question Types:',
          response.data
        );

        setQuestionTypeList(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (err) {
        console.error(
          'Question Type Error:',
          err
        );

        setQuestionTypeList([]);
      }
    };

  // =========================================================
  // QUESTION LEVEL
  // =========================================================

  const getQuestionLevel =
    async () => {
      try {
        const response =
          await httpClient.get(
            '/api/questionlevel/getallactive'
          );

        console.log(
          'Question Levels:',
          response.data
        );

        setQuestionLevelList(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (err) {
        console.error(
          'Question Level Error:',
          err
        );

        setQuestionLevelList([]);
      }
    };

  // =========================================================
  // PATTERNS
  // =========================================================

  const getPatterns = async () => {
    try {
      const response =
        await httpClient.get(
          '/api/pattern/getallactive'
        );

      console.log(
        'Patterns:',
        response.data
      );

      setPatternsList(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        'Pattern Error:',
        err
      );

      setPatternsList([]);
    }
  };

  // =========================================================
  // STANDARD CHANGE
  // =========================================================

  const handleStandardChange =
    async (event) => {
      const value =
        event.target.value;

      const id =
        value === ''
          ? ''
          : Number(value);

      setError('');
      setSuccess('');

      setFormData((prev) => ({
        ...prev,

        standardId: id,

        entranceExamId: '',
        entranceExamName: '',

        subjectId: '',
        subjectName: '',

        chapterId: '',
        chapterName: '',

        topicId: '',
        topicName: '',

        subTopicId: '',
        subTopicName: '',
      }));

      setEntExamsList([]);
      setSubjectList([]);
      setChapterList([]);
      setTopicList([]);
      setSubTopicList([]);

      if (id) {
        await Promise.all([
          getEntranceExams(id),
          getSubjects(id),
        ]);
      }
    };

  // =========================================================
  // EXAM CHANGE
  // =========================================================

  const handleExamChange = (
    event
  ) => {
    const value =
      event.target.value;

    const id =
      value === ''
        ? ''
        : Number(value);

    const selected =
      entExamsList.find(
        (item) =>
          Number(
            item.entranceExamId
          ) === id
      );

    setFormData((prev) => ({
      ...prev,

      entranceExamId: id,

      entranceExamName:
        selected?.entranceExamName ??
        '',
    }));
  };

  // =========================================================
  // SUBJECT CHANGE
  // =========================================================

  const handleSubjectChange =
    async (event) => {
      const value =
        event.target.value;

      const id =
        value === ''
          ? ''
          : Number(value);

      const selected =
        subjectList.find(
          (item) =>
            Number(item.subjectId) ===
            id
        );

      setFormData((prev) => ({
        ...prev,

        subjectId: id,

        subjectName:
          selected?.subjectName ?? '',

        chapterId: '',
        chapterName: '',

        topicId: '',
        topicName: '',

        subTopicId: '',
        subTopicName: '',
      }));

      setChapterList([]);
      setTopicList([]);
      setSubTopicList([]);

      if (id) {
        await getChapters(id);
      }
    };

  // =========================================================
  // CHAPTER CHANGE
  // =========================================================

  const handleChapterChange =
    async (event) => {
      const value =
        event.target.value;

      const id =
        value === ''
          ? ''
          : Number(value);

      const selected =
        chapterList.find(
          (item) =>
            Number(item.chapterId) ===
            id
        );

      setFormData((prev) => ({
        ...prev,

        chapterId: id,

        chapterName:
          selected?.chapterName ?? '',

        topicId: '',
        topicName: '',

        subTopicId: '',
        subTopicName: '',
      }));

      setTopicList([]);
      setSubTopicList([]);

      if (id) {
        await getTopics(id);
      }
    };

  // =========================================================
  // TOPIC CHANGE
  // =========================================================

  const handleTopicChange =
    async (event) => {
      const value =
        event.target.value;

      const id =
        value === ''
          ? ''
          : Number(value);

      const selected =
        topicList.find(
          (item) =>
            Number(item.topicId) === id
        );

      setFormData((prev) => ({
        ...prev,

        topicId: id,

        topicName:
          selected?.topicName ?? '',

        subTopicId: '',
        subTopicName: '',
      }));

      setSubTopicList([]);

      if (id) {
        await getSubTopics(id);
      }
    };

  // =========================================================
  // SUB TOPIC CHANGE
  // =========================================================

  const handleSubTopicChange = (
    event
  ) => {
    const value =
      event.target.value;

    const id =
      value === ''
        ? ''
          : Number(value);

    const selected =
      subTopicList.find(
        (item) =>
          Number(item.subTopicId) ===
          id
      );

    setFormData((prev) => ({
      ...prev,

      subTopicId: id,

      subTopicName:
        selected?.subTopicName ?? '',
    }));
  };

  // =========================================================
  // YEAR CHANGE
  // =========================================================

  const handleYearChange = (
    event
  ) => {
    const value =
      event.target.value;

    const id =
      value === ''
        ? ''
        : Number(value);

    const selected =
      yearOfAppearList.find(
        (item) =>
          Number(
            item.yearOfAppearanceId
          ) === id
      );

    setFormData((prev) => ({
      ...prev,

      yearOfAppearanceId: id,

      yearOfAppearance:
        selected?.yearOfAppearance ??
        '',

      asked: Boolean(id),
    }));
  };

  // =========================================================
  // QUESTION TYPE CHANGE
  // =========================================================

  const handleQuestionTypeChange = (
    event
  ) => {
    const value =
      event.target.value;

    const id =
      value === ''
        ? ''
        : Number(value);

    const selected =
      questionTypeList.find(
        (item) =>
          Number(
            item.questionTypeId
          ) === id
      );

    setFormData((prev) => ({
      ...prev,

      questionTypeId: id,

      questionType:
        selected?.questionType ?? '',
    }));
  };

  // =========================================================
  // QUESTION LEVEL CHANGE
  // =========================================================

  const handleQuestionLevelChange = (
    event
  ) => {
    const value =
      event.target.value;

    const id =
      value === ''
        ? ''
        : Number(value);

    const selected =
      questionLevelList.find(
        (item) =>
          Number(
            item.questionLevelId
          ) === id
      );

    setFormData((prev) => ({
      ...prev,

      questionLevelId: id,

      questionLevel:
        selected?.questionLevel ?? '',
    }));
  };

  // =========================================================
  // PATTERN CHANGE
  // =========================================================

  const handlePatternChange = (
    event
  ) => {
    const value =
      event.target.value;

    const id =
      value === ''
        ? ''
        : Number(value);

    const selected =
      patternsList.find(
        (item) =>
          Number(item.patternId) ===
          id
      );

    setFormData((prev) => ({
      ...prev,

      patternId: id,

      patternName:
        selected?.patternName ?? '',
    }));
  };

  // =========================================================
  // NORMAL INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setError('');
    setSuccess('');

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));
  };

  // =========================================================
  // CORRECT ANSWER
  // =========================================================

  const handleCorrectAnswer = (
    optionName
  ) => {
    setFormData((prev) => {
      const answers =
        Array.isArray(
          prev.multiAnswers
        )
          ? prev.multiAnswers
          : [];

      const exists =
        answers.includes(optionName);

      return {
        ...prev,

        multiAnswers: exists
          ? answers.filter(
              (item) =>
                item !== optionName
            )
          : [
              ...answers,
              optionName,
            ],
      };
    });
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    if (!formData.standardId) {
      return 'Please select Standard.';
    }

    if (!formData.entranceExamId) {
      return 'Please select Exam.';
    }

    if (!formData.subjectId) {
      return 'Please select Subject.';
    }

    if (!formData.chapterId) {
      return 'Please select Chapter.';
    }

    if (!formData.questionTypeId) {
      return 'Please select Question Type.';
    }

    if (!formData.questionLevelId) {
      return 'Please select Question Level.';
    }

    if (!formData.patternId) {
      return 'Please select Pattern.';
    }

    if (
      !formData.questionCategory
    ) {
      return 'Please select Question Category.';
    }

    if (
      !formData.marks ||
      Number(formData.marks) <= 0
    ) {
      return 'Marks must be greater than 0.';
    }

    if (
      !formData.question?.trim()
    ) {
      return 'Question is required.';
    }

    if (
      !formData.option1?.trim()
    ) {
      return 'Option 1 is required.';
    }

    if (
      !formData.option2?.trim()
    ) {
      return 'Option 2 is required.';
    }

    if (
      !formData.option3?.trim()
    ) {
      return 'Option 3 is required.';
    }

    if (
      !formData.option4?.trim()
    ) {
      return 'Option 4 is required.';
    }

    return '';
  };

  // =========================================================
  // SAVE UPDATE - FIXED
  // =========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!questionId) {
      setError('Question ID is missing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!teacherId) {
      setError(
        'Teacher ID is missing. Please open this question from the Angular teacher project.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        questionId: Number(questionId),

        // Backend QuestionRequest#getId() is the teacher/user ID.
        id: Number(teacherId),

        entranceExamId: Number(formData.entranceExamId),
        standardId: Number(formData.standardId),
        subjectId: Number(formData.subjectId),
        chapterId: Number(formData.chapterId),

        topicId: formData.topicId
          ? Number(formData.topicId)
          : null,

        subTopicId: formData.subTopicId
          ? Number(formData.subTopicId)
          : null,

        yearOfAppearanceId: formData.yearOfAppearanceId
          ? Number(formData.yearOfAppearanceId)
          : null,

        questionTypeId: Number(formData.questionTypeId),

        questionLevelId: formData.questionLevelId
          ? Number(formData.questionLevelId)
          : null,

        patternId: Number(formData.patternId),
        marks: Number(formData.marks),

        questionCategory: formData.questionCategory,
        question: formData.question,
        option1: formData.option1,
        option2: formData.option2,
        option3: formData.option3,
        option4: formData.option4,
        explanation: formData.explanation,
        solution: formData.solution,

        multiAnswers: Array.isArray(formData.multiAnswers)
          ? formData.multiAnswers
          : [],

        asked: Boolean(formData.yearOfAppearanceId),

        // ✅ FIX: Use original status to preserve it
        // This keeps the status as it was (Pending, Active, Rejected, etc.)
        status: originalStatus !== null && originalStatus !== undefined
          ? originalStatus
          : Boolean(formData.status),
      };

      console.log('QUESTION ID:', questionId);
      console.log('TEACHER ID:', teacherId);
      console.log('ORIGINAL STATUS:', originalStatus);
      console.log('UPDATE PAYLOAD:', payload);

      const response = await httpClient.put(
        '/api/question/update',
        payload
      );

      console.log('UPDATE RESPONSE:', response.data);

      if (response?.data?.flag === false) {
        setError(
          response?.data?.message ||
            'Question update failed.'
        );
        return;
      }

      setSuccess(
        response?.data?.message ||
          'Question updated successfully.'
      );

      await getQuestionById();

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (err) {
      console.error('UPDATE ERROR:', err);
      console.error(
        'BACKEND RESPONSE:',
        err?.response?.data
      );

      const backendMessage =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string'
          ? err.response.data
          : '');

      setError(
        backendMessage ||
          'Failed to update question.'
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="loading-page">
        Loading Question{' '}
        {questionId}...
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f5f6f8;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Arial,
            sans-serif;
          color: #374151;
        }

        .loading-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .edit-page {
          min-height: 100vh;
          padding: 25px;
        }

        .edit-container {
          max-width: 1100px;
          margin: auto;
          background: white;
          border-radius: 12px;
          box-shadow:
            0 3px 14px
            rgba(0,0,0,0.08);
        }

        .header {
          padding: 25px 30px;
          border-bottom:
            1px solid #eee;
        }

        .header-top {
          display: flex;
          justify-content:
            space-between;
          align-items: center;
        }

        .header-title {
          font-size: 18px;
          color: #666;
        }

        .header-subject {
          margin-top: 15px;
          font-size: 17px;
          color: #666;
        }

        .form {
          padding: 28px 30px 40px;
        }

        .message {
          padding: 12px 15px;
          margin-bottom: 20px;
          border-radius: 6px;
          font-size: 14px;
        }

        .error {
          background: #fef2f2;
          border:
            1px solid #fecaca;
          color: #b91c1c;
        }

        .success {
          background: #f0fdf4;
          border:
            1px solid #bbf7d0;
          color: #166534;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 18px 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label {
          font-size: 13px;
          color: #6b7280;
        }

        .input,
        .select,
        .textarea {
          width: 100%;
          border:
            1px solid #ced4da;
          background: white;
          color: #111827;
          outline: none;
          font-family: inherit;
          font-size: 14px;
        }

        .input,
        .select {
          height: 40px;
          padding: 0 11px;
          border-radius: 4px;
        }

        .input:focus,
        .select:focus,
        .textarea:focus {
          border-color: #6366f1;
          box-shadow:
            0 0 0 2px
            rgba(99,102,241,.12);
        }

        .question-area {
          max-width: 800px;
          margin: 30px auto 0;
        }

        .textarea {
          padding: 12px;
          resize: vertical;
          min-height: 140px;
        }

        .question-textarea {
          min-height: 170px;
        }

        .options-grid {
          max-width: 850px;
          margin: 25px auto 0;
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 30px 16px;
        }

        .option-textarea {
          min-height: 150px;
        }

        .correct-row {
          display: flex;
          gap: 7px;
          align-items: center;
          margin-top: 7px;
          font-size: 13px;
          cursor: pointer;
        }

        .correct-row.selected {
          color: #059669;
          font-weight: 600;
        }

        .correct-row input {
          width: 16px;
          height: 16px;
        }

        .explanation-area {
          max-width: 500px;
          margin: 35px auto 0;
        }

        .solution-area {
          margin-top: 35px;
        }

        .solution-textarea {
          min-height: 170px;
        }

        .save-area {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .save-button {
          border: 0;
          min-width: 100px;
          padding: 11px 25px;
          border-radius: 24px;
          color: white;
          background:
            linear-gradient(
              135deg,
              #818cf8,
              #4f46e5
            );
          cursor: pointer;
          font-weight: 600;
        }

        .save-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        @media(max-width: 850px) {

          .form-grid {
            grid-template-columns:
              repeat(2,1fr);
          }

        }

        @media(max-width: 600px) {

          .edit-page {
            padding: 10px;
          }

          .form {
            padding: 20px;
          }

          .form-grid,
          .options-grid {
            grid-template-columns:
              1fr;
          }

          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

        }

      `}</style>

      <div className="edit-page">

        <div className="edit-container">

          {/* HEADER */}

          <div className="header">

            <div className="header-top">

              <div className="header-title">
                Question Id.{' '}
                {formData.questionId}
              </div>

              <div className="header-title">
                Exam:{' '}
                {
                  formData.entranceExamName
                }
              </div>

            </div>

            <div className="header-subject">
              Subject:{' '}
              {formData.subjectName}
            </div>

          </div>


          <form
            className="form"
            onSubmit={handleSave}
          >

            {/* MESSAGES */}

            {error && (
              <div className="message error">
                {error}
              </div>
            )}

            {success && (
              <div className="message success">
                {success}
              </div>
            )}


            {/* ========================= */}
            {/* UPPER DROPDOWNS */}
            {/* ========================= */}

            <div className="form-grid">

              {/* STANDARD */}

              <div className="field">

                <label className="label">
                  Standard Name
                </label>

                <select
                  className="select"
                  value={
                    formData.standardId ||
                    ''
                  }
                  onChange={
                    handleStandardChange
                  }
                >

                  <option value="">
                    Select Standard
                  </option>

                  {standardList.map(
                    (item) => (
                      <option
                        key={
                          item.standardId
                        }
                        value={
                          item.standardId
                        }
                      >
                        {
                          item.standardName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* EXAM */}

              <div className="field">

                <label className="label">
                  Exam Name
                </label>

                <select
                  className="select"
                  value={
                    formData.entranceExamId ||
                    ''
                  }
                  onChange={
                    handleExamChange
                  }
                >

                  <option value="">
                    Select Exam
                  </option>

                  {entExamsList.map(
                    (item) => (
                      <option
                        key={
                          item.entranceExamId
                        }
                        value={
                          item.entranceExamId
                        }
                      >
                        {
                          item.entranceExamName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* SUBJECT */}

              <div className="field">

                <label className="label">
                  Subject Name
                </label>

                <select
                  className="select"
                  value={
                    formData.subjectId ||
                    ''
                  }
                  onChange={
                    handleSubjectChange
                  }
                >

                  <option value="">
                    Select Subject
                  </option>

                  {subjectList.map(
                    (item) => (
                      <option
                        key={
                          item.subjectId
                        }
                        value={
                          item.subjectId
                        }
                      >
                        {
                          item.subjectName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* CHAPTER */}

              <div className="field">

                <label className="label">
                  Chapter Name
                </label>

                <select
                  className="select"
                  value={
                    formData.chapterId ||
                    ''
                  }
                  onChange={
                    handleChapterChange
                  }
                >

                  <option value="">
                    Select Chapter
                  </option>

                  {chapterList.map(
                    (item) => (
                      <option
                        key={
                          item.chapterId
                        }
                        value={
                          item.chapterId
                        }
                      >
                        {
                          item.chapterName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* TOPIC */}

              <div className="field">

                <label className="label">
                  Topic Name
                </label>

                <select
                  className="select"
                  value={
                    formData.topicId ||
                    ''
                  }
                  onChange={
                    handleTopicChange
                  }
                >

                  <option value="">
                    Select Topic
                  </option>

                  {topicList.map(
                    (item) => (
                      <option
                        key={
                          item.topicId
                        }
                        value={
                          item.topicId
                        }
                      >
                        {
                          item.topicName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* SUB TOPIC */}

              <div className="field">

                <label className="label">
                  Sub Topic Name
                </label>

                <select
                  className="select"
                  value={
                    formData.subTopicId ||
                    ''
                  }
                  onChange={
                    handleSubTopicChange
                  }
                >

                  <option value="">
                    Select Sub Topic
                  </option>

                  {subTopicList.map(
                    (item) => (
                      <option
                        key={
                          item.subTopicId
                        }
                        value={
                          item.subTopicId
                        }
                      >
                        {
                          item.subTopicName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* YEAR */}

              <div className="field">

                <label className="label">
                  Year Of Appearance
                </label>

                <select
                  className="select"
                  value={
                    formData.yearOfAppearanceId ||
                    ''
                  }
                  onChange={
                    handleYearChange
                  }
                >

                  <option value="">
                    Select Year Of Appearance
                  </option>

                  {yearOfAppearList.map(
                    (item) => (
                      <option
                        key={
                          item.yearOfAppearanceId
                        }
                        value={
                          item.yearOfAppearanceId
                        }
                      >
                        {
                          item.yearOfAppearance
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* QUESTION TYPE */}

              <div className="field">

                <label className="label">
                  Question Type
                </label>

                <select
                  className="select"
                  value={
                    formData.questionTypeId ||
                    ''
                  }
                  onChange={
                    handleQuestionTypeChange
                  }
                >

                  <option value="">
                    Select Question Type
                  </option>

                  {questionTypeList.map(
                    (item) => (
                      <option
                        key={
                          item.questionTypeId
                        }
                        value={
                          item.questionTypeId
                        }
                      >
                        {
                          item.questionType
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* QUESTION LEVEL */}

              <div className="field">

                <label className="label">
                  Level Of Question
                </label>

                <select
                  className="select"
                  value={
                    formData.questionLevelId ||
                    ''
                  }
                  onChange={
                    handleQuestionLevelChange
                  }
                >

                  <option value="">
                    Select Level Of Question
                  </option>

                  {questionLevelList.map(
                    (item) => (
                      <option
                        key={
                          item.questionLevelId
                        }
                        value={
                          item.questionLevelId
                        }
                      >
                        {
                          item.questionLevel
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* MARKS */}

              <div className="field">

                <label className="label">
                  Marks
                </label>

                <input
                  type="number"
                  name="marks"
                  min="1"
                  className="input"
                  value={
                    formData.marks
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* QUESTION CATEGORY */}

              <div className="field">

                <label className="label">
                  Question Category
                </label>

                <select
                  className="select"
                  name="questionCategory"
                  value={
                    formData.questionCategory ||
                    ''
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select Category Of Question
                  </option>

                  {questionCategoryList.map(
                    (item) => (
                      <option
                        key={
                          item.questionCategoryId
                        }
                        value={
                          item.questionCategoryName
                        }
                      >
                        {
                          item.questionCategoryName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* PATTERN */}

              <div className="field">

                <label className="label">
                  Pattern
                </label>

                <select
                  className="select"
                  value={
                    formData.patternId ||
                    ''
                  }
                  onChange={
                    handlePatternChange
                  }
                >

                  <option value="">
                    Select Pattern
                  </option>

                  {patternsList.map(
                    (item) => (
                      <option
                        key={
                          item.patternId
                        }
                        value={
                          item.patternId
                        }
                      >
                        {
                          item.patternName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>


            {/* ========================= */}
            {/* QUESTION */}
            {/* ========================= */}

            <div className="question-area">

              <div className="field">

                <label className="label">
                  Question
                </label>

                <textarea
                  name="question"
                  className="
                    textarea
                    question-textarea
                  "
                  value={
                    formData.question
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>


            {/* ========================= */}
            {/* OPTIONS */}
            {/* ========================= */}

            <div className="options-grid">

              {[
                {
                  name: 'option1',
                  label: 'Option 1',
                },
                {
                  name: 'option2',
                  label: 'Option 2',
                },
                {
                  name: 'option3',
                  label: 'Option 3',
                },
                {
                  name: 'option4',
                  label: 'Option 4',
                },
              ].map((option) => {

                const selected =
                  formData.multiAnswers.includes(
                    option.name
                  );

                return (
                  <div
                    className="field"
                    key={
                      option.name
                    }
                  >

                    <label className="label">
                      {option.label}
                    </label>

                    <textarea
                      name={
                        option.name
                      }
                      className="
                        textarea
                        option-textarea
                      "
                      value={
                        formData[
                          option.name
                        ]
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <label
                      className={`
                        correct-row
                        ${
                          selected
                            ? 'selected'
                            : ''
                        }
                      `}
                    >

                      <input
                        type="checkbox"
                        checked={
                          selected
                        }
                        onChange={() =>
                          handleCorrectAnswer(
                            option.name
                          )
                        }
                      />

                      Correct Answer

                    </label>

                  </div>
                );
              })}

            </div>


            {/* ========================= */}
            {/* EXPLANATION */}
            {/* ========================= */}

            <div className="explanation-area">

              <div className="field">

                <label className="label">
                  Explanation
                </label>

                <textarea
                  name="explanation"
                  className="textarea"
                  value={
                    formData.explanation
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>


            {/* ========================= */}
            {/* SOLUTION */}
            {/* ========================= */}

            <div className="solution-area">

              <div className="field">

                <label className="label">
                  Solution
                </label>

                <textarea
                  name="solution"
                  className="
                    textarea
                    solution-textarea
                  "
                  value={
                    formData.solution
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>


            {/* ========================= */}
            {/* SAVE */}
            {/* ========================= */}

            <div className="save-area">

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >

                {saving
                  ? 'Saving...'
                  : 'Save'}

              </button>

            </div>

          </form>

        </div>

      </div>
    </>
  );
};

export default EditQuestion;