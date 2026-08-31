/**
 * cv-reviewer.js
 * Rule-based CV scoring engine for the QA Engineer portfolio site.
 * Scores a CV across 6 dimensions and renders results to the DOM.
 */

'use strict';

// ─── Constants ───────────────────────────────────────────────────────────────

const CIRCUMFERENCE = 2 * Math.PI * 66; // matches SVG r="66"

const DIMENSIONS = [
  { id: 'contact',    label: 'Contact Info',        weight: 15, icon: '📇' },
  { id: 'summary',    label: 'Summary / Objective', weight: 15, icon: '📝' },
  { id: 'experience', label: 'Work Experience',      weight: 30, icon: '💼' },
  { id: 'skills',     label: 'Skills',               weight: 20, icon: '🛠️'  },
  { id: 'education',  label: 'Education',            weight: 10, icon: '🎓' },
  { id: 'format',     label: 'Formatting & Length',  weight: 10, icon: '📐' },
];

const STRONG_ACTION_VERBS = [
  'led','managed','built','created','developed','designed','implemented','delivered',
  'improved','optimized','reduced','increased','automated','analyzed','owned',
  'collaborated','executed','coordinated','facilitated','streamlined','achieved',
  'launched','deployed','maintained','mentored','identified','resolved','reported',
  'performed','produced','served','ensured','supported','reviewed','tested',
];

const QA_KEYWORDS = [
  'selenium','appium','postman','katalon','jira','jenkins','git','sql','python',
  'java','javascript','typescript','go','golang','cypress','playwright',
  'test case','test plan','regression','smoke','sanity','exploratory',
  'api testing','mobile testing','web testing','automation','manual',
  'bug','defect','qa','quality assurance','agile','scrum','sprint',
];

const FILLER_WORDS = [
  'very','really','basically','actually','literally','stuff','things','etc',
  'hard-working','team player','go-getter','detail-oriented','dynamic','synergy',
];

// ─── Demo CV ─────────────────────────────────────────────────────────────────

const DEMO_CV = `Dwi Fajar Dandy Saputra
QA Engineer | dfdandys@gmail.com | +62-812-0000-0000 | linkedin.com/in/dfdandys

PROFESSIONAL SUMMARY
Highly analytical and detail-oriented QA Engineer with 4+ years of experience in logistics and banking industries. Proven expertise in designing, executing, and maintaining test cases for web, mobile, and API applications. Skilled in both manual and automation testing using Selenium, Appium, and Katalon. Passionate about delivering high-quality software through rigorous testing methodologies.

WORK EXPERIENCE

QA Engineer — GTL (Acq. Bytedance) | 2023 – Present
• Performed thorough manual exploratory testing on new features, identifying 30+ critical defects prior to formal testing phases.
• Automated 45% of regression test suite, reducing manual effort by 60% and increasing test coverage.
• Owned end-to-end test planning and execution for releases across SEA, UK, and US markets.
• Collaborated with cross-functional teams (Product, Dev, Design) to clarify PRD requirements.
• Reported testing progress, risk areas, and release readiness to stakeholders via weekly dashboards.

IT Automation Engineer — Bank Central Asia Tbk | 2020 – 2023
• Analyzed test scenarios from testing analysts and developed 200+ corresponding Selenium automation scripts.
• Produced detailed test execution reports to support defect tracking and issue resolution.
• Served as Group Leader, coordinating a team of 5 and ensuring 100% on-time delivery.
• Maintained automation framework, reducing test execution time by 40%.

SKILLS
Technical: Java, Python, Go, SQL, Selenium, Appium, Katalon, Postman, JMeter, Jenkins, Git, JIRA
Testing: Manual Testing, Automation Testing, API Testing, Mobile Testing, Regression Testing, Smoke Testing
Soft Skills: Team Leadership, Communication, Time Management, Analytical Thinking

EDUCATION
Bachelor of Computer Science — Binus University | 2016 – 2020
GPA: 3.72 / 4.00

CERTIFICATIONS
• ISTQB Foundation Level (2021)
• Katalon Studio Professional (2022)
`;

// ─── Scoring Engine ───────────────────────────────────────────────────────────

/**
 * Score the "Contact Info" dimension.
 */
