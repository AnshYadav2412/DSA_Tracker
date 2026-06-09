import blind75 from '../data/blind-75.json';
import neetcode150 from '../data/neetcode-150.json';
import striverAz from '../data/striver-az.json';
import striverSde from '../data/striver-sde.json';

// Static sheets lookup
const SHEET_DATA = {
  'blind-75': blind75,
  'neetcode-150': neetcode150,
  'striver-az': striverAz,
  'striver-sde': striverSde,
};

// ─── Helpers for localStorage ────────────────────────────────────────────────
const getProgress = () => JSON.parse(localStorage.getItem('dsa_sheet_progress') || '{}');
const saveProgress = (progress) => localStorage.setItem('dsa_sheet_progress', JSON.stringify(progress));

const getPlatformStats = () => JSON.parse(localStorage.getItem('dsa_platform_stats') || '{}');
const savePlatformStats = (stats) => localStorage.setItem('dsa_platform_stats', JSON.stringify(stats));

const getSettings = () => JSON.parse(localStorage.getItem('dsa_settings') || '{"leetcodeUsername":"","codeforcesUsername":""}');
const saveSettings = (settings) => localStorage.setItem('dsa_settings', JSON.stringify(settings));

const getCustomProblems = () => JSON.parse(localStorage.getItem('dsa_custom_problems') || '[]');
const saveCustomProblems = (problems) => localStorage.setItem('dsa_custom_problems', JSON.stringify(problems));

const getCfDates = () => JSON.parse(localStorage.getItem('dsa_cf_solved_dates') || '{}');
const saveCfDates = (dates) => localStorage.setItem('dsa_cf_solved_dates', JSON.stringify(dates));

// ─── Solved slugs set (all known solved LC slugs) ────────────────────────────
const getSolvedSlugs = () => JSON.parse(localStorage.getItem('dsa_lc_solved_slugs') || '[]');
const saveSolvedSlugs = (slugs) => localStorage.setItem('dsa_lc_solved_slugs', JSON.stringify(slugs));

// Store info about the last recent-submission fetch for warning logic
const getLastRecentFetch = () => JSON.parse(localStorage.getItem('dsa_last_recent_fetch') || 'null');
const saveLastRecentFetch = (info) => localStorage.setItem('dsa_last_recent_fetch', JSON.stringify(info));

// ─── Warning helpers ─────────────────────────────────────────────────────────
/**
 * Returns static warning objects readable from localStorage at render time.
 *  - { type: 'no_data' }  — no LeetCode import has ever been done
 */
export const getWarnings = () => {
  const warnings = [];
  const stats = getPlatformStats();
  const lc = stats.leetcode;
  if (!lc || lc.totalSolved === 0) {
    warnings.push({ type: 'no_data' });
  }
  return warnings;
};

