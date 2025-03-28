/**
 * Supabase Storage Implementation
 * 
 * This file implements the IStorage interface using Supabase as the backend.
 * It provides methods for CRUD operations on all application entities.
 */

import { IStorage } from './storage';
import { supabase } from './supabase';
import * as schema from '../shared/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as dbSchema from '../shared/schema';

/**
 * Supabase Storage Implementation
 * Implements the IStorage interface using Supabase as the backend
 */
export class SupabaseStorage implements IStorage {
  constructor() {
    // Initialize any resources or connections needed
    console.log('Initializing Supabase Storage adapter');
  }

  /**
   * ===============================
   * HELPER METHODS
   * ===============================
   */

  /**
   * Convert a date string to a Date object
   * @param dateStr Date string to convert
   * @returns Date object or null if the input is null or invalid
   */
  private parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return null;
    }
  }

  /**
   * Handle errors from Supabase operations
   * @param error Error object from Supabase
   * @param operation Name of the operation that failed
   * @param entity Name of the entity being operated on
   */
  private handleError(error: any, operation: string, entity: string): void {
    if (error) {
      console.error(`Error ${operation} ${entity}:`, error.message || error);
    }
  }

  /**
   * ===============================
   * USER RELATED METHODS
   * ===============================
   */

  /**
   * Get a user by ID
   * @param userId User ID to retrieve
   * @returns The user object or null if not found
   */
  async getUser(userId: number): Promise<schema.User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        this.handleError(error, 'fetching', 'user');
        return null;
      }
      
      return data as schema.User;
    } catch (error: any) {
      this.handleError(error, 'fetching', 'user');
      return null;
    }
  }

  /**
   * Get a user by email address
   * @param email Email address to search for
   * @returns The user object or null if not found
   */
  async getUserByEmail(email: string): Promise<schema.User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        this.handleError(error, 'fetching', 'user by email');
        return null;
      }
      
      return data as schema.User;
    } catch (error: any) {
      this.handleError(error, 'fetching', 'user by email');
      return null;
    }
  }

  /**
   * Create a new user
   * @param userData User data for the new user
   * @returns The created user object or null if creation failed
   */
  async createUser(userData: schema.InsertUser): Promise<schema.User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select('*')
        .single();
      
      if (error) {
        this.handleError(error, 'creating', 'user');
        return null;
      }
      
      return data as schema.User;
    } catch (error: any) {
      this.handleError(error, 'creating', 'user');
      return null;
    }
  }

  /**
   * Update a user's information
   * @param userId User ID to update
   * @param userData Updated user data
   * @returns The updated user object or null if update failed
   */
  async updateUser(userId: number, userData: Partial<schema.InsertUser>): Promise<schema.User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select('*')
        .single();
      
      if (error) {
        this.handleError(error, 'updating', 'user');
        return null;
      }
      
      return data as schema.User;
    } catch (error: any) {
      this.handleError(error, 'updating', 'user');
      return null;
    }
  }

  /**
   * Delete a user
   * @param userId User ID to delete
   * @returns true if deletion succeeded, false otherwise
   */
  async deleteUser(userId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        this.handleError(error, 'deleting', 'user');
        return false;
      }
      
      return true;
    } catch (error: any) {
      this.handleError(error, 'deleting', 'user');
      return false;
    }
  }

  /**
   * ===============================
   * FORUM RELATED METHODS
   * ===============================
   */
  
  /**
   * Get a forum by ID
   * @param forumId Forum ID to retrieve
   * @returns The forum object or null if not found
   */
  async getForum(forumId: number): Promise<schema.Forum | null> {
    try {
      const { data, error } = await supabase
        .from('forums')
        .select('*')
        .eq('id', forumId)
        .single();
      
      if (error) {
        this.handleError(error, 'fetching', 'forum');
        return null;
      }
      
      return data as schema.Forum;
    } catch (error: any) {
      this.handleError(error, 'fetching', 'forum');
      return null;
    }
  }

  /**
   * Get all forums
   * @returns Array of forum objects
   */
  async getAllForums(): Promise<schema.Forum[]> {
    try {
      const { data, error } = await supabase
        .from('forums')
        .select('*');
      
      if (error) {
        this.handleError(error, 'fetching', 'all forums');
        return [];
      }
      
      return data as schema.Forum[];
    } catch (error: any) {
      this.handleError(error, 'fetching', 'all forums');
      return [];
    }
  }

  /**
   * Create a new forum
   * @param forumData Forum data for the new forum
   * @returns The created forum object or null if creation failed
   */
  async createForum(forumData: schema.InsertForum): Promise<schema.Forum | null> {
    try {
      const { data, error } = await supabase
        .from('forums')
        .insert(forumData)
        .select('*')
        .single();
      
      if (error) {
        this.handleError(error, 'creating', 'forum');
        return null;
      }
      
      return data as schema.Forum;
    } catch (error: any) {
      this.handleError(error, 'creating', 'forum');
      return null;
    }
  }

  /**
   * Update a forum's information
   * @param forumId Forum ID to update
   * @param forumData Updated forum data
   * @returns The updated forum object or null if update failed
   */
  async updateForum(forumId: number, forumData: Partial<schema.InsertForum>): Promise<schema.Forum | null> {
    try {
      const { data, error } = await supabase
        .from('forums')
        .update(forumData)
        .eq('id', forumId)
        .select('*')
        .single();
      
      if (error) {
        this.handleError(error, 'updating', 'forum');
        return null;
      }
      
      return data as schema.Forum;
    } catch (error: any) {
      this.handleError(error, 'updating', 'forum');
      return null;
    }
  }

  /**
   * Delete a forum
   * @param forumId Forum ID to delete
   * @returns true if deletion succeeded, false otherwise
   */
  async deleteForum(forumId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forums')
        .delete()
        .eq('id', forumId);
      
      if (error) {
        this.handleError(error, 'deleting', 'forum');
        return false;
      }
      
      return true;
    } catch (error) {
      this.handleError(error, 'deleting', 'forum');
      return false;
    }
  }

  /**
   * ===============================
   * CATEGORY RELATED METHODS
   * ===============================
   */
  
  /**
   * Get a category by ID
   * @param categoryId Category ID to retrieve
   * @returns The category object or null if not found
   */
  async getCategory(categoryId: number): Promise<schema.Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      
      if (error) {
        this.handleError(error, 'fetching', 'category');
        return null;
      }
      
      return data as schema.Category;
    } catch (error: any) {
      this.handleError(error, 'fetching', 'category');
      return null;
    }
  }

  /**
   * Get all categories for a forum
   * @param forumId Forum ID to retrieve categories for
   * @returns Array of category objects
   */
  async getCategoriesByForum(forumId: number): Promise<schema.Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('forumId', forumId);
      
      if (error) {
        this.handleError(error, 'fetching', 'categories');
        return [];
      }
      
      return data as schema.Category[];
    } catch (error: any) {
      this.handleError(error, 'fetching', 'categories');
      return [];
    }
  }

  /**
   * Create a new category
   * @param categoryData Category data for the new category
   * @returns The created category object or null if creation failed
   */
  async createCategory(categoryData: schema.InsertCategory): Promise<schema.Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select('*')
        .single();
      
      if (error) {
        this.handleError(error, 'creating', 'category');
        return null;
      }
      
      return data as schema.Category;
    } catch (error: any) {
      this.handleError(error, 'creating', 'category');
      return null;
    }
  }

  /**
   * Update a category's information
   * @param categoryId Category ID to update
   * @param categoryData Updated category data
   * @returns The updated category object or null if update failed
   */
  async updateCategory(categoryId: number, categoryData: Partial<schema.InsertCategory>): Promise<schema.Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', categoryId)
        .select('*')
        .single();
      
      if (error) {
        this.handleError(error, 'updating', 'category');
        return null;
      }
      
      return data as schema.Category;
    } catch (error: any) {
      this.handleError(error, 'updating', 'category');
      return null;
    }
  }

  /**
   * Delete a category
   * @param categoryId Category ID to delete
   * @returns true if deletion succeeded, false otherwise
   */
  async deleteCategory(categoryId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) {
        this.handleError(error, 'deleting', 'category');
        return false;
      }
      
      return true;
    } catch (error) {
      this.handleError(error, 'deleting', 'category');
      return false;
    }
  }
  
  // Add other methods for the IStorage interface as needed
  // This implementation focuses on the core entities, but you'll need to implement
  // all methods from the IStorage interface for a complete implementation.
}