function scoreContact(text) {
  const lower = text.toLowerCase();
  const checks = [];
  const feedback = [];
  const strengths = [];

  const hasEmail = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(text);
  const hasLinkedIn = /linkedin\.com\/in\//i.test(text);
  const hasName = text.trim().split('\n')[0].split(' ').length >= 2;
  const hasGitHub = /github\.com\//i.test(text);
  const hasLocation = /(city|jakarta|bandung|surabaya|indonesia|\bID\b|location)/i.test(text);

  if (hasEmail) { checks.push(20); strengths.push('Email address is present'); }
  else { checks.push(0); feedback.push('Add your email address — it\'s essential for recruiters to contact you.'); }

  if (hasPhone) { checks.push(20); strengths.push('Phone number found'); }
  else { checks.push(0); feedback.push('Include a phone number or WhatsApp contact.'); }

  if (hasLinkedIn) { checks.push(25); strengths.push('LinkedIn profile linked'); }
  else { checks.push(0); feedback.push('Add your LinkedIn profile URL (e.g. linkedin.com/in/yourname).'); }

  if (hasName) { checks.push(25); strengths.push('Full name clearly visible at the top'); }
  else { checks.push(10); feedback.push('Make sure your full name appears on the very first line.'); }

  if (hasGitHub) { checks.push(10); strengths.push('GitHub profile linked — great for tech roles'); }
  else { feedback.push('Consider adding a GitHub profile link to showcase your technical work.'); }

  const score = Math.min(100, checks.reduce((a, b) => a + b, 0));
  return { score, feedback, strengths };
}

/**
 * Score the "Summary / Objective" dimension.
 */
function scoreSummary(text) {
  const feedback = [];
  const strengths = [];
  let score = 0;

  const summaryMatch = text.match(/(summary|objective|profile|about me)([\s\S]{0,600}?)(?=\n[A-Z]{3,}|\n\n[A-Z]|$)/i);

  if (!summaryMatch) {
    feedback.push('Add a Professional Summary section near the top of your CV.');
    feedback.push('A 2–4 sentence summary highlighting your experience, key skills, and career goal is essential.');
    return { score: 10, feedback, strengths };
  }

  score += 30;
  strengths.push('Professional summary section found');

  const summaryText = summaryMatch[2] || '';
  const wordCount = summaryText.trim().split(/\s+/).length;

  if (wordCount >= 30 && wordCount <= 120) {
    score += 25;
    strengths.push('Summary is a well-sized paragraph (30–120 words)');
  } else if (wordCount < 30) {
    score += 5;
    feedback.push('Your summary is very short. Expand it to 40–80 words to give recruiters a fuller picture.');
  } else {
    score += 10;
    feedback.push('Your summary is quite long. Trim it to 40–80 words for maximum impact.');
  }

  const hasYearsExp = /\d+\+?\s*years?\s*(of\s*)?(experience|exp)/i.test(summaryText);
  if (hasYearsExp) { score += 20; strengths.push('Years of experience mentioned in summary'); }
  else { feedback.push('Mention your years of experience in the summary (e.g. "5+ years of experience in…").'); }

  const actionVerbInSummary = STRONG_ACTION_VERBS.some(v => new RegExp(`\\b${v}`, 'i').test(summaryText));
  if (actionVerbInSummary) { score += 15; strengths.push('Action-oriented language used in summary'); }
  else { feedback.push('Start summary sentences with strong action verbs (e.g. "Delivered", "Led", "Built").'); }

  const hasSpeciality = /qa|quality|test|automation|engineer|developer/i.test(summaryText);
  if (hasSpeciality) { score += 10; strengths.push('Clear professional identity stated in summary'); }

  return { score: Math.min(100, score), feedback, strengths };
}

/**
 * Score the "Work Experience" dimension.
 */
