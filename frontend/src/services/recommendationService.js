import api from './api';

export const recommendationService = {
  /**
   * Generate architectural action plan, tech debt hours, and CI/CD quality gate YAML.
   */
  async generateActionPlan(payload) {
    const response = await api.post('/recommendations/action-plan', payload);
    return response.data;
  },

  /**
   * Generate 4-Quadrant Developer Decision Matrix (Quick Wins, Strategic Refactors, Hygiene, Monitor).
   */
  async generateDecisionMatrix(payload) {
    const response = await api.post('/recommendations/decision-matrix', payload);
    return response.data;
  },

  /**
   * Evaluate a single module with before/after code diffs and unit test templates.
   */
  async evaluateSingleModule(moduleData) {
    const response = await api.post('/recommendations/evaluate-module', moduleData);
    return response.data;
  },

  /**
   * Generate parameterized Pytest / Jest test suite for critical hotspots.
   */
  async generateTestSuite(payload) {
    const response = await api.post('/recommendations/test-suite', payload);
    return response.data;
  },
};

export default recommendationService;
