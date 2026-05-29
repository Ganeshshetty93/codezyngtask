const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

class AITaskService {
  /**
   * Break down an epic task into subtasks
   */
  static async breakDownTask(taskTitle, taskDescription) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a project manager that breaks down complex tasks into actionable subtasks. Return a JSON array of subtasks.'
            },
            {
              role: 'user',
              content: `Break down this task into 3-5 subtasks:\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}\n\nRespond with ONLY a valid JSON array of subtasks, each with "title" and "description" fields.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const subtasks = JSON.parse(content);
      return subtasks;
    } catch (error) {
      console.error('Error breaking down task:', error.message);
      return [];
    }
  }

  /**
   * Suggest priority based on task description
   */
  static async suggestPriority(taskTitle, taskDescription) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a task prioritization expert. Respond with ONLY one word: low, medium, or high.'
            },
            {
              role: 'user',
              content: `What priority should this task have?\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}`
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const priority = response.data.choices[0].message.content.toLowerCase().trim();
      return ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
    } catch (error) {
      console.error('Error suggesting priority:', error.message);
      return 'medium';
    }
  }

  /**
   * Estimate time to complete task
   */
  static async estimateTime(taskTitle, taskDescription) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a project time estimation expert. Respond with ONLY a number representing estimated hours (e.g., 2.5).'
            },
            {
              role: 'user',
              content: `Estimate how many hours this task will take:\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}`
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const hours = parseFloat(response.data.choices[0].message.content.trim());
      return isNaN(hours) ? 5 : Math.min(Math.max(hours, 0.5), 160); // Clamp between 0.5 and 160 hours
    } catch (error) {
      console.error('Error estimating time:', error.message);
      return 5; // Default 5 hours
    }
  }

  /**
   * Parse natural language task creation
   */
  static async parseNaturalLanguage(naturalLanguageInput) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a task parsing expert. Parse natural language into structured task data. Return ONLY valid JSON with fields: title, description, category, priority.'
            },
            {
              role: 'user',
              content: `Parse this into a task:\n\n"${naturalLanguageInput}"\n\nRespond with ONLY a valid JSON object with title, description, category, and priority fields.`
            }
          ],
          temperature: 0.5,
          max_tokens: 300
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const taskData = JSON.parse(content);
      return taskData;
    } catch (error) {
      console.error('Error parsing natural language:', error.message);
      return {
        title: naturalLanguageInput.substring(0, 100),
        description: naturalLanguageInput,
        category: 'general',
        priority: 'medium'
      };
    }
  }

  /**
   * Generate smart task suggestions based on user history
   */
  static async generateTaskSuggestions(userTaskHistory) {
    try {
      const taskSummary = userTaskHistory.map(t => `${t.title} (${t.category})`).join(', ');
      
      const response = await axios.post(
        OPENAI_API_URL,
        {
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
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const suggestions = JSON.parse(content);
      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error.message);
      return [];
    }
  }
}

module.exports = AITaskService;