function scoreExperience(text) {
  const feedback = [];
  const strengths = [];
  let score = 0;

  const expMatch = text.match(/(work experience|experience|employment|career)([\s\S]{0,2000}?)(?=\nskills|\neducation|\ncertif|\n[A-Z]{4,}\n|$)/i);

  if (!expMatch) {
    feedback.push('Add a Work Experience section with your job history.');
    return { score: 5, feedback, strengths };
  }

  score += 20;
  strengths.push('Work experience section present');

  const expText = expMatch[2] || '';
  const bulletCount = (expText.match(/^[\s]*[•\-\*▸▪]/gm) || []).length;

  if (bulletCount >= 5) {
    score += 20;
    strengths.push(`${bulletCount} bullet points found — good level of detail`);
  } else if (bulletCount >= 2) {
    score += 10;
    feedback.push('Use at least 4–6 bullet points per role to describe your responsibilities and achievements.');
  } else {
    feedback.push('Add bullet points to describe your responsibilities. Use the format "Verb + Task + Result".');
  }

  // Check for metrics/numbers
  const metricsCount = (expText.match(/\d+[\s]*(%|percent|x times?|hrs?|hours?|days?|weeks?|\$|users?|tests?|bugs?|defects?|scripts?)/gi) || []).length;
  if (metricsCount >= 3) {
    score += 25;
    strengths.push(`${metricsCount} quantified achievements found — excellent!`);
  } else if (metricsCount >= 1) {
    score += 10;
    strengths.push('Some metrics/numbers present');
    feedback.push('Add more numbers to quantify achievements (e.g. "Reduced test time by 40%", "Automated 200+ test cases").');
  } else {
    feedback.push('Quantify your achievements with numbers and metrics — they make a strong impression on recruiters.');
  }

  // Check for action verbs
  const verbHits = STRONG_ACTION_VERBS.filter(v => new RegExp(`\\b${v}`, 'i').test(expText));
  if (verbHits.length >= 5) {
    score += 20;
    strengths.push('Strong action verbs used throughout experience section');
  } else if (verbHits.length >= 2) {
    score += 10;
    feedback.push(`Use stronger action verbs to start each bullet (e.g. Delivered, Led, Automated, Reduced).`);
  } else {
    feedback.push('Begin each bullet with a strong action verb (e.g. "Built", "Managed", "Optimized").');
  }

  // Check for job titles / dates
  const hasDates = /20\d{2}\s*[\–\-–—]\s*(20\d{2}|present|current)/i.test(expText);
  if (hasDates) {
    score += 15;
    strengths.push('Employment dates clearly specified');
  } else {
    feedback.push('Include employment dates for each role (e.g. "Jan 2021 – Dec 2023" or "2021 – Present").');
  }

  return { score: Math.min(100, score), feedback, strengths };
}

/**
 * Score the "Skills" dimension.
 */
function scoreSkills(text) {
  const feedback = [];
  const strengths = [];
  let score = 0;

  const skillsMatch = text.match(/(skills?|technical|technologies?)([\s\S]{0,600}?)(?=\n[A-Z]{3,}\n|\neducation|\nexperience|$)/i);

  if (!skillsMatch) {
    feedback.push('Add a dedicated Skills section listing your technical and soft skills.');
    return { score: 10, feedback, strengths };
  }

  score += 25;
  strengths.push('Skills section found');

  const skillsText = (skillsMatch[2] || '').toLowerCase();
  const matchedKeywords = QA_KEYWORDS.filter(kw => skillsText.includes(kw));

  if (matchedKeywords.length >= 8) {
    score += 40;
    strengths.push(`${matchedKeywords.length} relevant QA/tech skills listed — comprehensive`);
  } else if (matchedKeywords.length >= 4) {
    score += 25;
    strengths.push(`${matchedKeywords.length} relevant QA keywords found`);
    feedback.push('Add more specific tools and technologies (e.g. Selenium, Postman, JIRA, Git).');
  } else {
    score += 10;
    feedback.push('Your skills section needs more relevant keywords. Include tools, languages, and testing methodologies.');
  }

  // Soft skills
  const hasSoftSkills = /(communication|leadership|teamwork|analytical|problem.solving|management)/i.test(skillsText);
  if (hasSoftSkills) {
    score += 15;
    strengths.push('Soft skills included');
  } else {
    feedback.push('Add a few soft skills (e.g. Communication, Leadership, Analytical Thinking) alongside technical ones.');
  }

  // Categorized
  const isCategorized = /(technical|soft\s*skills|tools?|languages?|frameworks?)/i.test(skillsMatch[0]);
  if (isCategorized) {
    score += 20;
    strengths.push('Skills are organized into clear categories');
  } else {
    feedback.push('Organize your skills into categories (e.g. "Technical Skills", "Tools", "Soft Skills") for easier scanning.');
  }

  return { score: Math.min(100, score), feedback, strengths };
}

/**
 * Score the "Education" dimension.
 */