// ─── Stats API ───────────────────────────────────────────────────────────────
export const statsApi = {
  getAll: async () => {
    // Returns platform stats
    const stats = getPlatformStats();
    
    // Ensure default structures exist if empty
    if (!stats.leetcode) {
      stats.leetcode = { platform: 'leetcode', totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, ranking: 0, streak: 0 };
    }
    if (!stats.codeforces) {
      stats.codeforces = { platform: 'codeforces', totalSolved: 0, ranking: 0, rating: 0, maxRating: 0 };
    }
    return stats;
  },

  getActivity: async () => {
    const activityMap = {};

    // 1. From sheet progress
    const progress = getProgress();
    for (const val of Object.values(progress)) {
      if (val.completed && val.completedAt) {
        const dateStr = val.completedAt.split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }
    }

    // 2. From custom problems
    const custom = getCustomProblems();
    for (const p of custom) {
      if (p.status === 'Solved' && p.solvedAt) {
        const dateStr = p.solvedAt.split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }
    }

    // 3. From Codeforces synced dates
    const cfDates = getCfDates();
    for (const [dateStr, count] of Object.entries(cfDates)) {
      activityMap[dateStr] = (activityMap[dateStr] || 0) + count;
    }

    const heatmap = Object.entries(activityMap).map(([date, count]) => ({
      date,
      count,
      leetcode: count, // Map to display
      gfg: 0,
      codeforces: 0,
    }));

    const today = new Date();
    const yearAgo = new Date();
    yearAgo.setDate(yearAgo.getDate() - 365);
    const startDate = yearAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return {
      startDate,
      endDate,
      data: heatmap,
      totalDaysActive: heatmap.filter((h) => h.count > 0).length,
    };
  },

  getSheets: async () => {
    const progress = getProgress();
    const sheetsResult = [];

    for (const [sheetName, problems] of Object.entries(SHEET_DATA)) {
      const total = problems.length;
      let completed = 0;
      for (const p of problems) {
        const slug = p.titleSlug?.toLowerCase();
        const key = `${sheetName}:${slug}`;
        if (progress[key]?.completed) {
          completed++;
        }
      }
      sheetsResult.push({
        sheetName,
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }

    return { sheets: sheetsResult };
  },

  getSheet: async (name) => {
    const problems = SHEET_DATA[name];
    if (!problems) throw new Error(`Unknown sheet: ${name}`);

    const progress = getProgress();
    const total = problems.length;
    let completedCount = 0;

    const enrichedProblems = problems.map((p) => {
      const slug = p.titleSlug?.toLowerCase();
      const key = `${name}:${slug}`;
      const entry = progress[key] || {};
      const completed = entry.completed ?? false;
      if (completed) completedCount++;

      return {
        ...p,
        completed,
        completedAt: entry.completedAt ?? null,
        notes: entry.notes ?? '',
        completionSource: entry.completionSource ?? null,
        progressId: key,
      };
    });

    return {
      sheetName: name,
      total,
      completed: completedCount,
      percentage: total > 0 ? Math.round((completedCount / total) * 100) : 0,
      problems: enrichedProblems,
    };
  },

  toggleSheetProblem: async (sheetName, slug) => {
    const progress = getProgress();
    const key = `${sheetName}:${slug.toLowerCase()}`;
    const entry = progress[key] || { completed: false, notes: '' };

    const nextCompleted = !entry.completed;
    const updated = {
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date().toISOString() : null,
      completionSource: 'manual',
      notes: entry.notes ?? '',
    };

    progress[key] = updated;
    saveProgress(progress);

    return {
      sheetName,
      problemSlug: slug,
      ...updated,
    };
  },

  updateSheetNotes: async (sheetName, slug, notes) => {
    const progress = getProgress();
    const key = `${sheetName}:${slug.toLowerCase()}`;
    const entry = progress[key] || { completed: false, notes: '' };

    entry.notes = notes;
    progress[key] = entry;
    saveProgress(progress);

    return {
      sheetName,
      problemSlug: slug,
      ...entry,
    };
  },
};

// ─── Internal: merge slugs into progress + slugs store ───────────────────────
function mergeSolvedSlugs(newSlugs) {
  const existingSlugs = new Set(getSolvedSlugs());
  let addedCount = 0;

  for (const slug of newSlugs) {
    if (!existingSlugs.has(slug)) {
      existingSlugs.add(slug);
      addedCount++;
    }
  }

  saveSolvedSlugs([...existingSlugs]);

  // Also mark sheet progress
  const progress = getProgress();
  let sheetsMatched = 0;

  for (const [sheetName, problems] of Object.entries(SHEET_DATA)) {
    for (const p of problems) {
      const slug = p.titleSlug?.toLowerCase();
      if (existingSlugs.has(slug)) {
        const key = `${sheetName}:${slug}`;
        if (!progress[key]?.completed) {
          progress[key] = {
            completed: true,
            completionSource: 'auto-sync',
            completedAt: new Date().toISOString(),
            notes: progress[key]?.notes || '',
          };
          sheetsMatched++;
        }
      }
    }
  }

  saveProgress(progress);
  return { addedCount, sheetsMatched };
}

// ─── Sync API ────────────────────────────────────────────────────────────────
export const syncApi = {
  getStatus: async () => {
    const stats = getPlatformStats();
    const lastSync = stats.codeforces?.fetchedAt || stats.leetcode?.fetchedAt || null;
    return { lastSyncedAt: lastSync, isSyncing: false };
  },

  syncAll: async () => {
    const settings = getSettings();
    const results = {};

    if (settings.codeforcesUsername) {
      try {
        results.codeforces = await syncApi.syncCodeforces(settings.codeforcesUsername);
      } catch (e) {
        results.codeforcesError = e.message;
      }
    }

    if (settings.leetcodeUsername) {
      try {
        results.leetcode = await syncApi.fetchRecentLeetCode(settings.leetcodeUsername);
      } catch (e) {
        results.leetcodeError = e.message;
      }
    }

    return { status: 'success', ...results };
  },

  fetchRecentLeetCode: async (username) => {
    if (!username) throw new Error('LeetCode username is required');

    // ── Single GraphQL request — gets total solved + last 20 ACs ────────
    // Uses /lc-graphql which Vite proxies to https://leetcode.com/graphql
    // (direct browser → leetcode.com is blocked by CORS; proxy bypasses it)
    const GQL = '/lc-graphql';
    const query = `
      query($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        recentAcSubmissionList(username: $username) {
          id
          title
          titleSlug
          timestamp
        }
      }
    `;

    const res = await fetch(GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`);

    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0]?.message || 'GraphQL error');

    const matchedUser = json.data?.matchedUser;
    if (!matchedUser) throw new Error(`User "${username}" not found on LeetCode`);

    // ── Parse total solved ────────────────────────────────────────────────
    const acNums    = matchedUser.submitStats.acSubmissionNum;
    const apiTotal  = acNums.find((x) => x.difficulty === 'All')?.count ?? 0;
    const easyCount = acNums.find((x) => x.difficulty === 'Easy')?.count ?? 0;
    const medCount  = acNums.find((x) => x.difficulty === 'Medium')?.count ?? 0;
    const hardCount = acNums.find((x) => x.difficulty === 'Hard')?.count ?? 0;

    // ── Compare with stored total ─────────────────────────────────────────
    const storedStats = getPlatformStats();
    const storedTotal = storedStats.leetcode?.totalSolved ?? 0;
    const knownSlugs  = new Set(getSolvedSlugs());

    if (apiTotal <= storedTotal) {
      // Nothing changed — update easy/medium/hard counts but don't touch slugs
      if (storedStats.leetcode) {
        storedStats.leetcode.easySolved   = easyCount;
        storedStats.leetcode.mediumSolved = medCount;
        storedStats.leetcode.hardSolved   = hardCount;
        storedStats.leetcode.fetchedAt    = new Date().toISOString();
        savePlatformStats(storedStats);
      }
      saveLastRecentFetch({ at: new Date().toISOString(), username, status: 'up_to_date' });
      return { username, status: 'up_to_date', apiTotal, storedTotal };
    }

    // ── New solves detected ───────────────────────────────────────────────
    const gap = apiTotal - storedTotal;

    const recentList  = json.data?.recentAcSubmissionList ?? [];
    const recentSlugs = recentList
      .map((s) => (s.titleSlug || '').toLowerCase())
      .filter(Boolean);

    // Only slugs not already in our known set
    const newSlugs = [...new Set(recentSlugs)].filter((s) => !knownSlugs.has(s));

    // Add new slugs + recompute sheet progress
    const { sheetsMatched } = mergeSolvedSlugs(newSlugs);

    // Update platform stats with fresh numbers
    const stats = getPlatformStats();
    const existing = stats.leetcode ?? {};
    stats.leetcode = {
      ...existing,
      platform: 'leetcode',
      totalSolved: apiTotal,
      easySolved: easyCount,
      mediumSolved: medCount,
      hardSolved: hardCount,
      fetchedAt: new Date().toISOString(),
      username,
    };
    savePlatformStats(stats);

    saveLastRecentFetch({
      at: new Date().toISOString(),
      username,
      status: 'updated',
      apiTotal,
      storedTotal,
      gap,
      added: newSlugs.length,
      mayBeMissing: gap > 20,
      missingCount: gap > 20 ? gap - newSlugs.length : 0,
    });

    return {
      username,
      status: 'updated',
      apiTotal,
      storedTotal,
      gap,           // total new solves since last import
      added: newSlugs.length,        // actually added from the recent-20 fetch
      sheetsMatched,
      mayBeMissing: gap > 20,        // true if more new solves than we could fetch
      missingCount: gap > 20 ? gap - newSlugs.length : 0,
      fetchedAt: new Date().toISOString(),
    };
  },

  syncCodeforces: async (username) => {
    if (!username) throw new Error('Codeforces username is required');

    try {
      // Fetch user info
      const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
      const infoData = await infoRes.json();
      if (infoData.status !== 'OK') throw new Error(infoData.comment || 'Codeforces API failed');
      const userInfo = infoData.result[0];

      // Fetch user status
      const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=100`);
      const statusData = await statusRes.json();
      const submissions = statusData.result || [];

      // Deduplicate accepted problems
      const acceptedSlugs = new Set();
      let totalSolved = 0;
      let easySolved = 0;
      let mediumSolved = 0;
      let hardSolved = 0;
      const newCfDates = {};

      const accepted = submissions.filter((s) => s.verdict === 'OK');
      for (const sub of accepted) {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!acceptedSlugs.has(key)) {
          acceptedSlugs.add(key);
          totalSolved++;

          // Difficulty rating map
          const rating = sub.problem.rating ?? 0;
          if (rating <= 1200) easySolved++;
          else if (rating <= 1800) mediumSolved++;
          else hardSolved++;

          // Track date count for heatmap
          if (sub.creationTimeSeconds) {
            const dateStr = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
            newCfDates[dateStr] = (newCfDates[dateStr] || 0) + 1;
          }
        }
      }

      const recentSubmissions = submissions.slice(0, 20).map((s) => ({
        title: s.problem.name,
        titleSlug: `${s.problem.contestId}-${s.problem.index}`.toLowerCase(),
        statusDisplay: s.verdict === 'OK' ? 'Accepted' : s.verdict,
        lang: s.programmingLanguage,
        timestamp: String(s.creationTimeSeconds),
      }));

      // Update stats in localStorage
      const cfStats = {
        platform: 'codeforces',
        fetchedAt: new Date().toISOString(),
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        ranking: userInfo.rank || 'Unrated',
        maxRank: userInfo.maxRank || 'Unrated',
        rating: userInfo.rating || 0,
        maxRating: userInfo.maxRating || 0,
        recentSubmissions,
      };

      const stats = getPlatformStats();
      stats.codeforces = cfStats;
      savePlatformStats(stats);
      saveCfDates(newCfDates);

      return cfStats;
    } catch (err) {
      throw new Error(`Sync error: ${err.message}`);
    }
  },
};

