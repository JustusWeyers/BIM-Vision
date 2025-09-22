import { Issue } from '../types';

export const createIssue = (
  existingIssues: Issue[], 
  elementId: string, 
  title: string, 
  description: string
): Issue => {
  return {
    id: `ISSUE-${existingIssues.length + 1}`,
    elementId,
    title,
    description,
    createdAt: new Date().toISOString(),
  };
};
