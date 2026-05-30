const axios = require('axios');

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MAX_RETRIES = 3;
const OPENAI_RETRY_DELAY_MS = 500;
const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || 'google/flan-t5-small';
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_API_URL = process.env.GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_THINKING_BUDGET = Number.parseInt(process.env.GEMINI_THINKING_BUDGET ?? '0', 10);
const GEMINI_MAX_RETRIES = Number.parseInt(process.env.GEMINI_MAX_RETRIES ?? '3', 10);
const GEMINI_RETRY_DELAY_MS = Number.parseInt(process.env.GEMINI_RETRY_DELAY_MS ?? '500', 10);

class AITaskService {
  static getAIServiceError(error, action) {
    const status = error.response?.status;
    const provider = AI_PROVIDER;

    if (status === 401 || status === 403) {
      return `AI ${action} failed because the ${provider} credentials were rejected. Check your API key/token and AI_PROVIDER setting.`;
    }

    if (status === 429) {
      return `AI ${action} unavailable due to rate limit. Please try again shortly.`;
    }

    if ([500, 502, 503, 504].includes(status)) {
      return `AI ${action} unavailable because the ${provider} service is temporarily unavailable. Please try again shortly.`;
    }

    return null;
  }

  static isRetryableAIError(error) {
    return [429, 500, 502, 503, 504].includes(error.response?.status);
  }

