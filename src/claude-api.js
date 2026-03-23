import axios from 'axios';

export class ClaudeAPI {
  constructor() {
    this.baseURL = 'https://api.anthropic.com/v1';
  }

  async generateLayout(prompt, image = null, apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    try {
      const messages = [];
      const content = [];

      if (image) {
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];

        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: base64Data
          }
        });
      }

      content.push({
        type: 'text',
        text: `${prompt}

Please generate a webpage layout that can be implemented in Webflow. Your response should include:

1. A semantic HTML structure using div elements with appropriate CSS classes
2. CSS styles that can be applied in Webflow's Designer
3. Use Webflow-friendly naming conventions (lowercase with hyphens)
4. Include responsive considerations
5. Structure the response as JSON with 'html' and 'css' properties

The HTML should use common webpage sections like:
- Header with navigation
- Hero section
- Content sections
- Footer

Make sure the layout is modern, clean, and follows current web design principles.`
      });

      messages.push({
        role: 'user',
        content: content
      });

      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: messages,
          system: "You are an expert web designer and developer who specializes in creating layouts for Webflow. Always respond with valid JSON containing 'html' and 'css' properties."
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          // Add CORS handling for hosted environment
          withCredentials: false,
          timeout: 30000
        }
      );

      const responseText = response.data.content[0].text;

      try {
        const layoutData = JSON.parse(responseText);
        return layoutData;
      } catch (jsonError) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }

        return {
          html: this.extractHTMLFromText(responseText),
          css: this.extractCSSFromText(responseText)
        };
      }

    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.data.error?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network error: Unable to reach Claude API');
      } else {
        throw new Error(`Error: ${error.message}`);
      }
    }
  }

  extractHTMLFromText(text) {
    const htmlMatch = text.match(/```html\n?([\s\S]*?)\n?```/);
    if (htmlMatch) {
      return htmlMatch[1].trim();
    }

    const divMatch = text.match(/(<div[\s\S]*<\/div>)/);
    if (divMatch) {
      return divMatch[1];
    }

    return '<div class="generated-layout"><p>Layout generated but HTML extraction failed</p></div>';
  }

  extractCSSFromText(text) {
    const cssMatch = text.match(/```css\n?([\s\S]*?)\n?```/);
    if (cssMatch) {
      return cssMatch[1].trim();
    }

    const styleMatch = text.match(/\.[\s\S]*?\{[\s\S]*?\}/g);
    if (styleMatch) {
      return styleMatch.join('\n\n');
    }

    return `
      .generated-layout {
        padding: 20px;
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
      }
    `;
  }
}