function scoreEducation(text) {
  const feedback = [];
  const strengths = [];
  let score = 0;

  const eduMatch = text.match(/(education|academic|university|college|degree)([\s\S]{0,500}?)(?=\n[A-Z]{3,}\n|$)/i);

  if (!eduMatch) {
    feedback.push('Add an Education section with your degree, institution, and graduation year.');
    return { score: 10, feedback, strengths };
  }

  score += 30;
  strengths.push('Education section present');

  const eduText = eduMatch[2] || '';

  const hasDegree = /(bachelor|master|phd|diploma|associate|s1|s2|s3|sarjana)/i.test(eduText);
  if (hasDegree) { score += 25; strengths.push('Degree level mentioned'); }
  else { feedback.push('Specify your degree level (e.g. "Bachelor of Computer Science").'); }

  const hasInstitution = /(university|institute|college|school|universitas|politeknik)/i.test(eduText);
  if (hasInstitution) { score += 25; strengths.push('Educational institution mentioned'); }
  else { feedback.push('Include the name of your university or educational institution.'); }

  const hasEduYear = /20\d{2}/.test(eduText);
  if (hasEduYear) { score += 10; strengths.push('Graduation year present'); }
  else { feedback.push('Add your graduation year.'); }

  const hasGpa = /(gpa|ipk|grade)/i.test(eduText);
  if (hasGpa) { score += 10; strengths.push('GPA / grade included'); }
  else { feedback.push('If your GPA is 3.5+ consider including it — it signals academic excellence.'); }

  return { score: Math.min(100, score), feedback, strengths };
}

/**
 * Score the "Formatting & Length" dimension.
 */
function scoreFormat(text) {
  const feedback = [];
  const strengths = [];
  let score = 0;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = text.trim().split('\n').length;

  if (wordCount >= 200 && wordCount <= 800) {
    score += 25;
    strengths.push(`Word count (${wordCount}) is in the ideal range (200–800)`);
  } else if (wordCount < 200) {
    score += 5;
    feedback.push('Your CV is too short. Aim for 300–700 words with detailed descriptions of your experience.');
  } else {
    score += 10;
    feedback.push(`Your CV may be too long (${wordCount} words). Trim to 1–2 pages / ~400–700 words.`);
  }

  // Section headers (uppercase or title-case lines)
  const headers = text.match(/^[A-Z][A-Z\s&\/]{3,}$/gm) || [];
  if (headers.length >= 4) {
    score += 25;
    strengths.push(`${headers.length} clear section headers detected`);
  } else {
    score += 5;
    feedback.push('Use clear, ALL-CAPS section headers (e.g. WORK EXPERIENCE, SKILLS, EDUCATION) to improve scannability.');
  }

  // Filler word check
  const fillerHits = FILLER_WORDS.filter(f => new RegExp(`\\b${f}\\b`, 'i').test(text));
  if (fillerHits.length === 0) {
    score += 25;
    strengths.push('No generic filler words detected — language is specific and professional');
  } else if (fillerHits.length <= 2) {
    score += 15;
    feedback.push(`Minimize filler words like "${fillerHits.join('", "')}" — they weaken your CV's impact.`);
  } else {
    score += 0;
    feedback.push(`Found several filler words (${fillerHits.slice(0, 3).join(', ')}…). Replace them with specific achievements.`);
  }

  // Certifications bonus
  const hasCerts = /(certif|certificate|certified|istqb|aws|google|microsoft|pmp)/i.test(text);
  if (hasCerts) {
    score += 15;
    strengths.push('Certifications section found — great for standing out');
  } else {
    feedback.push('Consider adding a Certifications section. Industry certs (e.g. ISTQB, AWS) boost credibility.');
  }

  // Contact at top
  const firstLines = text.split('\n').slice(0, 5).join(' ');
  const contactAtTop = /[a-zA-Z0-9+]+@[a-zA-Z]+\.[a-z]+/.test(firstLines) || /linkedin/i.test(firstLines);
  if (contactAtTop) {
    score += 10;
    strengths.push('Contact details positioned at the top');
  } else {
    feedback.push('Place your contact information (email, LinkedIn) near the very top of the CV.');
  }

  return { score: Math.min(100, score), feedback, strengths };
}

// ─── Main Analyzer ────────────────────────────────────────────────────────────