// ─── Settings API ────────────────────────────────────────────────────────────
export const settingsApi = {
  get: async () => {
    return getSettings();
  },

  update: async (data) => {
    const current = getSettings();
    const updated = { ...current, ...data };
    saveSettings(updated);
    return { settings: updated };
  },
};

// ─── Custom Problems API (mocked for frontend stability) ──────────────────────
export const problemsApi = {
  getAll: async (params = {}) => {
    let list = getCustomProblems();
    const {
      search,
      difficulty,
      status,
      platform,
      topic,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = params;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (difficulty) list = list.filter((p) => p.difficulty === difficulty);
    if (status) list = list.filter((p) => p.status === status);
    if (platform) list = list.filter((p) => p.platform === platform);
    if (topic) list = list.filter((p) => p.topic === topic);

    // Sort
    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'createdAt') {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return {
      problems: paginated,
      pagination: { total, totalPages, page, limit },
    };
  },

  create: async (data) => {
    const list = getCustomProblems();
    const newProb = {
      ...data,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      solvedAt: data.status === 'Solved' ? new Date().toISOString() : null,
    };
    list.push(newProb);
    saveCustomProblems(list);
    return newProb;
  },

  update: async (id, data) => {
    const list = getCustomProblems();
    const idx = list.findIndex((p) => p._id === id);
    if (idx === -1) throw new Error('Problem not found');

    const original = list[idx];
    const solvedAt =
      data.status === 'Solved' && original.status !== 'Solved'
        ? new Date().toISOString()
        : data.status !== 'Solved'
        ? null
        : original.solvedAt;

    const updated = {
      ...original,
      ...data,
      solvedAt,
    };
    list[idx] = updated;
    saveCustomProblems(list);
    return updated;
  },

  delete: async (id) => {
    let list = getCustomProblems();
    list = list.filter((p) => p._id !== id);
    saveCustomProblems(list);
    return { success: true };
  },

  toggleFavorite: async (id) => {
    const list = getCustomProblems();
    const idx = list.findIndex((p) => p._id === id);
    if (idx === -1) throw new Error('Problem not found');
    list[idx].isFavorite = !list[idx].isFavorite;
    saveCustomProblems(list);
    return list[idx];
  },

  toggleRevision: async (id) => {
    const list = getCustomProblems();
    const idx = list.findIndex((p) => p._id === id);
    if (idx === -1) throw new Error('Problem not found');
    list[idx].isRevision = !list[idx].isRevision;
    saveCustomProblems(list);
    return list[idx];
  },
};

// ─── Manual import (paste-based) ─────────────────────────────────────────────
const api = {
  post: async (url, body) => {
    if (url === '/manual-import/leetcode-json') {
      const { jsonData } = body;
      if (!jsonData) throw new Error('JSON data is empty');

      let parsed;
      try {
        parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      } catch (e) {
        throw new Error('Invalid JSON format. Please copy full response.');
      }

      const pairs = parsed.stat_status_pairs || [];
      if (!Array.isArray(pairs)) throw new Error('Missing stat_status_pairs in JSON.');

      // ── Extract username from JSON ─────────────────────────────────────────
      const extractedUsername = parsed.user_name || parsed.username || null;
      if (extractedUsername) {
        const settings = getSettings();
        settings.leetcodeUsername = extractedUsername;
        saveSettings(settings);
      }

      let easySolved = 0,
        mediumSolved = 0,
        hardSolved = 0;
      const solvedSlugs = [];

      for (const item of pairs) {
        if (item.status !== 'ac') continue;
        const slug = item.stat?.question__title_slug;
        if (!slug) continue;
        solvedSlugs.push(slug.trim().toLowerCase());
        const level = item.difficulty?.level;
        if (level === 1) easySolved++;
        else if (level === 2) mediumSolved++;
        else if (level === 3) hardSolved++;
      }

      const totalSolved = solvedSlugs.length;
      const uniqueSlugs = [...new Set(solvedSlugs)];

      if (totalSolved === 0) {
        throw new Error('No solved problems found. Please make sure you are logged in to LeetCode.');
      }

      // Save the full solved slugs list (replaces old list — this is the authoritative import)
      saveSolvedSlugs(uniqueSlugs);

      // Mark sheet progress matching solved slugs
      const progress = getProgress();
      let sheetsMatchedCount = 0;

      for (const [sheetName, problems] of Object.entries(SHEET_DATA)) {
        for (const p of problems) {
          const slug = p.titleSlug?.toLowerCase();
          if (uniqueSlugs.includes(slug)) {
            const key = `${sheetName}:${slug}`;
            if (!progress[key] || !progress[key].completed) {
              progress[key] = {
                completed: true,
                completionSource: 'paste-import',
                completedAt: new Date().toISOString(),
                notes: progress[key]?.notes || '',
              };
              sheetsMatchedCount++;
            }
          }
        }
      }

      saveProgress(progress);

      // Update LeetCode platform stats
      const lcStats = {
        platform: 'leetcode',
        fetchedAt: new Date().toISOString(),
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        ranking: 0,
        streak: 0,
        username: extractedUsername,
      };

      const stats = getPlatformStats();
      stats.leetcode = lcStats;
      savePlatformStats(stats);

      return {
        message: 'Import successful',
        total: pairs.length,
        solved: totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        sheetsMatched: sheetsMatchedCount,
        importedAt: new Date().toISOString(),
        username: extractedUsername,
      };
    }

    throw new Error(`Endpoint not found: POST ${url}`);
  },
};

export default api;
