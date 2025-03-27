/**
 * ForumAI Communication Helper Library
 * 
 * This library provides a simple interface for communicating with ForumAI embedded forums.
 * It includes event listeners, resize handlers, analytics tracking, and state management.
 * 
 * @version 1.0.0
 * @requires forum-embed.js or an iframe with a ForumAI forum
 */
(function() {
  'use strict';

  // Configuration defaults
  const defaultConfig = {
    debug: false,
    autoResize: true,
    trackEvents: true,
    embedId: null,
    frameId: null,
    origin: '*',
    trackingCallbacks: {},
    stateChangeCallbacks: {},
    navigationCallbacks: {},
    interactionCallbacks: {},
    customCallbacks: {},
  };

  // Store event listeners
  const eventListeners = {
    resize: [],
    navigate: [],
    track: [],
    load: [],
    unload: [],
    interaction: [],
    custom: [],
    stateChange: [],
  };

  // Main ForumAICommunication class
  class ForumAICommunication {
    constructor(config = {}) {
      this.config = { ...defaultConfig, ...config };
      this.isInitialized = false;
      this.currentState = {
        isLoaded: false,
        currentPath: '/',
        height: 0,
        viewMode: null,
        lastInteraction: null,
        embedId: this.config.embedId,
        frameId: this.config.frameId,
      };
      
      // Initialize the communication helper
      this.init();
    }

    /**
     * Initialize the communication helper
     * Sets up event listeners and initializes the state
     */
    init() {
      if (this.isInitialized) {
        return;
      }

      this._setupEventListeners();
      this.isInitialized = true;
      
      if (this.config.debug) {
        console.log('ForumAI Communication Helper initialized', this.config);
      }
    }

    /**
     * Set up event listeners for iframe communication
     * @private
     */
    _setupEventListeners() {
      // Listen for global formai: events dispatched by forum-embed.js
      window.addEventListener('formai:resized', (event) => this._handleResizeEvent(event.detail));
      window.addEventListener('formai:navigate', (event) => this._handleNavigateEvent(event.detail));
      window.addEventListener('formai:track', (event) => this._handleTrackEvent(event.detail));
      window.addEventListener('formai:loaded', (event) => this._handleLoadEvent(event.detail));
      window.addEventListener('formai:interaction', (event) => this._handleInteractionEvent(event.detail));
      window.addEventListener('formai:custom', (event) => this._handleCustomEvent(event.detail));
    }

    /**
     * Handle resize event from the embedded forum
     * @param {Object} detail Event details
     * @private
     */
    _handleResizeEvent(detail) {
      if (!this._isRelevantEvent(detail)) return;
      
      // Update current state
      this.currentState.height = detail.height;
      
      // Trigger event listeners
      this._triggerEventListeners('resize', detail);
      
      // Call resize callback if registered
      if (this.config.onResize && typeof this.config.onResize === 'function') {
        this.config.onResize(detail);
      }
      
      if (this.config.debug) {
        console.log('ForumAI resize event:', detail);
      }
    }

    /**
     * Handle navigation event from the embedded forum
     * @param {Object} detail Event details
     * @private
     */
    _handleNavigateEvent(detail) {
      if (!this._isRelevantEvent(detail)) return;
      
      // Update current state
      this.currentState.currentPath = detail.path;
      this.currentState.viewMode = this._determineViewMode(detail.path);
      
      // Trigger state change event
      this._triggerStateChangeEvent({
        type: 'navigation',
        oldValue: this.currentState.currentPath,
        newValue: detail.path
      });
      
      // Trigger event listeners
      this._triggerEventListeners('navigate', detail);
      
      // Call navigation callbacks
      if (this.config.onNavigate && typeof this.config.onNavigate === 'function') {
        this.config.onNavigate(detail);
      }
      
      // Call specific navigation callbacks
      const viewMode = this.currentState.viewMode;
      if (viewMode && this.config.navigationCallbacks[viewMode]) {
        this.config.navigationCallbacks[viewMode](detail);
      }
      
      if (this.config.debug) {
        console.log('ForumAI navigate event:', detail, 'View mode:', this.currentState.viewMode);
      }
    }

    /**
     * Handle tracking event from the embedded forum
     * @param {Object} detail Event details
     * @private
     */
    _handleTrackEvent(detail) {
      if (!this._isRelevantEvent(detail)) return;
      
      // Trigger event listeners
      this._triggerEventListeners('track', detail);
      
      // Call tracking callback if registered
      if (this.config.onTrack && typeof this.config.onTrack === 'function') {
        this.config.onTrack(detail);
      }
      
      // Call specific tracking callbacks based on category/action
      if (detail.category && detail.action && this.config.trackingCallbacks[`${detail.category}:${detail.action}`]) {
        this.config.trackingCallbacks[`${detail.category}:${detail.action}`](detail);
      } else if (detail.category && this.config.trackingCallbacks[detail.category]) {
        this.config.trackingCallbacks[detail.category](detail);
      } else if (detail.action && this.config.trackingCallbacks[detail.action]) {
        this.config.trackingCallbacks[detail.action](detail);
      }
      
      if (this.config.debug) {
        console.log('ForumAI tracking event:', detail);
      }
    }

    /**
     * Handle load event from the embedded forum
     * @param {Object} detail Event details
     * @private
     */
    _handleLoadEvent(detail) {
      if (!this._isRelevantEvent(detail)) return;
      
      // Update current state
      this.currentState.isLoaded = true;
      
      // Trigger state change event
      this._triggerStateChangeEvent({
        type: 'load',
        oldValue: false,
        newValue: true
      });
      
      // Trigger event listeners
      this._triggerEventListeners('load', detail);
      
      // Call load callback if registered
      if (this.config.onLoad && typeof this.config.onLoad === 'function') {
        this.config.onLoad(detail);
      }
      
      if (this.config.debug) {
        console.log('ForumAI load event:', detail);
      }
    }

    /**
     * Handle interaction event from the embedded forum
     * @param {Object} detail Event details
     * @private
     */
    _handleInteractionEvent(detail) {
      if (!this._isRelevantEvent(detail)) return;
      
      // Update current state
      this.currentState.lastInteraction = {
        action: detail.action,
        elementType: detail.elementType,
        elementId: detail.elementId,
        timestamp: new Date()
      };
      
      // Trigger event listeners
      this._triggerEventListeners('interaction', detail);
      
      // Call interaction callback if registered
      if (this.config.onInteraction && typeof this.config.onInteraction === 'function') {
        this.config.onInteraction(detail);
      }
      
      // Call specific interaction callbacks
      if (detail.action && this.config.interactionCallbacks[detail.action]) {
        this.config.interactionCallbacks[detail.action](detail);
      }
      
      if (this.config.debug) {
        console.log('ForumAI interaction event:', detail);
      }
    }

    /**
     * Handle custom event from the embedded forum
     * @param {Object} detail Event details
     * @private
     */
    _handleCustomEvent(detail) {
      if (!this._isRelevantEvent(detail)) return;
      
      // Trigger event listeners
      this._triggerEventListeners('custom', detail);
      
      // Call custom callback if registered
      if (this.config.onCustom && typeof this.config.onCustom === 'function') {
        this.config.onCustom(detail);
      }
      
      // Call specific custom callbacks based on event key
      if (detail.key && this.config.customCallbacks[detail.key]) {
        this.config.customCallbacks[detail.key](detail);
      }
      
      if (this.config.debug) {
        console.log('ForumAI custom event:', detail);
      }
    }

    /**
     * Trigger state change event
     * @param {Object} change State change details
     * @private
     */
    _triggerStateChangeEvent(change) {
      // Trigger general state change listeners
      this._triggerEventListeners('stateChange', {
        ...change,
        state: this.currentState
      });
      
      // Call state change callback if registered
      if (this.config.onStateChange && typeof this.config.onStateChange === 'function') {
        this.config.onStateChange(change, this.currentState);
      }
      
      // Call specific state change callbacks
      if (change.type && this.config.stateChangeCallbacks[change.type]) {
        this.config.stateChangeCallbacks[change.type](change, this.currentState);
      }
    }

    /**
     * Check if an event is relevant to this instance
     * @param {Object} detail Event details
     * @returns {boolean} Whether this event is relevant
     * @private
     */
    _isRelevantEvent(detail) {
      if (!detail) return false;
      
      // If no embedId is specified, consider all events relevant
      if (!this.config.embedId) return true;
      
      // Otherwise, check if the event embedId matches
      return detail.embedId === this.config.embedId;
    }

    /**
     * Determine the view mode based on the path
     * @param {string} path Current path
     * @returns {string} View mode
     * @private
     */
    _determineViewMode(path) {
      if (!path) return 'unknown';
      
      if (path === '/' || path === '') {
        return 'home';
      } else if (path.startsWith('/question/')) {
        return 'question';
      } else if (path.startsWith('/category/')) {
        return 'category';
      } else if (path.startsWith('/search')) {
        return 'search';
      } else if (path === '/categories') {
        return 'categories';
      } else if (path === '/ask') {
        return 'ask';
      }
      
      return 'unknown';
    }

    /**
     * Trigger registered event listeners
     * @param {string} eventType Event type
     * @param {Object} detail Event details
     * @private
     */
    _triggerEventListeners(eventType, detail) {
      if (!eventListeners[eventType]) return;
      
      eventListeners[eventType].forEach(listener => {
        try {
          listener(detail);
        } catch (error) {
          console.error(`Error in ForumAI ${eventType} event listener:`, error);
        }
      });
    }

    /**
     * Send a message to the embedded forum
     * @param {string} type Message type
     * @param {Object} data Message data
     */
    sendMessage(type, data = {}) {
      const iframe = this._getIframe();
      
      if (!iframe || !iframe.contentWindow) {
        console.error('ForumAI: Cannot send message - iframe not found');
        return false;
      }
      
      const message = {
        type,
        ...data,
        source: 'formai-parent'
      };
      
      try {
        iframe.contentWindow.postMessage(message, this.config.origin);
        
        if (this.config.debug) {
          console.log('ForumAI: Message sent', message);
        }
        
        return true;
      } catch (error) {
        console.error('ForumAI: Failed to send message', error);
        return false;
      }
    }

    /**
     * Get the iframe element
     * @returns {HTMLIFrameElement|null} The iframe element
     * @private
     */
    _getIframe() {
      if (this.config.frameId) {
        return document.getElementById(this.config.frameId);
      } else if (this.config.embedId) {
        const container = document.getElementById(this.config.embedId);
        return container ? container.querySelector('iframe') : null;
      }
      
      // Fallback to finding the first forum iframe
      return document.querySelector('iframe[src*="forum"]');
    }

    /**
     * Navigate to a specific path in the embedded forum
     * @param {string} path Path to navigate to
     * @returns {boolean} Whether the navigation was initiated
     */
    navigate(path) {
      return this.sendMessage('navigate', { path });
    }

    /**
     * Refresh the forum content
     * @returns {boolean} Whether the refresh was initiated
     */
    refresh() {
      return this.sendMessage('refresh');
    }

    /**
     * Scroll the forum to a specific element
     * @param {string} selector Element selector to scroll to
     * @returns {boolean} Whether the scroll was initiated
     */
    scrollTo(selector) {
      return this.sendMessage('scrollTo', { selector });
    }

    /**
     * Set a theme for the forum
     * @param {string} theme Theme name (light, dark, auto)
     * @returns {boolean} Whether the theme was set
     */
    setTheme(theme) {
      return this.sendMessage('setTheme', { theme });
    }

    /**
     * Search the forum
     * @param {string} query Search query
     * @returns {boolean} Whether the search was initiated
     */
    search(query) {
      return this.sendMessage('search', { query });
    }

    /**
     * Add an event listener
     * @param {string} eventType Event type
     * @param {Function} callback Event callback
     * @returns {Function} Function to remove the listener
     */
    on(eventType, callback) {
      if (!eventListeners[eventType]) {
        console.warn(`ForumAI: Unknown event type "${eventType}"`);
        return () => {};
      }
      
      eventListeners[eventType].push(callback);
      
      // Return function to remove the listener
      return () => this.off(eventType, callback);
    }

    /**
     * Remove an event listener
     * @param {string} eventType Event type
     * @param {Function} callback Event callback
     * @returns {boolean} Whether the listener was removed
     */
    off(eventType, callback) {
      if (!eventListeners[eventType]) {
        return false;
      }
      
      const index = eventListeners[eventType].indexOf(callback);
      if (index !== -1) {
        eventListeners[eventType].splice(index, 1);
        return true;
      }
      
      return false;
    }

    /**
     * Get the current state of the embedded forum
     * @returns {Object} Current state
     */
    getState() {
      return { ...this.currentState };
    }

    /**
     * Check if the forum is loaded
     * @returns {boolean} Whether the forum is loaded
     */
    isLoaded() {
      return this.currentState.isLoaded;
    }

    /**
     * Get the current path of the embedded forum
     * @returns {string} Current path
     */
    getCurrentPath() {
      return this.currentState.currentPath;
    }

    /**
     * Get the current view mode
     * @returns {string} Current view mode
     */
    getViewMode() {
      return this.currentState.viewMode;
    }
  }

  // Create global ForumAI object if it doesn't exist
  window.ForumAI = window.ForumAI || {};
  
  // Register the communication helper
  window.ForumAI.Communication = ForumAICommunication;
  
  // Helper function to create a communication instance
  window.ForumAI.initCommunication = function(config) {
    return new ForumAICommunication(config);
  };
})();