function analyzeCV(text) {
  const scorers = {
    contact:    scoreContact(text),
    summary:    scoreSummary(text),
    experience: scoreExperience(text),
    skills:     scoreSkills(text),
    education:  scoreEducation(text),
    format:     scoreFormat(text),
  };

  // Weighted overall score
  let overall = 0;
  DIMENSIONS.forEach(dim => {
    overall += scorers[dim.id].score * (dim.weight / 100);
  });
  overall = Math.round(overall);

  // Aggregate strengths & issues
  const allStrengths = [];
  const allIssues = [];
  DIMENSIONS.forEach(dim => {
    scorers[dim.id].strengths.forEach(s => allStrengths.push({ label: dim.label, text: s }));
    scorers[dim.id].feedback.forEach(f => allIssues.push({ label: dim.label, text: f }));
  });

  return { overall, scorers, allStrengths, allIssues };
}

function getGrade(score) {
  if (score >= 90) return { letter: 'A+', color: 'var(--teal)' };
  if (score >= 80) return { letter: 'A',  color: 'var(--teal)' };
  if (score >= 70) return { letter: 'B+', color: '#22c55e' };
  if (score >= 60) return { letter: 'B',  color: '#84cc16' };
  if (score >= 50) return { letter: 'C',  color: '#eab308' };
  if (score >= 40) return { letter: 'D',  color: '#f97316' };
  return                   { letter: 'F',  color: 'var(--coral)' };
}

function getDimColor(score) {
  if (score >= 70) return 'good';
  if (score >= 45) return 'warn';
  return 'poor';
}

function getDimIcon(score) {
  if (score >= 70) return '✅';
  if (score >= 45) return '⚠️';
  return '❌';
}

function getOverallSummary(score) {
  if (score >= 85) return 'Excellent! Your CV is well-structured and covers all the key areas recruiters look for. Minor polish could take it to the next level.';
  if (score >= 70) return 'Good CV! It covers most important areas. A few targeted improvements could make it stand out significantly.';
  if (score >= 55) return 'Decent foundation, but there are clear gaps. Focus on the areas marked ⚠️ and ❌ below.';
  if (score >= 40) return 'Your CV needs significant work. Use the feedback below to address the most critical missing sections.';
  return 'Your CV is missing essential information. Start with contact details, a summary, and detailed work experience.';
}

// ─── DOM Rendering ────────────────────────────────────────────────────────────

