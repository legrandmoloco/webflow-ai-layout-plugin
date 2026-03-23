export class LayoutGenerator {
  constructor() {
    this.webflowAPI = webflow;
  }

  async createLayout(layoutData) {
    try {
      const { html, css } = layoutData;

      const currentPage = await this.webflowAPI.getCurrentPage();
      if (!currentPage) {
        throw new Error('No active page found');
      }

      const bodyElement = await this.webflowAPI.getBodyElement();
      if (!bodyElement) {
        throw new Error('Could not access page body');
      }

      this.addGlobalStyles(css);

      const layoutContainer = await this.createElementFromHTML(html, bodyElement);

      await this.webflowAPI.selectElement(layoutContainer);

      return layoutContainer;

    } catch (error) {
      console.error('Layout creation error:', error);
      throw new Error(`Failed to create layout: ${error.message}`);
    }
  }

  addGlobalStyles(css) {
    try {
      const existingStyle = document.getElementById('ai-generated-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      const styleElement = document.createElement('style');
      styleElement.id = 'ai-generated-styles';
      styleElement.textContent = css;
      document.head.appendChild(styleElement);

    } catch (error) {
      console.warn('Could not add global styles:', error);
    }
  }

  async createElementFromHTML(htmlString, parentElement) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${htmlString}</div>`, 'text/html');
      const parsedElement = doc.body.firstChild;

      return await this.createWebflowElements(parsedElement, parentElement);

    } catch (error) {
      console.error('HTML parsing error:', error);
      throw new Error('Failed to parse generated HTML');
    }
  }

  async createWebflowElements(domElement, webflowParent) {
    try {
      const tagName = domElement.tagName ? domElement.tagName.toLowerCase() : 'div';

      let webflowElement;

      switch (tagName) {
        case 'header':
        case 'nav':
        case 'main':
        case 'section':
        case 'article':
        case 'aside':
        case 'footer':
          webflowElement = await this.webflowAPI.createElement('Section', webflowParent);
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          webflowElement = await this.webflowAPI.createElement('Heading', webflowParent);
          break;
        case 'p':
          webflowElement = await this.webflowAPI.createElement('Paragraph', webflowParent);
          break;
        case 'a':
          webflowElement = await this.webflowAPI.createElement('Link', webflowParent);
          break;
        case 'img':
          webflowElement = await this.webflowAPI.createElement('Image', webflowParent);
          break;
        case 'button':
          webflowElement = await this.webflowAPI.createElement('Button', webflowParent);
          break;
        case 'form':
          webflowElement = await this.webflowAPI.createElement('Form', webflowParent);
          break;
        case 'input':
          webflowElement = await this.webflowAPI.createElement('Input', webflowParent);
          break;
        case 'textarea':
          webflowElement = await this.webflowAPI.createElement('Textarea', webflowParent);
          break;
        case 'ul':
        case 'ol':
          webflowElement = await this.webflowAPI.createElement('List', webflowParent);
          break;
        case 'li':
          webflowElement = await this.webflowAPI.createElement('ListItem', webflowParent);
          break;
        default:
          webflowElement = await this.webflowAPI.createElement('Div', webflowParent);
          break;
      }

      if (domElement.className) {
        await this.setElementClasses(webflowElement, domElement.className);
      }

      if (domElement.textContent && domElement.children.length === 0) {
        await this.webflowAPI.setTextContent(webflowElement, domElement.textContent.trim());
      }

      await this.setElementAttributes(webflowElement, domElement, tagName);

      for (const childNode of domElement.childNodes) {
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          await this.createWebflowElements(childNode, webflowElement);
        } else if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent.trim()) {
          const textDiv = await this.webflowAPI.createElement('Div', webflowElement);
          await this.webflowAPI.setTextContent(textDiv, childNode.textContent.trim());
        }
      }

      return webflowElement;

    } catch (error) {
      console.error('Error creating Webflow element:', error);
      const fallbackDiv = await this.webflowAPI.createElement('Div', webflowParent);
      await this.webflowAPI.setTextContent(fallbackDiv, 'Error creating element');
      return fallbackDiv;
    }
  }

  async setElementClasses(webflowElement, classNames) {
    try {
      const classes = classNames.split(' ').filter(cls => cls.trim());

      for (const className of classes) {
        const trimmedClass = className.trim();
        if (trimmedClass) {
          await this.webflowAPI.addClassToElement(webflowElement, trimmedClass);
        }
      }
    } catch (error) {
      console.warn('Could not set classes:', error);
    }
  }

  async setElementAttributes(webflowElement, domElement, tagName) {
    try {
      switch (tagName) {
        case 'img':
          if (domElement.src) {
            await this.webflowAPI.setElementAttribute(webflowElement, 'src', domElement.src);
          }
          if (domElement.alt) {
            await this.webflowAPI.setElementAttribute(webflowElement, 'alt', domElement.alt);
          }
          break;

        case 'a':
          if (domElement.href) {
            await this.webflowAPI.setElementAttribute(webflowElement, 'href', domElement.href);
          }
          if (domElement.target) {
            await this.webflowAPI.setElementAttribute(webflowElement, 'target', domElement.target);
          }
          break;

        case 'input':
          if (domElement.type) {
            await this.webflowAPI.setElementAttribute(webflowElement, 'type', domElement.type);
          }
          if (domElement.placeholder) {
            await this.webflowAPI.setElementAttribute(webflowElement, 'placeholder', domElement.placeholder);
          }
          if (domElement.name) {
            await this.webflowAPI.setElementAttribute(webflowElement, 'name', domElement.name);
          }
          break;

        case 'textarea':
          if (domElement.placeholder) {
            await this.webflowAPI.setElementAttribute(webflowElement, 'placeholder', domElement.placeholder);
          }
          if (domElement.name) {
            await this.webflowAPI.setElementAttribute(webflowElement, 'name', domElement.name);
          }
          break;
      }

      if (domElement.id) {
        await this.webflowAPI.setElementAttribute(webflowElement, 'id', domElement.id);
      }

    } catch (error) {
      console.warn('Could not set attributes:', error);
    }
  }

  async applyResponsiveStyles(element, styles) {
    try {
      const breakpoints = ['desktop', 'tablet', 'mobile'];

      for (const breakpoint of breakpoints) {
        if (styles[breakpoint]) {
          await this.webflowAPI.setElementStyles(element, styles[breakpoint], breakpoint);
        }
      }
    } catch (error) {
      console.warn('Could not apply responsive styles:', error);
    }
  }

  generateFallbackLayout() {
    return {
      html: `
        <div class="ai-generated-container">
          <header class="header">
            <h1 class="site-title">Your Website</h1>
            <nav class="navigation">
              <a href="#" class="nav-link">Home</a>
              <a href="#" class="nav-link">About</a>
              <a href="#" class="nav-link">Services</a>
              <a href="#" class="nav-link">Contact</a>
            </nav>
          </header>

          <main class="main-content">
            <section class="hero">
              <h2 class="hero-title">Welcome to Your Site</h2>
              <p class="hero-description">This is a fallback layout generated by the AI plugin.</p>
              <button class="cta-button">Get Started</button>
            </section>

            <section class="content-section">
              <h3 class="section-title">About Us</h3>
              <p class="section-text">Add your content here to customize this layout.</p>
            </section>
          </main>

          <footer class="footer">
            <p class="footer-text">&copy; 2024 Your Website. All rights reserved.</p>
          </footer>
        </div>
      `,
      css: `
        .ai-generated-container {
          max-width: 1200px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }

        .site-title {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }

        .navigation {
          display: flex;
          gap: 20px;
        }

        .nav-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
        }

        .hero {
          text-align: center;
          padding: 80px 20px;
          background-color: #f8f9fa;
        }

        .hero-title {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .hero-description {
          font-size: 18px;
          margin-bottom: 30px;
          color: #666;
        }

        .cta-button {
          background-color: #007bff;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }

        .content-section {
          padding: 60px 20px;
        }

        .section-title {
          font-size: 32px;
          margin-bottom: 20px;
        }

        .footer {
          background-color: #333;
          color: white;
          text-align: center;
          padding: 40px 20px;
        }
      `
    };
  }
}