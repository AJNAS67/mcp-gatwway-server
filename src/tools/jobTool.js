import { z } from 'zod';
import { CONFIG } from '../config.js';

/**
 * Zod Schema for Job List / Vacancies Tool
 */
export const jobToolSchema = {
  id: z.string().optional().describe("Job vacancy ID (e.g., 'JOB-001') to fetch full job specification, responsibilities, requirements, and HR contact info."),
  search: z.string().optional().describe("Free-text search query across job title, company name, skills required, description, and location."),
  category: z.string().optional().describe("Job category filter, e.g., 'Cyber Security', 'MERN Stack', 'MEAN Stack', 'Angular', 'Data Science & AI', 'Full Stack'."),
  skill: z.string().optional().describe("Required tech skill filter, e.g., 'Python', 'React', 'Docker', 'AWS', 'Node.js'."),
  jobType: z.enum(['Full-time', 'Remote', 'Hybrid', 'Contract', 'Internship']).optional().describe("Employment arrangement type."),
  location: z.string().optional().describe("Work location / city filter, e.g., 'Bangalore', 'Pune', 'Remote', 'Hyderabad', 'Delhi'."),
  experience: z.string().optional().describe("Required experience level filter, e.g. '0 - 1 years', '1 - 3 years', '2 - 5 years'."),
  getStats: z.boolean().optional().describe("Set to true to fetch job market summary metrics (total openings, vacancies count, category distribution, top skills)."),
  page: z.number().int().min(1).default(1).optional().describe("Page number for paginated list (default: 1)."),
  limit: z.number().int().min(1).max(100).default(10).optional().describe("Number of job postings per page (default: 10).")
};

/**
 * Handler function to fetch job vacancy data from Job Microservice
 */
export async function handleJobList(args) {
  const {
    id,
    search,
    category,
    skill,
    jobType,
    location,
    experience,
    getStats,
    page = 1,
    limit = 10
  } = args;

  const baseUrl = CONFIG.JOB_SERVICE_URL;

  try {
    // 1. Fetch job market analytics / overview stats
    if (getStats) {
      const targetUrl = `${baseUrl}/api/jobs/stats/overview`;
      const response = await fetchWithTimeout(targetUrl);
      const data = await response.json();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              source: 'Job-Service',
              endpoint: '/api/jobs/stats/overview',
              data
            }, null, 2)
          }
        ]
      };
    }

    // 2. Fetch single job posting by ID
    if (id) {
      const targetUrl = `${baseUrl}/api/jobs/${encodeURIComponent(id.trim())}`;
      const response = await fetchWithTimeout(targetUrl);

      if (response.status === 404) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                source: 'Job-Service',
                error: `Job vacancy with ID '${id}' not found. Please verify the ID format (e.g. JOB-001).`
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
              source: 'Job-Service',
              endpoint: `/api/jobs/${id}`,
              job: data.data || data
            }, null, 2)
          }
        ]
      };
    }

    // 3. Search and filter job listings
    const url = new URL(`${baseUrl}/api/jobs`);
    if (search) url.searchParams.set('search', search);
    if (category) url.searchParams.set('category', category);
    if (skill) url.searchParams.set('skill', skill);
    if (jobType) url.searchParams.set('jobType', jobType);
    if (location) url.searchParams.set('location', location);
    if (experience) url.searchParams.set('experience', experience);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

    const response = await fetchWithTimeout(url.toString());
    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            source: 'Job-Service',
            endpoint: '/api/jobs',
            query: { search, category, skill, jobType, location, experience, page, limit },
            pagination: {
              page: data.page,
              limit: data.limit,
              totalPages: data.totalPages,
              totalJobs: data.totalJobs
            },
            jobs: data.data || []
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
            source: 'Job-Service',
            error: `Failed to connect to Job Service at ${baseUrl}: ${error.message}`,
            hint: 'Ensure job-service is running on port 5002 (e.g., node job-service/server.js).'
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

export const jobTool = {
  name: 'get_job_list',
  description: 'Retrieve job listings and vacancy details from the Job Microservice (Port 5002). Look up specific job IDs (e.g., JOB-001) for detailed job descriptions, responsibilities, requirements, and HR contacts, search by keywords, filter by category/skills/location/job type, or query market overview stats.',
  schema: jobToolSchema,
  handler: handleJobList
};