function renderResults(result) {
  const { overall, scorers, allStrengths, allIssues } = result;
  const grade = getGrade(overall);

  // Animate score gauge
  const gaugeFill = document.getElementById('gauge-fill');
  const scoreVal  = document.getElementById('overall-score-val');
  const gradeEl   = document.getElementById('overall-grade');

  gaugeFill.style.stroke = grade.color;
  gradeEl.style.color = grade.color;

  // Animated counter
  let current = 0;
  const step = Math.ceil(overall / 60);
  const counter = setInterval(() => {
    current = Math.min(current + step, overall);
    scoreVal.textContent = current;
    const progress = (current / 100) * CIRCUMFERENCE;
    gaugeFill.style.strokeDashoffset = CIRCUMFERENCE - progress;
    if (current >= overall) clearInterval(counter);
  }, 16);

  gradeEl.textContent = grade.letter;

  // Overall summary
  document.getElementById('overall-summary').innerHTML = `
    <p class="cvr-summary-text">${getOverallSummary(overall)}</p>
  `;

  // Dimension cards
  const grid = document.getElementById('dimension-grid');
  grid.innerHTML = '';
  DIMENSIONS.forEach((dim, i) => {
    const data  = scorers[dim.id];
    const state = getDimColor(data.score);
    const icon  = getDimIcon(data.score);
    const card  = document.createElement('div');
    card.className = `cvr-dim-card cvr-dim-card--${state} reveal-card`;
    card.style.animationDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="cvr-dim-header">
        <span class="cvr-dim-icon">${dim.icon}</span>
        <span class="cvr-dim-label">${dim.label}</span>
        <span class="cvr-dim-status">${icon}</span>
      </div>
      <div class="cvr-dim-score-row">
        <span class="cvr-dim-score-val">${data.score}</span>
        <span class="cvr-dim-score-max">/ 100</span>
      </div>
      <div class="cvr-dim-bar-track">
        <div class="cvr-dim-bar-fill cvr-dim-bar--${state}" style="width:0%" data-target="${data.score}%"></div>
      </div>
      <div class="cvr-dim-weight">Weight: ${dim.weight}%</div>
    `;
    grid.appendChild(card);
  });

  // Animate bars after paint
  requestAnimationFrame(() => {
    document.querySelectorAll('.cvr-dim-bar-fill').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.target; }, 200);
    });
  });

  // Strengths
  const strengthsList = document.getElementById('strengths-list');
  strengthsList.innerHTML = allStrengths.length
    ? allStrengths.map(s => `<li class="cvr-feedback-item"><span class="cvr-item-tag">${s.label}</span>${s.text}</li>`).join('')
    : '<li class="cvr-feedback-item cvr-feedback-empty">No notable strengths detected yet. Add more content to your CV.</li>';

  // Issues
  const issuesList = document.getElementById('issues-list');
  issuesList.innerHTML = allIssues.length
    ? allIssues.map(i => `<li class="cvr-feedback-item"><span class="cvr-item-tag cvr-item-tag--issue">${i.label}</span>${i.text}</li>`).join('')
    : '<li class="cvr-feedback-item">🎉 No major issues found. Your CV looks great!';

  // Show results section
  const resultsSection = document.getElementById('results-section');
  resultsSection.classList.remove('cvr-hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Copy Feedback ────────────────────────────────────────────────────────────

function buildFeedbackText(result) {
  const { overall, scorers, allStrengths, allIssues } = result;
  const grade = getGrade(overall);
  let out = `CV REVIEW REPORT\n${'═'.repeat(40)}\n`;
  out += `Overall Score: ${overall}/100 (${grade.letter})\n\n`;
  out += `DIMENSION SCORES\n${'-'.repeat(40)}\n`;
  DIMENSIONS.forEach(dim => {
    out += `${dim.label.padEnd(24)} ${scorers[dim.id].score}/100\n`;
  });
  out += `\nSTRENGTHS\n${'-'.repeat(40)}\n`;
  allStrengths.forEach(s => { out += `✅ [${s.label}] ${s.text}\n`; });
  out += `\nAREAS TO IMPROVE\n${'-'.repeat(40)}\n`;
  allIssues.forEach(i => { out += `🔧 [${i.label}] ${i.text}\n`; });
  out += `\nGenerated by CV Reviewer — ${window.location.origin}/cv-reviewer.html`;
  return out;
}

// ─── Event Wiring ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const tabPaste    = document.getElementById('tab-paste');
  const tabUpload   = document.getElementById('tab-upload');
  const panelPaste  = document.getElementById('panel-paste');
  const panelUpload = document.getElementById('panel-upload');
  const textarea    = document.getElementById('cv-text-input');
  const charCount   = document.getElementById('char-count');
  const charHint    = document.getElementById('char-hint');
  const dropZone    = document.getElementById('drop-zone');
  const fileInput   = document.getElementById('file-input');
  const fileInfo    = document.getElementById('file-info');
  const fileName    = document.getElementById('file-name');
  const fileRemove  = document.getElementById('file-remove');
  const btnDemo     = document.getElementById('btn-demo');
  const btnAnalyze  = document.getElementById('btn-analyze');
  const inputError  = document.getElementById('input-error');
  const btnCopy     = document.getElementById('btn-copy');
  const btnPrint    = document.getElementById('btn-print');
  const btnReanalyze = document.getElementById('btn-reanalyze');

  let currentMode = 'paste';
  let uploadedText = '';
  let lastResult   = null;

  // ── Tabs ──────────────────────────────────────────────────────────────────
  function switchTab(mode) {
    currentMode = mode;
    if (mode === 'paste') {
      tabPaste.classList.add('cvr-tab--active');
      tabPaste.setAttribute('aria-selected', 'true');
      tabUpload.classList.remove('cvr-tab--active');
      tabUpload.setAttribute('aria-selected', 'false');
      panelPaste.classList.remove('cvr-panel--hidden');
      panelUpload.classList.add('cvr-panel--hidden');
    } else {
      tabUpload.classList.add('cvr-tab--active');
      tabUpload.setAttribute('aria-selected', 'true');
      tabPaste.classList.remove('cvr-tab--active');
      tabPaste.setAttribute('aria-selected', 'false');
      panelUpload.classList.remove('cvr-panel--hidden');
      panelPaste.classList.add('cvr-panel--hidden');
    }
  }

  tabPaste.addEventListener('click', () => switchTab('paste'));
  tabUpload.addEventListener('click', () => switchTab('upload'));

  // ── Character counter ──────────────────────────────────────────────────────
  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} character${len !== 1 ? 's' : ''}`;
    charHint.style.color = len >= 200 ? 'var(--teal)' : 'var(--gray)';
    charHint.textContent = len >= 200 ? '✓ Ready to analyze' : 'Minimum 200 characters';
  });

  // ── Demo prefill ───────────────────────────────────────────────────────────
  btnDemo.addEventListener('click', () => {
    switchTab('paste');
    textarea.value = DEMO_CV;
    textarea.dispatchEvent(new Event('input'));
    textarea.scrollTop = 0;
  });

  // ── File upload ────────────────────────────────────────────────────────────
  function handleFile(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['txt', 'pdf'].includes(ext)) {
      showError('Only .txt and .pdf files are supported.');
      return;
    }
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = e => {
        uploadedText = e.target.result;
        showFileInfo(file.name);
      };
      reader.readAsText(file);
    } else {
      // PDF: use PDF.js from CDN (lazy load)
      loadPdfJs().then(() => {
        const url = URL.createObjectURL(file);
        window.pdfjsLib.getDocument(url).promise.then(pdf => {
          const pages = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            pages.push(pdf.getPage(i).then(page => page.getTextContent()).then(tc => tc.items.map(it => it.str).join(' ')));
          }
          Promise.all(pages).then(texts => {
            uploadedText = texts.join('\n');
            showFileInfo(file.name);
            URL.revokeObjectURL(url);
          });
        });
      });
    }
  }

  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function showFileInfo(name) {
    fileName.textContent = name;
    fileInfo.classList.remove('cvr-hidden');
    dropZone.classList.add('cvr-dropzone--loaded');
  }

  fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });

  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('cvr-dropzone--drag'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('cvr-dropzone--drag'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('cvr-dropzone--drag');
    handleFile(e.dataTransfer.files[0]);
  });

  fileRemove.addEventListener('click', () => {
    uploadedText = '';
    fileInput.value = '';
    fileInfo.classList.add('cvr-hidden');
    dropZone.classList.remove('cvr-dropzone--loaded');
  });

  // ── Analyze ────────────────────────────────────────────────────────────────
  function showError(msg) {
    inputError.textContent = msg;
    inputError.classList.remove('cvr-hidden');
    setTimeout(() => inputError.classList.add('cvr-hidden'), 4000);
  }

  btnAnalyze.addEventListener('click', () => {
    inputError.classList.add('cvr-hidden');
    let text = currentMode === 'paste' ? textarea.value.trim() : uploadedText.trim();

    if (!text || text.length < 200) {
      showError(currentMode === 'paste'
        ? 'Please paste at least 200 characters of your CV before analyzing.'
        : 'Please upload a valid CV file with enough content.');
      return;
    }

    // Loading state
    btnAnalyze.disabled = true;
    btnAnalyze.innerHTML = `<span class="cvr-spinner"></span> Analyzing…`;

    // Small delay for UX
    setTimeout(() => {
      lastResult = analyzeCV(text);
      renderResults(lastResult);
      btnAnalyze.disabled = false;
      btnAnalyze.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Analyze My CV`;
    }, 800);
  });

  // ── Copy feedback ──────────────────────────────────────────────────────────
  btnCopy.addEventListener('click', () => {
    if (!lastResult) return;
    const text = buildFeedbackText(lastResult);
    navigator.clipboard.writeText(text).then(() => {
      btnCopy.textContent = '✓ Copied!';
      setTimeout(() => {
        btnCopy.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy Feedback`;
      }, 2000);
    });
  });

  // ── Print ──────────────────────────────────────────────────────────────────
  btnPrint.addEventListener('click', () => window.print());

  // ── Re-analyze ─────────────────────────────────────────────────────────────
  btnReanalyze.addEventListener('click', () => {
    document.getElementById('results-section').classList.add('cvr-hidden');
    document.getElementById('input-section').scrollIntoView({ behavior: 'smooth' });
  });

  // ── Gauge initial state ────────────────────────────────────────────────────
  const gaugeFill = document.getElementById('gauge-fill');
  gaugeFill.style.strokeDasharray  = CIRCUMFERENCE;
  gaugeFill.style.strokeDashoffset = CIRCUMFERENCE;
});
