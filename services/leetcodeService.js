const axios = require('axios');

let problemMapCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

async function getProblemIndex() {
  const now = Date.now();
  if (problemMapCache && (now - lastFetchTime < CACHE_DURATION)) {
    return problemMapCache;
  }

  try {
    const response = await axios.get('https://leetcode.com/api/problems/all/');
    const pairs = response.data.stat_status_pairs;

    const index = {
      byNumber: {},
      bySlug: {},
      byTitle: {}
    };

    pairs.forEach(pair => {
      const questionNumber = pair.stat.frontend_question_id;
      const titleSlug = pair.stat.question__title_slug;
      const title = pair.stat.question__title;

      const entry = {
        questionNumber,
        titleSlug,
        title
      };

      index.byNumber[String(questionNumber)] = entry;
      index.bySlug[titleSlug] = entry;
      index.byTitle[title.trim().toLowerCase()] = entry;
    });

    problemMapCache = index;
    lastFetchTime = now;
    return index;
  } catch (error) {
    console.error('Error fetching problem list from LeetCode:', error.message);
    throw new Error('Failed to fetch problem map from LeetCode');
  }
}

// Fetch problem details via LeetCode GraphQL API
async function getProblemDetails(titleSlug) {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        content
      }
    }
  `;

  try {
    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { titleSlug }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.question;
  } catch (error) {
    console.error('Error fetching problem details from LeetCode:', error.message);
    throw new Error('Failed to fetch problem details from LeetCode');
  }
}

module.exports = {
  getProblemIndex,
  getProblemDetails
};
