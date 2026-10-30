import React from 'react';
import { Route, Routes } from 'react-router-dom';

import TrainerLayout from './pages/trainer/components/TrainerLayout';
import DashboardPage from './pages/trainer/pages/DashboardPage';
import LearnPage from './pages/trainer/pages/LearnPage';
import QuizPage from './pages/trainer/pages/QuizPage';
import BoothPage from './pages/trainer/pages/BoothPage';
import JournalPage from './pages/trainer/pages/JournalPage';
import AuthPage from './auth/AuthPage';
import { AuthGuard } from './auth/AuthGuard';
import NotFound from './pages/NotFound/NotFound';

import './pages/trainer/trainer.css';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        element={
          <AuthGuard>
            <TrainerLayout />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="learn/:chapterId?" element={<LearnPage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="mistake-quiz" element={<QuizPage />} />
        <Route path="booth" element={<BoothPage />} />
        <Route path="booth/:topicIndex" element={<BoothPage />} />
        <Route path="journal/:tab?" element={<JournalPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
