(function() {
  // Configuration options
  const defaultConfig = {
    formId: null,
    container: 'formai-lead-form',
    theme: 'light', // 'light', 'dark', 'auto'
    position: 'inline', // 'inline', 'popup', 'sticky'
    buttonText: 'Submit',
    showCloseButton: true,
    triggerSelector: null, // for popup forms
    triggerEvent: 'click', // 'click', 'scroll', 'exit'
    exitIntentSensitivity: 20,
    scrollPercentage: 50,
    delay: 0, // delay in ms before showing popup
    showOnce: false // show popup only once per session
  };

  // Get script attributes and merge with defaults
  function getConfig() {
    const script = document.currentScript || (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    
    const config = { ...defaultConfig };
    
    // Parse data attributes from script tag
    for (const key in defaultConfig) {
      const dataAttr = script.getAttribute(`data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      if (dataAttr !== null) {
        // Parse numbers and booleans
        if (typeof defaultConfig[key] === 'number') {
          config[key] = parseInt(dataAttr, 10);
        } else if (typeof defaultConfig[key] === 'boolean') {
          config[key] = dataAttr === 'true';
        } else {
          config[key] = dataAttr;
        }
      }
    }
    
    return config;
  }

  // Create styles for the lead form
  function createStyles(config) {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .formai-lead-form-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: ${config.theme === 'dark' ? '#e0e0e0' : '#333333'};
        max-width: 100%;
      }

      .formai-lead-form-wrapper {
        background: ${config.theme === 'dark' ? '#1e1e2e' : '#ffffff'};
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }
      
      .formai-lead-form-header {
        padding: 16px 20px;
        border-bottom: 1px solid ${config.theme === 'dark' ? '#2d2d3d' : '#f0f0f0'};
        position: relative;
      }
      
      .formai-lead-form-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .formai-lead-form-description {
        margin: 8px 0 0;
        font-size: 14px;
        color: ${config.theme === 'dark' ? '#b0b0b0' : '#666666'};
      }
      
      .formai-lead-form-close {
        position: absolute;
        right: 16px;
        top: 16px;
        width: 24px;
        height: 24px;
        opacity: 0.6;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .formai-lead-form-close:hover {
        opacity: 1;
      }

      .formai-lead-form-body {
        padding: 20px;
      }
      
      .formai-lead-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .formai-lead-form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .formai-lead-form-label {
        font-size: 14px;
        font-weight: 500;
      }
      
      .formai-lead-form-required {
        color: #e53e3e;
        margin-left: 4px;
      }
      
      .formai-lead-form-input,
      .formai-lead-form-textarea,
      .formai-lead-form-select {
        padding: 10px 12px;
        border: 1px solid ${config.theme === 'dark' ? '#2d2d3d' : '#e2e8f0'};
        border-radius: 6px;
        font-size: 14px;
        background: ${config.theme === 'dark' ? '#2d2d3d' : '#ffffff'};
        color: ${config.theme === 'dark' ? '#e0e0e0' : '#333333'};
        width: 100%;
        box-sizing: border-box;
      }
      
      .formai-lead-form-input:focus,
      .formai-lead-form-textarea:focus,
      .formai-lead-form-select:focus {
        outline: none;
        border-color: ${config.theme === 'dark' ? '#61dafb' : '#0070f3'};
        box-shadow: 0 0 0 2px ${config.theme === 'dark' ? 'rgba(97, 218, 251, 0.2)' : 'rgba(0, 112, 243, 0.2)'};
      }
      
      .formai-lead-form-textarea {
        min-height: 100px;
        resize: vertical;
      }

      .formai-lead-form-checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      
      .formai-lead-form-checkbox {
        margin-top: 3px;
      }
      
      .formai-lead-form-checkbox-label {
        font-size: 13px;
        line-height: 1.4;
      }
      
      .formai-lead-form-button {
        display: inline-block;
        padding: 10px 16px;
        background: ${config.theme === 'dark' ? '#61dafb' : '#0070f3'};
        color: #ffffff;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        transition: background 0.2s;
        cursor: pointer;
        border: none;
        text-align: center;
        line-height: 1.5;
      }
      
      .formai-lead-form-button:hover {
        background: ${config.theme === 'dark' ? '#4bc0f0' : '#0060df'};
      }
      
      .formai-lead-form-button:disabled {
        background: ${config.theme === 'dark' ? '#4c5c6e' : '#a0aec0'};
        cursor: not-allowed;
      }
      
      .formai-lead-form-error {
        font-size: 13px;
        color: #e53e3e;
        margin-top: 4px;
      }
      
      .formai-lead-form-success {
        padding: 20px;
        text-align: center;
      }
      
      .formai-lead-form-success-icon {
        width: 48px;
        height: 48px;
        margin: 0 auto 16px;
        border-radius: 50%;
        background: ${config.theme === 'dark' ? '#2d2d3d' : '#f0f9ff'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${config.theme === 'dark' ? '#61dafb' : '#0070f3'};
      }
      
      .formai-lead-form-success-message {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .formai-lead-form-success-description {
        font-size: 14px;
        color: ${config.theme === 'dark' ? '#b0b0b0' : '#666666'};
        margin-bottom: 20px;
      }
      
      /* Popup and sticky styles */
      .formai-lead-form-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
      }
      
      .formai-lead-form-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      
      .formai-lead-form-popup {
        width: 100%;
        max-width: 500px;
        margin: 20px;
        transform: translateY(20px);
        transition: transform 0.3s;
      }
      
      .formai-lead-form-overlay.active .formai-lead-form-popup {
        transform: translateY(0);
      }
      
      .formai-lead-form-sticky {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 100%;
        max-width: 400px;
        z-index: 99999;
        transform: translateY(120%);
        transition: transform 0.3s;
      }
      
      .formai-lead-form-sticky.active {
        transform: translateY(0);
      }
      
      /* Responsive styles */
      @media (max-width: 600px) {
        .formai-lead-form-popup {
          max-width: calc(100% - 40px);
        }
        
        .formai-lead-form-sticky {
          max-width: calc(100% - 40px);
          left: 20px;
          right: 20px;
        }
      }

      .formai-lead-form-loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: formai-spin 1s linear infinite;
        margin-right: 8px;
      }
      
      @keyframes formai-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Create form from field definitions
  function createFormContent(formData, config) {
    // Parse form fields from JSON
    const fields = formData.formFields ? JSON.parse(formData.formFields) : [];
    
    // Create form element
    const form = document.createElement('form');
    form.className = 'formai-lead-form';
    
    // Add fields
    fields.forEach(field => {
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'formai-lead-form-field';
      
      // Label
      const label = document.createElement('label');
      label.className = 'formai-lead-form-label';
      label.htmlFor = `formai-field-${field.id}`;
      label.textContent = field.label;
      
      // Required indicator
      if (field.required) {
        const requiredSpan = document.createElement('span');
        requiredSpan.className = 'formai-lead-form-required';
        requiredSpan.textContent = '*';
        label.appendChild(requiredSpan);
      }
      
      fieldContainer.appendChild(label);
      
      // Field input based on type
      switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'number':
          const input = document.createElement('input');
          input.type = field.type;
          input.id = `formai-field-${field.id}`;
          input.name = field.name;
          input.className = 'formai-lead-form-input';
          input.placeholder = field.placeholder || '';
          input.required = field.required;
          
          if (field.validation) {
            if (field.validation.min) input.min = field.validation.min;
            if (field.validation.max) input.max = field.validation.max;
            if (field.validation.pattern) input.pattern = field.validation.pattern;
          }
          
          fieldContainer.appendChild(input);
          break;
          
        case 'textarea':
          const textarea = document.createElement('textarea');
          textarea.id = `formai-field-${field.id}`;
          textarea.name = field.name;
          textarea.className = 'formai-lead-form-textarea';
          textarea.placeholder = field.placeholder || '';
          textarea.required = field.required;
          
          fieldContainer.appendChild(textarea);
          break;
          
        case 'select':
          const select = document.createElement('select');
          select.id = `formai-field-${field.id}`;
          select.name = field.name;
          select.className = 'formai-lead-form-select';
          select.required = field.required;
          
          // Add options
          if (field.options) {
            field.options.forEach(option => {
              const optionEl = document.createElement('option');
              optionEl.value = option.value;
              optionEl.textContent = option.label;
              select.appendChild(optionEl);
            });
          }
          
          fieldContainer.appendChild(select);
          break;
          
        case 'checkbox':
          const checkboxGroup = document.createElement('div');
          checkboxGroup.className = 'formai-lead-form-checkbox-group';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `formai-field-${field.id}`;
          checkbox.name = field.name;
          checkbox.className = 'formai-lead-form-checkbox';
          checkbox.required = field.required;
          
          const checkboxLabel = document.createElement('label');
          checkboxLabel.htmlFor = `formai-field-${field.id}`;
          checkboxLabel.className = 'formai-lead-form-checkbox-label';
          checkboxLabel.innerHTML = field.text || '';
          
          checkboxGroup.appendChild(checkbox);
          checkboxGroup.appendChild(checkboxLabel);
          
          // Replace label with just the field
          fieldContainer.innerHTML = '';
          fieldContainer.appendChild(checkboxGroup);
          break;
      }
      
      // Error message container
      const errorContainer = document.createElement('div');
      errorContainer.className = 'formai-lead-form-error';
      errorContainer.id = `formai-error-${field.id}`;
      errorContainer.style.display = 'none';
      
      fieldContainer.appendChild(errorContainer);
      
      form.appendChild(fieldContainer);
    });
    
    // Add submit button
    const buttonContainer = document.createElement('div');
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'formai-lead-form-button';
    submitButton.textContent = formData.submitButtonText || config.buttonText;
    
    buttonContainer.appendChild(submitButton);
    form.appendChild(buttonContainer);
    
    return form;
  }

  // Create success message
  function createSuccessMessage(formData) {
    const successContainer = document.createElement('div');
    successContainer.className = 'formai-lead-form-success';
    
    // Success icon
    const iconContainer = document.createElement('div');
    iconContainer.className = 'formai-lead-form-success-icon';
    iconContainer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    
    // Success message
    const message = document.createElement('div');
    message.className = 'formai-lead-form-success-message';
    message.textContent = formData.successTitle || 'Thank you!';
    
    // Success description
    const description = document.createElement('div');
    description.className = 'formai-lead-form-success-description';
    description.textContent = formData.successMessage || 'Your submission has been received.';
    
    successContainer.appendChild(iconContainer);
    successContainer.appendChild(message);
    successContainer.appendChild(description);
    
    // Add button if redirect URL is provided
    if (formData.redirectUrl) {
      const button = document.createElement('a');
      button.className = 'formai-lead-form-button';
      button.href = formData.redirectUrl;
      button.textContent = formData.redirectButtonText || 'Continue';
      
      successContainer.appendChild(button);
    }
    
    return successContainer;
  }

  // Handle form submission
  async function handleFormSubmit(form, formId, container) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Clear previous errors
      form.querySelectorAll('.formai-lead-form-error').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
      });
      
      // Disable the submit button and show loading
      const submitButton = form.querySelector('.formai-lead-form-button');
      const originalButtonText = submitButton.textContent;
      
      submitButton.disabled = true;
      const loadingIndicator = document.createElement('span');
      loadingIndicator.className = 'formai-lead-form-loading';
      submitButton.prepend(loadingIndicator);
      submitButton.textContent = ' Submitting...';
      
      // Collect form data
      const formData = new FormData(form);
      const formDataObj = {};
      
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      
      try {
        // Send form data to API
        const response = await fetch(`${window.location.protocol}//${window.location.host}/api/embed/lead-form-submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formId: formId,
            formData: formDataObj,
            // Add additional info
            referrer: document.referrer || window.location.href,
            userAgent: navigator.userAgent,
            ipAddress: '' // Will be captured on the server
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit form');
        }
        
        // Show success message
        const formElement = container.querySelector('.formai-lead-form');
        const formBody = container.querySelector('.formai-lead-form-body');
        
        // Replace form with success message
        formBody.innerHTML = '';
        formBody.appendChild(createSuccessMessage(data.form));
        
        // Track successful conversion
        trackFormView(formId, true);
        
      } catch (error) {
        console.error('ForumAI Lead Form Error:', error);
        
        // Show error message
        const generalError = document.createElement('div');
        generalError.className = 'formai-lead-form-error';
        generalError.textContent = error.message || 'Failed to submit form. Please try again.';
        generalError.style.display = 'block';
        generalError.style.marginBottom = '16px';
        
        form.prepend(generalError);
        
        // Reset button
        submitButton.disabled = false;
        loadingIndicator.remove();
        submitButton.textContent = originalButtonText;
      }
    });
  }

  // Handle popup triggers
  function setupPopupTriggers(config, overlay) {
    // Direct element click
    if (config.triggerSelector && config.triggerEvent === 'click') {
      const triggers = document.querySelectorAll(config.triggerSelector);
      
      triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          overlay.classList.add('active');
          trackFormView(config.formId, false);
        });
      });
    }
    
    // Exit intent
    if (config.triggerEvent === 'exit') {
      let showExitIntent = true;
      
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= config.exitIntentSensitivity && showExitIntent) {
          overlay.classList.add('active');
          showExitIntent = false;
          trackFormView(config.formId, false);
        }
      });
    }
    
    // Scroll percentage
    if (config.triggerEvent === 'scroll') {
      let showScrollTrigger = true;
      
      window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        if (scrolled >= config.scrollPercentage && showScrollTrigger) {
          overlay.classList.add('active');
          showScrollTrigger = false;
          trackFormView(config.formId, false);
        }
      });
    }
    
    // Delay trigger
    if (config.delay > 0) {
      setTimeout(() => {
        if (!config.showOnce || !sessionStorage.getItem(`formai-form-${config.formId}-shown`)) {
          overlay.classList.add('active');
          trackFormView(config.formId, false);
          
          if (config.showOnce) {
            sessionStorage.setItem(`formai-form-${config.formId}-shown`, 'true');
          }
        }
      }, config.delay);
    }
  }

  // Track form view
  async function trackFormView(formId, isConversion) {
    try {
      await fetch(`${window.location.protocol}//${window.location.host}/api/embed/track-form-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          isConversion,
          referrer: document.referrer || window.location.href,
          userAgent: navigator.userAgent
        }),
      });
    } catch (error) {
      console.error('Failed to track form view:', error);
    }
  }

  // Render the lead form
  async function renderLeadForm(config) {
    try {
      // Fetch form data from API
      const response = await fetch(`${window.location.protocol}//${window.location.host}/api/embed/lead-form/${config.formId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch form data');
      }
      
      const formData = await response.json();
      
      // Create container element
      let container;
      let overlay;
      
      if (config.position === 'inline') {
        // Inline form - use existing container or create one
        container = document.getElementById(config.container);
        if (!container) {
          container = document.createElement('div');
          container.id = config.container;
          document.currentScript.parentNode.insertBefore(container, document.currentScript.nextSibling);
        }
        
        container.className = 'formai-lead-form-container';
      } else {
        // Create overlay for popup and sticky forms
        overlay = document.createElement('div');
        overlay.className = 'formai-lead-form-overlay';
        
        // Close overlay on background click
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            overlay.classList.remove('active');
          }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
          }
        });
        
        // Create container inside overlay
        container = document.createElement('div');
        container.className = `formai-lead-form-container formai-lead-form-${config.position}`;
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Setup triggers for popup forms
        setupPopupTriggers(config, overlay);
      }
      
      // Create form wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'formai-lead-form-wrapper';
      
      // Header
      const header = document.createElement('div');
      header.className = 'formai-lead-form-header';
      
      const title = document.createElement('h2');
      title.className = 'formai-lead-form-title';
      title.textContent = formData.name;
      
      header.appendChild(title);
      
      // Description if available
      if (formData.description) {
        const description = document.createElement('p');
        description.className = 'formai-lead-form-description';
        description.textContent = formData.description;
        header.appendChild(description);
      }
      
      // Close button for popup forms
      if (config.position !== 'inline' && config.showCloseButton) {
        const closeButton = document.createElement('button');
        closeButton.className = 'formai-lead-form-close';
        closeButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
        
        closeButton.addEventListener('click', () => {
          overlay.classList.remove('active');
        });
        
        header.appendChild(closeButton);
      }
      
      wrapper.appendChild(header);
      
      // Form body
      const formBody = document.createElement('div');
      formBody.className = 'formai-lead-form-body';
      
      // Create form
      const form = createFormContent(formData, config);
      
      formBody.appendChild(form);
      wrapper.appendChild(formBody);
      
      // Append wrapper to container
      container.appendChild(wrapper);
      
      // Handle form submission
      handleFormSubmit(form, config.formId, container);
      
      // Track form view for inline forms
      if (config.position === 'inline') {
        trackFormView(config.formId, false);
      }
      
      return container;
    } catch (error) {
      console.error('ForumAI Lead Form Error:', error);
      
      // Show error message
      const container = document.getElementById(config.container);
      if (container) {
        container.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #e53e3e; border: 1px solid #feb2b2; border-radius: 8px; background: #fff5f5;">
            <p>Failed to load form. Please try again later.</p>
          </div>
        `;
      }
    }
  }

  // Initialize lead form
  function init() {
    const config = getConfig();
    
    if (!config.formId) {
      console.error('ForumAI Lead Form Error: formId is required');
      return;
    }
    
    createStyles(config);
    renderLeadForm(config);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();