  static async retryAIRequest(request, retryStatuses, maxRetries, retryDelayMs) {
    let attempt = 0;
    let delay = retryDelayMs;

    while (attempt < maxRetries) {
      try {
        return await request();
      } catch (error) {
        const status = error.response?.status;
        attempt += 1;

        if (!retryStatuses.includes(status) || attempt >= maxRetries) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    return request();
  }

  static extractJsonObject(text) {
    const cleaned = (text || '').replace(/```(?:json)?|```/gi, '').trim();
    if (!cleaned) return null;

    try {
      const parsed = JSON.parse(cleaned);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch (_) {}

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        const parsed = JSON.parse(cleaned.slice(start, end + 1));
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
      } catch (_) {}
    }

    return null;
  }

  static normalizeParsedTask(task, fallbackTitle = '') {
    const priority = (task.priority || 'medium').toString().toLowerCase().trim();

    return {
      ...task,
      title: (task.title || fallbackTitle).toString().trim(),
      description: (task.description || '').toString().trim(),
      category: (task.category || 'general').toString().trim(),
      priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      dueDate: task.dueDate || task.due_date || null
    };
  }

  static inferCategory(taskTitle = '', taskDescription = '') {
    const text = `${taskTitle} ${taskDescription}`.toLowerCase();
    if (/(launch|product|roadmap|feature|release|milestone)/.test(text)) return 'Product Management';
    if (/(campaign|marketing|social|email|brand|content|analytics)/.test(text)) return 'Marketing';
    if (/(bug|api|database|frontend|backend|deploy|code|security)/.test(text)) return 'Engineering';
    if (/(invoice|budget|finance|payment|revenue|cost)/.test(text)) return 'Finance';
    if (/(hire|interview|onboard|training|people)/.test(text)) return 'Operations';
    return 'general';
  }

  static inferPriority(taskTitle = '', taskDescription = '') {
    const text = `${taskTitle} ${taskDescription}`.toLowerCase();

    const highPriorityTerms = [
      'urgent',
      'critical',
      'blocker',
      'asap',
      'immediately',
      'emergency',
      'launch',
      'production',
      'deadline',
      'security',
      'outage'
    ];

    const lowPriorityTerms = [
      'someday',
      'nice to have',
      'nice-to-have',
      'optional',
      'minor',
      'low priority',
      'when possible',
      'backlog'
    ];

    if (highPriorityTerms.some((term) => text.includes(term))) return 'high';
    if (lowPriorityTerms.some((term) => text.includes(term))) return 'low';
    return 'medium';
  }

  static estimateTimeFallback(taskTitle = '', taskDescription = '') {
    const text = `${taskTitle} ${taskDescription}`.toLowerCase();
    let hours = 2;

    if (/(launch|campaign|project|integration|migration|release)/.test(text)) hours += 12;
    if (/(coordinate|analytics|timeline|milestones|stakeholders|materials)/.test(text)) hours += 8;
    if (/(urgent|critical|security|production|outage)/.test(text)) hours += 4;
    if (/(quick|minor|simple|small|update)/.test(text)) hours -= 1;

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    hours += Math.min(Math.floor(wordCount / 20) * 2, 12);

    return Math.min(Math.max(hours, 0.5), 160);
  }

  static parseNaturalLanguageFallback(input = '') {
    const cleaned = input.toString().trim();
    const withoutLeadingAction = cleaned.replace(/^(please\s+)?(create|add|plan|schedule|make|prepare|set up)\s+/i, '');
    const titleBase = withoutLeadingAction
      .split(/[.;\n]/)[0]
      .replace(/\s+(for|by|before|next|tomorrow|today)\b.*$/i, '')
      .trim();

    const dueDate = AITaskService.inferDueDate(cleaned);
    const title = titleBase || cleaned.slice(0, 100) || 'New Task';
    const priority = AITaskService.inferPriority(title, cleaned);
    const category = AITaskService.inferCategory(title, cleaned);

    return AITaskService.normalizeParsedTask({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description: cleaned,
      category,
      priority,
      dueDate
    }, cleaned);
  }

  static inferDueDate(input = '') {
    const text = input.toLowerCase();
    const now = new Date();
    const date = new Date(now);

    if (text.includes('tomorrow')) {
      date.setDate(date.getDate() + 1);
      return date.toISOString();
    }

    if (text.includes('next week')) {
      date.setDate(date.getDate() + 7);
      return date.toISOString();
    }

    if (text.includes('next month')) {
      date.setMonth(date.getMonth() + 1);
      return date.toISOString();
    }

    return null;
  }

  static breakDownTaskFallback(taskTitle = 'Task', taskDescription = '') {
    const text = `${taskTitle} ${taskDescription}`.toLowerCase();
    const isLaunch = /(launch|campaign|product|marketing|release)/.test(text);

    if (isLaunch) {
      return [
        {
          title: 'Define goals and success metrics',
          description: `Clarify the objective for "${taskTitle}", target audience, timeline, owners, and measurable success criteria.`
        },
        {
          title: 'Create the launch plan',
          description: 'Break the work into milestones, assign owners, identify dependencies, and confirm dates for each phase.'
        },
        {
          title: 'Prepare required assets',
          description: 'Create or gather copy, creative assets, documentation, landing pages, emails, and other materials needed for execution.'
        },
        {
          title: 'Execute and coordinate rollout',
          description: 'Publish deliverables, coordinate stakeholders, monitor progress, and resolve blockers during the rollout.'
        },
        {
          title: 'Review performance and next steps',
          description: 'Analyze outcomes, capture learnings, report results, and define follow-up actions.'
        }
      ];
    }

    return [
      {
        title: 'Clarify scope and outcome',
        description: `Define what "${taskTitle}" should accomplish and what done looks like.`
      },
      {
        title: 'List required work',
        description: 'Identify the main steps, dependencies, owners, and materials needed to complete the task.'
      },
      {
        title: 'Execute the core work',
        description: taskDescription || 'Complete the main implementation or coordination work.'
      },
      {
        title: 'Review and finalize',
        description: 'Check quality, resolve gaps, and document or communicate the result.'
      }
    ];
  }


  static formatHuggingFacePrompt(payload) {
    if (Array.isArray(payload.messages)) {
      return payload.messages
        .map((message) => {
          const role = message.role === 'system' ? 'System' : message.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${message.content}`;
        })
        .join('\n\n');
    }
    return payload.input || '';
  }

  static formatGeminiMessages(payload) {
    if (!Array.isArray(payload.messages)) return [];
    const systemMessages = payload.messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n');

    return payload.messages
      .filter((message) => message.role !== 'system')
      .map((message, index) => {
        const role = message.role === 'assistant' ? 'model' : 'user';
        const text = index === 0 && systemMessages
          ? `${systemMessages}\n\n${message.content}`
          : message.content;

        return {
          role,
          parts: [{ text }]
        };
      });
  }

  static formatGeminiPrompt(payload) {
    if (Array.isArray(payload.messages)) {
      return payload.messages
        .map((message) => {
          const role = message.role === 'system' ? 'System' : message.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${message.content}`;
        })
        .join('\n\n');
    }
    return payload.input || '';
  }

  static extractGeminiContent(data) {
    const candidate = data?.candidates?.[0];
    if (candidate) {
      if (typeof candidate.content === 'string') return candidate.content;
      if (Array.isArray(candidate.content)) {
        return candidate.content.map((item) => item.text || '').join('');
      }
      if (Array.isArray(candidate.content?.parts)) {
        return candidate.content.parts.map((part) => part.text || '').join('');
      }
      if (typeof candidate.output === 'string') return candidate.output;
    }

    if (typeof data?.output?.text === 'string') {
      return data.output.text;
    }

    const outputArray = Array.isArray(data?.output) ? data.output : [data?.output].filter(Boolean);
    for (const output of outputArray) {
      if (!output) continue;
      if (typeof output.text === 'string') return output.text;
      if (Array.isArray(output.content)) {
        const text = output.content.map((item) => item.text || '').join('');
        if (text) return text;
      }
    }

    if (typeof data?.text === 'string') return data.text;
    return undefined;
  }

  static async sendGeminiRequest(payload) {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Set GEMINI_API_KEY to use the Gemini provider.');
    }

    const body = {
      contents: AITaskService.formatGeminiMessages(payload),
      generationConfig: {
        temperature: payload.temperature ?? 0.7,
        topP: payload.top_p ?? 0.95,
        maxOutputTokens: payload.max_tokens || 512,
        candidateCount: 1,
        thinkingConfig: {
          thinkingBudget: Number.isNaN(GEMINI_THINKING_BUDGET) ? 0 : GEMINI_THINKING_BUDGET
        }
      }
    };

    if (payload.response_format?.type === 'json_object' || payload.response_format?.type === 'json_array') {
      body.generationConfig.responseMimeType = 'application/json';
    }

    const requestOptions = {
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const response = await AITaskService.retryAIRequest(
      () => axios.post(GEMINI_API_URL, body, requestOptions),
      [429, 500, 502, 503, 504],
      Number.isNaN(GEMINI_MAX_RETRIES) ? 3 : GEMINI_MAX_RETRIES,
      Number.isNaN(GEMINI_RETRY_DELAY_MS) ? 500 : GEMINI_RETRY_DELAY_MS
    );
    const content = AITaskService.extractGeminiContent(response.data);
    if (content) {
      return { data: { choices: [{ message: { content } }] } };
    }
    throw new Error('Unexpected Gemini response format.');
  }

  static async sendHuggingFaceRequest(payload) {
    if (!HUGGINGFACE_API_TOKEN) {
      throw new Error('Hugging Face API token not configured. Set HUGGINGFACE_API_TOKEN to use the free-tier provider.');
    }

    const prompt = AITaskService.formatHuggingFacePrompt(payload);
    const body = {
      inputs: prompt,
      parameters: {
        max_new_tokens: payload.max_tokens || 256,
        temperature: payload.temperature ?? 0.7,
        top_p: payload.top_p ?? 0.95,
        return_full_text: false
      },
      options: { wait_for_model: true }
    };

    const response = await axios.post(HUGGINGFACE_API_URL, body, {
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (typeof response.data === 'string') {
      return { data: { choices: [{ message: { content: response.data } }] } };
    }

    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      return { data: { choices: [{ message: { content: response.data[0].generated_text } }] } };
    }

    if (response.data.generated_text) {
      return { data: { choices: [{ message: { content: response.data.generated_text } }] } };
    }

    throw new Error('Unexpected Hugging Face response format.');
  }

  static async sendAIRequest(payload) {
    if (AI_PROVIDER === 'gemini') {
      return AITaskService.sendGeminiRequest(payload);
    }

    if (AI_PROVIDER === 'huggingface') {
      return AITaskService.sendHuggingFaceRequest(payload);
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY to use the OpenAI provider.');
    }

    let attempt = 0;
    let delay = OPENAI_RETRY_DELAY_MS;

    while (attempt < OPENAI_MAX_RETRIES) {
      try {
        return await axios.post(OPENAI_API_URL, payload, {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        const status = error.response?.status;
        if (status === 429) {
          attempt += 1;
          if (attempt >= OPENAI_MAX_RETRIES) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw error;
      }
    }
    throw new Error('OpenAI request failed after retries');
  }

  /**
   * Break down an epic task into subtasks
   */
  static async breakDownTask(taskTitle, taskDescription) {
    const extractJsonArray = (text) => {
      if (!text) return null;
      const cleaned = text.replace(/```json|```/gi, '').trim();
      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}

      const bracketMatch = cleaned.match(/\[[\s\S]*\]/);
      if (bracketMatch) {
        try {
          const parsed = JSON.parse(bracketMatch[0]);
          if (Array.isArray(parsed)) return parsed;
        } catch (_) {}
      }
      return null;
    };

    const parseBulletSubtasks = (text) => {
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const items = [];
      let current = null;

      for (const line of lines) {
        const bulletMatch = line.match(/^(?:[-*+]\s+|\d+[.)]\s+)(.+)$/);
        if (bulletMatch) {
          if (current) items.push(current);
          current = { title: bulletMatch[1].trim(), description: '' };
          continue;
        }

        if (line.toLowerCase().startsWith('title:')) {
          if (current) items.push(current);
          current = { title: line.split(/:/)[1].trim(), description: '' };
          continue;
        }

        if (line.toLowerCase().startsWith('description:') && current) {
          current.description = line.split(/:/)[1].trim();
          continue;
        }

        if (current && line.length > 0) {
          current.description += (current.description ? ' ' : '') + line;
        }
      }

      if (current) items.push(current);
      return items.filter((item) => item.title && item.title.length > 0);
    };

    try {
      const response = await AITaskService.sendAIRequest({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project manager that breaks down complex tasks into actionable subtasks. Respond with only a valid JSON array. Do not include markdown, explanation, or any text outside the JSON array.'
          },
          {
            role: 'user',
            content: `Break down this task into 3-5 subtasks. Return a JSON array only. Each subtask must include title and description.\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}`
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: 'json_array' }
      });

      const content = (response.data.choices?.[0]?.message?.content || '').toString();
      let subtasks = extractJsonArray(content) || [];

      const normalizeSubtask = (subtask) => {
        if (typeof subtask === 'string') {
          return { title: subtask.trim(), description: '' };
        }
        if (typeof subtask === 'object' && subtask !== null) {
          const title = (subtask.title || subtask.name || subtask.task || subtask.summary || '').toString().trim();
          const description = (subtask.description || subtask.details || subtask.note || '').toString().trim();
          return title ? { title, description } : null;
        }
        return null;
      };

      if (!Array.isArray(subtasks) || subtasks.length === 0) {
        subtasks = parseBulletSubtasks(content);
      }

      subtasks = (subtasks || [])
        .map(normalizeSubtask)
        .filter((item) => item && item.title.length > 0)
        .slice(0, 5);

      if (subtasks.length === 0) {
        const lines = content
          .split(/\r?\n/)
          .map((line) => line.replace(/^\s*[-*\d\.\)]+\s*/, '').trim())
          .filter(Boolean);

        subtasks = lines
          .filter((line) => line.length > 5)
          .slice(0, 5)
          .map((line) => ({ title: line, description: '' }));
      }

      if (subtasks.length === 0) {
        subtasks = parseBulletSubtasks(content);
      }

      subtasks = (subtasks || [])
        .map(normalizeSubtask)
        .filter((item) => item && item.title.length > 0)
        .slice(0, 5);

      if (subtasks.length === 0) {
        const lines = content
          .split(/\r?\n/)
          .map((line) => line.replace(/^\s*[-*\d\.\)]+\s*/, '').trim())
          .filter(Boolean);

        subtasks = lines
          .filter((line) => line.length > 5)
          .slice(0, 5)
          .map((line) => ({ title: line, description: '' }));
      }

      if (subtasks.length === 0) {
        console.error('AI breakdown response could not be parsed into subtasks.', { content });
        throw new Error('AI breakdown failed: response could not be parsed into subtasks.');
      }

      return subtasks;
    } catch (error) {
      const serviceError = AITaskService.getAIServiceError(error, 'breakdown');
      if (serviceError) {
        if (AITaskService.isRetryableAIError(error)) {
          console.warn('AI breakdown unavailable, using local fallback:', error.message || error);
          return AITaskService.breakDownTaskFallback(taskTitle, taskDescription);
        }

        console.error('AI service error for breakdown:', error.message || error);
        throw new Error(serviceError);
      }
      console.error('Error breaking down task:', error.message || error);
      throw new Error('AI breakdown failed due to service error. Please try again.');
    }
  }

