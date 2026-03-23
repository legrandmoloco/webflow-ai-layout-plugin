import './styles.css';
import { ClaudeAPI } from './claude-api.js';
import { LayoutGenerator } from './layout-generator.js';

class AILayoutPlugin {
  constructor() {
    this.claudeAPI = new ClaudeAPI();
    this.layoutGenerator = new LayoutGenerator();
    this.isReady = false;
    this.init();
  }

  async init() {
    try {
      // Check if we're in an iframe (hosted environment)
      const isInIframe = window.self !== window.top;
      const isHosted = window.location.hostname.includes('webflow-ext.com') || isInIframe;

      if (isHosted) {
        console.log('Plugin running in hosted/iframe environment');
        // Set up iframe communication if needed
        this.setupIframeMessaging();
      }

      // Wait for webflow to be ready with more comprehensive check
      await this.waitForWebflowReady();

      if (typeof webflow === 'undefined') {
        throw new Error('Webflow API not available. Please make sure you are running this in Webflow Designer.');
      }

      // Subscribe to events
      webflow.subscribe('selectedelement', this.handleElementSelection.bind(this));

      this.createUI();
      this.isReady = true;

      console.log('Plugin initialized successfully');

    } catch (error) {
      console.error('Plugin initialization error:', error);
      this.showError('Failed to initialize plugin: ' + error.message);
    }
  }

  setupIframeMessaging() {
    // Handle potential iframe messaging needs
    window.addEventListener('message', (event) => {
      // Only accept messages from Webflow domains
      if (!event.origin.includes('webflow.com')) {
        return;
      }

      // Handle any iframe-specific messages if needed
      console.log('Received iframe message:', event.data);
    });
  }

  async waitForWebflowReady() {
    return new Promise((resolve) => {
      if (webflow && webflow.getCurrentPage) {
        resolve();
      } else {
        const checkReady = () => {
          if (webflow && webflow.getCurrentPage) {
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      }
    });
  }

  createUI() {
    const panel = document.createElement('div');
    panel.className = 'ai-layout-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>AI Layout Generator</h3>
      </div>
      <div class="panel-content">
        <div class="input-section">
          <div class="tab-buttons">
            <button id="prompt-tab" class="tab-button active">Text Prompt</button>
            <button id="screenshot-tab" class="tab-button">Screenshot</button>
          </div>

          <div id="prompt-input" class="input-area active">
            <label for="layout-prompt">Describe your layout:</label>
            <textarea
              id="layout-prompt"
              placeholder="E.g., Create a hero section with a large heading, subtitle, and call-to-action button"
              rows="4"
            ></textarea>
          </div>

          <div id="screenshot-input" class="input-area">
            <label for="screenshot-file">Upload screenshot:</label>
            <input type="file" id="screenshot-file" accept="image/*" />
            <div id="screenshot-preview"></div>
          </div>

          <div class="api-key-section">
            <label for="claude-api-key">Claude API Key:</label>
            <input
              type="password"
              id="claude-api-key"
              placeholder="Your Claude API key"
            />
            <small>Your API key is stored locally and never sent to our servers</small>
          </div>

          <button id="generate-layout" class="generate-button" disabled>
            Generate Layout
          </button>
        </div>

        <div id="status" class="status-section"></div>
      </div>
    `;

    this.setupEventListeners(panel);

    webflow.showPanel({
      title: 'AI Layout Generator',
      element: panel
    });
  }

  setupEventListeners(panel) {
    const promptTab = panel.querySelector('#prompt-tab');
    const screenshotTab = panel.querySelector('#screenshot-tab');
    const promptInput = panel.querySelector('#prompt-input');
    const screenshotInput = panel.querySelector('#screenshot-input');
    const generateButton = panel.querySelector('#generate-layout');
    const apiKeyInput = panel.querySelector('#claude-api-key');
    const layoutPrompt = panel.querySelector('#layout-prompt');
    const screenshotFile = panel.querySelector('#screenshot-file');

    promptTab.addEventListener('click', () => {
      promptTab.classList.add('active');
      screenshotTab.classList.remove('active');
      promptInput.classList.add('active');
      screenshotInput.classList.remove('active');
      this.updateGenerateButton();
    });

    screenshotTab.addEventListener('click', () => {
      screenshotTab.classList.add('active');
      promptTab.classList.remove('active');
      screenshotInput.classList.add('active');
      promptInput.classList.remove('active');
      this.updateGenerateButton();
    });

    screenshotFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleScreenshotUpload(file);
      }
      this.updateGenerateButton();
    });

    apiKeyInput.addEventListener('input', () => {
      localStorage.setItem('claude-api-key', apiKeyInput.value);
      this.updateGenerateButton();
    });

    layoutPrompt.addEventListener('input', () => {
      this.updateGenerateButton();
    });

    generateButton.addEventListener('click', () => {
      this.generateLayout();
    });

    const savedApiKey = localStorage.getItem('claude-api-key');
    if (savedApiKey) {
      apiKeyInput.value = savedApiKey;
      this.updateGenerateButton();
    }
  }

  updateGenerateButton() {
    const generateButton = document.querySelector('#generate-layout');
    const apiKey = document.querySelector('#claude-api-key').value;
    const promptTab = document.querySelector('#prompt-tab').classList.contains('active');
    const hasPrompt = document.querySelector('#layout-prompt').value.trim();
    const hasScreenshot = document.querySelector('#screenshot-file').files.length > 0;

    const canGenerate = apiKey && (
      (promptTab && hasPrompt) || (!promptTab && hasScreenshot)
    );

    generateButton.disabled = !canGenerate;
  }

  handleScreenshotUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.querySelector('#screenshot-preview');
      preview.innerHTML = `
        <img src="${e.target.result}" alt="Screenshot preview" style="max-width: 100%; height: auto; border-radius: 4px;">
      `;
      this.screenshotData = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async generateLayout() {
    const status = document.querySelector('#status');
    const generateButton = document.querySelector('#generate-layout');

    if (!this.isReady) {
      status.innerHTML = '<div class="error">Plugin not ready. Please wait...</div>';
      return;
    }

    try {
      generateButton.disabled = true;
      status.innerHTML = '<div class="loading">Generating layout...</div>';

      const apiKey = document.querySelector('#claude-api-key').value;
      const promptTab = document.querySelector('#prompt-tab').classList.contains('active');

      let prompt;
      let image = null;

      if (promptTab) {
        prompt = document.querySelector('#layout-prompt').value;
      } else {
        prompt = "Create a webpage layout based on this screenshot. Generate semantic HTML structure with appropriate CSS classes for Webflow.";
        image = this.screenshotData;
      }

      const layout = await this.claudeAPI.generateLayout(prompt, image, apiKey);

      status.innerHTML = '<div class="success">Layout generated successfully!</div>';

      await this.layoutGenerator.createLayout(layout);

    } catch (error) {
      status.innerHTML = `<div class="error">Error: ${error.message}</div>`;
      console.error('Layout generation error:', error);
    } finally {
      generateButton.disabled = false;
      this.updateGenerateButton();
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<div class="error">${message}</div>`;
    document.body.appendChild(errorDiv);
  }

  handleElementSelection(element) {
    console.log('Selected element:', element);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new AILayoutPlugin();
});