import { z } from 'zod';
import { CONFIG } from '../config.js';

/**
 * Zod Schema for Student / Candidate Data Tool
 */
export const studentToolSchema = {
  id: z.string().optional().describe("Student or candidate ID (e.g., 'CAND-001') to fetch full individual profile details, education, skills, and portfolio links."),
  search: z.string().optional().describe("Keyword search across candidate name, role, skills, college, company, place, and bio."),
  category: z.string().optional().describe("Domain specialization filter, e.g., 'Cyber Security', 'MERN Stack', 'MEAN Stack', 'Angular', 'Data Science & AI', 'Full Stack'."),
  skill: z.string().optional().describe("Specific skill filter, e.g., 'React', 'Python', 'Node.js', 'Docker', 'AWS'."),
  status: z.enum(['Fresher', 'Intern', 'Working Professional']).optional().describe("Candidate career status filter."),
  place: z.string().optional().describe("City or location filter, e.g., 'Bangalore', 'Pune', 'Trivandrum', 'Hyderabad'."),
  minExp: z.number().optional().describe("Minimum years of professional experience."),
  maxExp: z.number().optional().describe("Maximum years of professional experience."),
  getStats: z.boolean().optional().describe("Set to true to retrieve aggregate analytics (total candidates, status breakdown, top 15 skills, locations)."),
  page: z.number().int().min(1).default(1).optional().describe("Page number for paginated results (default: 1)."),
  limit: z.number().int().min(1).max(100).default(10).optional().describe("Number of candidate records per page (default: 10).")
};

/**
 * Handler function to fetch student/candidate data from Candidate Microservice
 */
export async function handleStudentData(args) {
  const {
    id,
    search,
    category,
    skill,
    status,
    place,
    minExp,
    maxExp,
    getStats,
    page = 1,
    limit = 10
  } = args;

  const baseUrl = CONFIG.CANDIDATE_SERVICE_URL;

  try {
    // 1. Fetch statistics overview
    if (getStats) {
      const targetUrl = `${baseUrl}/api/candidates/stats/overview`;
      const response = await fetchWithTimeout(targetUrl);
      const data = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              source: 'Candidate-Service',
              endpoint: '/api/candidates/stats/overview',
              data
            }, null, 2)
          }
        ]
      };
    }

    // 2. Fetch specific candidate by ID
    if (id) {
      const targetUrl = `${baseUrl}/api/candidates/${encodeURIComponent(id.trim())}`;
      const response = await fetchWithTimeout(targetUrl);
      
      if (response.status === 404) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                source: 'Candidate-Service',
                error: `Candidate with ID '${id}' not found. Please verify the ID format (e.g. CAND-001).`
              }, null, 2)
            }
          ],
          isError: true
        };
      }

      const data = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              source: 'Candidate-Service',
              endpoint: `/api/candidates/${id}`,
              candidate: data.data || data
            }, null, 2)
          }
        ]
      };
    }

    // 3. Search and filter candidates
    const url = new URL(`${baseUrl}/api/candidates`);
    if (search) url.searchParams.set('search', search);
    if (category) url.searchParams.set('category', category);
    if (skill) url.searchParams.set('skill', skill);
    if (status) url.searchParams.set('status', status);
    if (place) url.searchParams.set('place', place);
    if (minExp !== undefined) url.searchParams.set('minExp', minExp.toString());
    if (maxExp !== undefined) url.searchParams.set('maxExp', maxExp.toString());
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

    const response = await fetchWithTimeout(url.toString());
    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            source: 'Candidate-Service',
            endpoint: '/api/candidates',
            query: { search, category, skill, status, place, minExp, maxExp, page, limit },
            pagination: {
              page: data.page,
              limit: data.limit,
              totalPages: data.totalPages,
              totalCandidates: data.totalCandidates
            },
            candidates: data.data || []
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            source: 'Candidate-Service',
            error: `Failed to connect to Candidate Service at ${baseUrl}: ${error.message}`,
            hint: 'Ensure candidate-service is running on port 5001 (e.g., node candidate-service/server.js).'
          }, null, 2)
        }
      ],
      isError: true
    };
  }
}

/**
 * Helper to fetch with timeout
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export const studentTool = {
  name: 'get_student_data',
  description: 'Retrieve student and candidate data from the Candidate Microservice (Port 5001). Retrieve single candidate profiles by ID, search by skills/name/college, filter by career status (Fresher, Intern, Working Professional), domain category, experience, or query aggregate talent metrics.',
  schema: studentToolSchema,
  handler: handleStudentData
};