  /**
   * Suggest priority based on task description
   */
  static async suggestPriority(taskTitle, taskDescription) {
    try {
      const response = await AITaskService.sendAIRequest({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a task prioritization expert. Respond with exactly one word: low, medium, or high. No explanation, no extra text.'
          },
          {
            role: 'user',
            content: `What priority should this task have?\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}`
          }
        ],
        temperature: 0.0,
        max_tokens: 10
      });

      const priority = (response.data.choices?.[0]?.message?.content || '').toLowerCase().trim();
      if (!['low', 'medium', 'high'].includes(priority)) {
        console.error('AI priority suggestion returned invalid response:', { priority });
        throw new Error('AI priority suggestion failed: invalid response received.');
      }
      return priority;
    } catch (error) {
      const serviceError = AITaskService.getAIServiceError(error, 'priority suggestion');
      if (serviceError) {
        if (AITaskService.isRetryableAIError(error)) {
          const fallbackPriority = AITaskService.inferPriority(taskTitle, taskDescription);
          console.warn('AI priority suggestion unavailable, using local fallback:', error.message || error);
          return fallbackPriority;
        }

        console.error('AI service error for priority suggestion:', error.message || error);
        throw new Error(serviceError);
      }
      console.error('Error suggesting priority:', error.message || error);
      throw new Error('AI priority suggestion failed due to service error. Please try again.');
    }
  }

  /**
   * Estimate time to complete task
   */
  static async estimateTime(taskTitle, taskDescription) {
    try {
      const response = await AITaskService.sendAIRequest({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project time estimation expert. Respond with only a single number representing estimated hours. No explanation, no extra text.'
          },
          {
            role: 'user',
            content: `Estimate how many hours this task will take:\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}`
          }
        ],
        temperature: 0.0,
        max_tokens: 10
      });

      const content = (response.data.choices?.[0]?.message?.content || '').toString();
      const hours = parseFloat(content.trim());
      if (!isNaN(hours)) {
        return Math.min(Math.max(hours, 0.5), 160);
      }

      const m = content.match(/(\d+(?:\.\d+)?)/);
      if (m) {
        const parsed = parseFloat(m[0]);
        if (!isNaN(parsed)) return Math.min(Math.max(parsed, 0.5), 160);
      }

      console.error('AI time estimation returned invalid response:', { content });
      throw new Error('AI time estimation failed: invalid response received.');
    } catch (error) {
      const serviceError = AITaskService.getAIServiceError(error, 'time estimation');
      if (serviceError) {
        if (AITaskService.isRetryableAIError(error)) {
          const fallbackHours = AITaskService.estimateTimeFallback(taskTitle, taskDescription);
          console.warn('AI time estimation unavailable, using local fallback:', error.message || error);
          return fallbackHours;
        }

        console.error('AI service error for time estimation:', error.message || error);
        throw new Error(serviceError);
      }
      console.error('Error estimating time:', error.message || error);
      throw new Error('AI time estimation failed due to service error. Please try again.');
    }
  }

  /**
   * Parse natural language task creation
   */
  static async parseNaturalLanguage(naturalLanguageInput) {
    try {
      const response = await AITaskService.sendAIRequest({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a task parsing expert. Respond with only valid JSON, no explanation, no markdown. The JSON object must contain title, description, category, and priority.'
          },
          {
            role: 'user',
            content: `Parse this into a task:\n\n"${naturalLanguageInput}"\n\nRespond with ONLY a valid JSON object containing title, description, category, and priority.`
          }
        ],
        temperature: 0.0,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const content = (response.data.choices?.[0]?.message?.content || '').toString();
      const parsed = AITaskService.extractJsonObject(content);
      if (parsed) return AITaskService.normalizeParsedTask(parsed, naturalLanguageInput);

      // As a final fallback, try to recover simple key: value lines
      const obj = { title: '', description: '', category: 'general', priority: 'medium' };
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const m = line.match(/^title\s*[:=-]\s*(.+)$/i);
        if (m && !obj.title) obj.title = m[1].trim();
        const m2 = line.match(/^description\s*[:=-]\s*(.+)$/i);
        if (m2 && !obj.description) obj.description = m2[1].trim();
        const m3 = line.match(/^category\s*[:=-]\s*(.+)$/i);
        if (m3 && obj.category === 'general') obj.category = m3[1].trim();
        const m4 = line.match(/^priority\s*[:=-]\s*(.+)$/i);
        if (m4 && obj.priority === 'medium') {
          const p = m4[1].trim().toLowerCase();
          obj.priority = ['low', 'medium', 'high'].includes(p) ? p : 'medium';
        }
      }

      if (obj.title) return AITaskService.normalizeParsedTask(obj, naturalLanguageInput);
      console.error('AI natural language response could not be parsed:', { content: content.slice(0, 500) });
      throw new Error('Unable to parse AI response into JSON');
    } catch (error) {
      const serviceError = AITaskService.getAIServiceError(error, 'natural language parsing');
      if (serviceError) {
        if (AITaskService.isRetryableAIError(error)) {
          console.warn('AI natural language parsing unavailable, using local fallback:', error.message || error);
          return AITaskService.parseNaturalLanguageFallback(naturalLanguageInput);
        }

        console.error('AI service error for natural language parse:', error.message || error);
        throw new Error(serviceError);
      }
      console.error('Error parsing natural language:', error.message || error);
      throw new Error('AI natural language parsing failed. Please refine your input or try again.');
    }
  }

  /**
   * Generate smart task suggestions based on user history
   */
  static async generateTaskSuggestions(userTaskHistory) {
    try {
      const taskSummary = userTaskHistory.map(t => `${t.title} (${t.category})`).join(', ');
      
      const response = await AITaskService.sendAIRequest({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity assistant. Suggest 3 new tasks based on user patterns. Return ONLY a valid JSON array of task suggestions.'
          },
          {
            role: 'user',
            content: `Based on these tasks: ${taskSummary}\n\nSuggest 3 new related tasks. Respond with ONLY a valid JSON array with objects containing: title, description, category, priority.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const content = (response.data.choices?.[0]?.message?.content || '').toString();
      const suggestions = JSON.parse(content);
      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error.message || error);
      return [];
    }
  }
}

module.exports = AITaskService;
