# Webflow AI Layout Generator Plugin

A Webflow Designer plugin that generates webpage layouts using Claude Code API from text prompts or screenshots.

## Features

- **Text Prompt Generation**: Describe your desired layout in natural language
- **Screenshot Analysis**: Upload a screenshot and generate a similar layout
- **Webflow Integration**: Directly creates elements in your Webflow Designer
- **Responsive Design**: Generated layouts include responsive considerations
- **Secure API Key Storage**: API keys are stored locally in your browser

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Development Mode**
   ```bash
   npm run dev
   ```
   This starts a webpack dev server at `http://localhost:8080`

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Add to Webflow Designer**
   - Open Webflow Designer
   - Go to Apps Panel
   - Click "Add Custom App"
   - Use the development URL: `http://localhost:8080`
   - Or upload the built plugin files

## Usage

1. **Get Claude API Key**
   - Visit [console.anthropic.com](https://console.anthropic.com)
   - Create an account and generate an API key
   - Enter your API key in the plugin panel

2. **Generate Layout**
   - Choose between text prompt or screenshot input
   - For text: Describe your desired layout (e.g., "Create a hero section with navigation")
   - For screenshot: Upload an image of a layout you want to recreate
   - Click "Generate Layout"

3. **Review and Edit**
   - The generated layout will appear in your Webflow Designer
   - Edit elements, styles, and content as needed
   - Use Webflow's visual designer to refine the layout

## Example Prompts

- "Create a modern landing page with a hero section, features grid, and contact form"
- "Design a blog post layout with sidebar navigation"
- "Make a product showcase page with image gallery and pricing table"
- "Build a company about page with team member cards"

## API Integration

The plugin uses Claude 3.5 Sonnet model via Anthropic's API. Your API key is stored locally and never sent to our servers.

### API Requirements
- Valid Anthropic API key
- Internet connection for API calls
- Claude API rate limits apply

## File Structure

```
src/
├── main.js              # Main plugin entry point
├── claude-api.js        # Claude API integration
├── layout-generator.js  # Webflow element creation
└── styles.css          # Plugin UI styles
```

## Troubleshooting

**Plugin not loading:**
- Check that webpack dev server is running on port 8080
- Verify the manifest.json devModeUrl is correct

**API errors:**
- Verify your Claude API key is valid
- Check your API usage limits
- Ensure stable internet connection

**Layout not generating:**
- Try simpler prompts first
- Check browser console for errors
- Verify you have write permissions in Webflow

**Elements not creating properly:**
- Some complex layouts may need manual adjustment
- Use Webflow's designer to refine generated elements
- Check that the current page allows element creation

## Development

To extend the plugin:

1. **Add new UI components** in `main.js`
2. **Modify API calls** in `claude-api.js`
3. **Enhance layout generation** in `layout-generator.js`
4. **Update styles** in `styles.css`

## Security Notes

- API keys are stored in localStorage only
- No data is transmitted to third-party servers (except Claude API)
- Screenshots are processed client-side before API transmission
- Follow Anthropic's API usage guidelines

## Support

- Check Webflow's plugin documentation
- Review Claude API documentation
- File issues for bugs or feature requests