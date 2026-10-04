import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

import AddQuestions from './components/AddQuestions';
import Login from './components/Login';
import ViewQuestions from './components/ViewQuestions';
import QuestionWebView from './components/QuestionWebView';
import EditQuestion from './components/EditQuestion';


const App = () => {
  return (
    <Router>
      <div className='App'>
        <Routes>
          {/* Default Route */}
          <Route
            path='/'
            element={<Navigate to='/login' replace />}
          />

          {/* Create Question */}
          <Route
            path='/create-question/:colorCode/:entranceExamId/:entranceExamName/:userId'
            element={<AddQuestions />}
          />

          {/* Login */}
          <Route
            path='/login'
            element={<Login />}
          />

        <Route
          path="/edit-question/:questionId"
          element={<EditQuestion />}
        />

          {/* Question List */}
          <Route
            path='/question-list/:colorCode/:entranceExamId/:entranceExamName/:userId'
            element={<ViewQuestions />}
          />

          {/* View Single Question */}
          <Route
            path='/view-question'
            element={<QuestionWebView />}
          />

          {/* Invalid Route */}
          <Route
            path='*'
            element={<Navigate to='/login' replace />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
