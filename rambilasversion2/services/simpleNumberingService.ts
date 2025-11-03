import { API_BASE_URL } from '../constants';

export interface SimpleNumberingConfig {
  _id: string;
  type: 'invoice' | 'consignment';
  startingNumber: number;
  currentNumber: number;
  prefix: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NumberingValidationResult {
  valid: boolean;
  message?: string;
}

class SimpleNumberingService {
  private configs: Map<string, SimpleNumberingConfig> = new Map();
  private isInitialized = false;

  /**
   * Initialize the numbering service by loading configurations
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.loadConfigs();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize numbering service:', error);
      this.initializeDefaultConfigs();
      this.isInitialized = true;
    }
  }

  /**
   * Load numbering configurations from the backend
   */
  async loadConfigs(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/numbering/configs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const configs = await response.json();
        this.configs.clear();
        configs.forEach((config: SimpleNumberingConfig) => {
          this.configs.set(config.type, config);
        });
      } else {
        throw new Error('Failed to load numbering configurations');
      }
    } catch (error) {
      console.error('Error loading numbering configs:', error);
      throw error;
    }
  }

  /**
   * Initialize with default configurations if backend is not available
   */
  private initializeDefaultConfigs(): void {
    this.configs.clear();
    
    // Default Invoice configuration
    this.configs.set('invoice', {
      _id: 'invoice-default',
      type: 'invoice',
      startingNumber: 1001,
      currentNumber: 1001,
      prefix: 'INV',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Default Consignment configuration
    this.configs.set('consignment', {
      _id: 'consignment-default',
      type: 'consignment',
      startingNumber: 5001,
      currentNumber: 5001,
      prefix: 'LR',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Get the next auto-generated number for a given type
   */
  async getNextNumber(type: 'invoice' | 'consignment'): Promise<number> {
    await this.initialize();
    
    const config = this.configs.get(type);
    if (!config) {
      throw new Error(`No numbering configuration found for ${type}`);
    }

    const nextNumber = config.currentNumber;

    // Update current number in backend
    try {
      await this.updateCurrentNumber(type, config.currentNumber + 1);
      config.currentNumber = config.currentNumber + 1;
    } catch (error) {
      console.error('Failed to update current number:', error);
      throw new Error('Failed to generate next number');
    }

    return nextNumber;
  }

  /**
   * Validate a manually entered number for uniqueness
   */
  async validateManualNumber(type: 'invoice' | 'consignment', number: number): Promise<NumberingValidationResult> {
    await this.initialize();
    
    const config = this.configs.get(type);
    if (!config) {
      return { valid: false, message: 'No numbering configuration found' };
    }

    // Check for duplicates
    const isDuplicate = await this.checkDuplicateNumber(type, number);
    if (isDuplicate) {
      return { 
        valid: false, 
        message: 'This number is already in use. Please enter a different number.'
      };
    }

    return { valid: true };
  }

  /**
   * Check if a number is already in use
   */
  private async checkDuplicateNumber(type: 'invoice' | 'consignment', number: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/numbering/check-duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type, number }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isDuplicate;
      }
    } catch (error) {
      console.error('Error checking duplicate number:', error);
    }
    
    return false;
  }

  /**
   * Update the current number in the backend
   */
  private async updateCurrentNumber(type: 'invoice' | 'consignment', newNumber: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/numbering/update-current`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ type, currentNumber: newNumber }),
    });

    if (!response.ok) {
      throw new Error('Failed to update current number');
    }
  }

  /**
   * Save a numbering configuration
   */
  async saveConfig(type: 'invoice' | 'consignment', startingNumber: number, prefix: string = ''): Promise<SimpleNumberingConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/numbering/configs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type, startingNumber, prefix }),
      });

      if (response.ok) {
        const savedConfig = await response.json();
        this.configs.set(type, savedConfig);
        return savedConfig;
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving numbering config:', error);
      throw error;
    }
  }

  /**
   * Get a specific configuration
   */
  getConfig(type: 'invoice' | 'consignment'): SimpleNumberingConfig | undefined {
    return this.configs.get(type);
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): SimpleNumberingConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Format a number according to the configuration
   */
  formatNumber(type: 'invoice' | 'consignment', number: number): string {
    const config = this.configs.get(type);
    if (!config) {
      return number.toString();
    }

    if (config.prefix) {
      return `${config.prefix}${number}`;
    }
    
    return number.toString();
  }
}

export const simpleNumberingService = new SimpleNumberingService();
