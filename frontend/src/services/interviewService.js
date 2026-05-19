import api from './api';

export const interviewService = {
  start: (category) => api.post('/interview/start', { category }),
  sendMessage: (interviewId, message, endInterview = false) =>
    api.post('/interview/message', { interviewId, message, endInterview }),
  getHistory: (page = 1, limit = 10) =>
    api.get(`/interview/history?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/interview/${id}`),
  abandon: (id) => api.put(`/interview/${id}/abandon`),
};
