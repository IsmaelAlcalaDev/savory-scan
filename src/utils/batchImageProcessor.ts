
import { imageOptimizer } from './imageOptimizer';

interface ImageProcessingJob {
  id: string;
  originalUrl: string;
  context: 'dish' | 'restaurant' | 'gallery' | 'hero' | 'avatar';
  targetWidths: number[];
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedUrls?: {
    webp: Record<number, string>;
    avif: Record<number, string>;
    original: Record<number, string>;
  };
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

class BatchImageProcessor {
  private static instance: BatchImageProcessor;
  private processingQueue: ImageProcessingJob[] = [];
  private isProcessing = false;
  private maxConcurrent = 3;
  private activeJobs = 0;

  static getInstance(): BatchImageProcessor {
    if (!BatchImageProcessor.instance) {
      BatchImageProcessor.instance = new BatchImageProcessor();
    }
    return BatchImageProcessor.instance;
  }

  /**
   * Add images to processing queue
   */
  queueImageProcessing(
    urls: string[],
    context: ImageProcessingJob['context'],
    priority: ImageProcessingJob['priority'] = 'medium'
  ): string[] {
    const targetWidths = this.getTargetWidthsForContext(context);
    
    const jobs = urls.map(url => ({
      id: `${context}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalUrl: url,
      context,
      targetWidths,
      priority,
      status: 'pending' as const,
      createdAt: new Date()
    }));

    this.processingQueue.push(...jobs);
    this.sortQueueByPriority();
    
    if (!this.isProcessing) {
      this.startProcessing();
    }

    return jobs.map(job => job.id);
  }

  /**
   * Get target widths based on context
   */
  private getTargetWidthsForContext(context: string): number[] {
    const contextWidths = {
      dish: [320, 480, 640],
      restaurant: [400, 600, 800, 1200],
      gallery: [400, 800, 1200, 1600],
      hero: [800, 1200, 1600, 2000],
      avatar: [48, 64, 96, 128]
    };

    return contextWidths[context as keyof typeof contextWidths] || [400, 600, 800];
  }

  /**
   * Sort queue by priority
   */
  private sortQueueByPriority() {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    this.processingQueue.sort((a, b) => {
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Start processing queue
   */
  private async startProcessing() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('🖼️ Starting batch image processing...');

    while (this.processingQueue.some(job => job.status === 'pending') && this.activeJobs < this.maxConcurrent) {
      const job = this.processingQueue.find(j => j.status === 'pending');
      if (!job) break;

      this.processJob(job);
    }

    // Check if all jobs are done
    const allJobsDone = this.processingQueue.every(job => 
      job.status === 'completed' || job.status === 'failed'
    );

    if (allJobsDone) {
      this.isProcessing = false;
      console.log('✅ Batch image processing completed');
      this.reportProcessingStats();
    } else {
      // Check again after a delay
      setTimeout(() => this.startProcessing(), 1000);
    }
  }

  /**
   * Process individual job
   */
  private async processJob(job: ImageProcessingJob) {
    job.status = 'processing';
    this.activeJobs++;

    try {
      console.log(`🔄 Processing ${job.context} image: ${job.originalUrl}`);
      
      const processedUrls = {
        webp: {} as Record<number, string>,
        avif: {} as Record<number, string>,
        original: {} as Record<number, string>
      };

      // Process each target width
      for (const width of job.targetWidths) {
        const optimized = imageOptimizer.optimize(job.originalUrl, {
          width,
          context: job.context
        });

        processedUrls.webp[width] = optimized.webp;
        processedUrls.avif[width] = optimized.avif;
        processedUrls.original[width] = optimized.original;

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      job.processedUrls = processedUrls;
      job.status = 'completed';
      job.completedAt = new Date();
      
      console.log(`✅ Completed processing: ${job.originalUrl}`);

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      
      console.error(`❌ Failed to process ${job.originalUrl}:`, error);
    } finally {
      this.activeJobs--;
    }
  }

  /**
   * Get processing statistics
   */
  getProcessingStats() {
    const stats = {
      total: this.processingQueue.length,
      pending: this.processingQueue.filter(j => j.status === 'pending').length,
      processing: this.processingQueue.filter(j => j.status === 'processing').length,
      completed: this.processingQueue.filter(j => j.status === 'completed').length,
      failed: this.processingQueue.filter(j => j.status === 'failed').length,
      isProcessing: this.isProcessing,
      activeJobs: this.activeJobs
    };

    return stats;
  }

  /**
   * Report processing statistics
   */
  private reportProcessingStats() {
    const stats = this.getProcessingStats();
    
    console.log('📊 Image Processing Stats:', {
      '✅ Completed': stats.completed,
      '❌ Failed': stats.failed,
      '📈 Success Rate': `${((stats.completed / stats.total) * 100).toFixed(1)}%`,
      '⏱️ Total Jobs': stats.total
    });
  }

  /**
   * Get completed jobs with processed URLs
   */
  getCompletedJobs(): ImageProcessingJob[] {
    return this.processingQueue.filter(job => job.status === 'completed');
  }

  /**
   * Clear completed jobs from queue
   */
  clearCompletedJobs() {
    this.processingQueue = this.processingQueue.filter(job => 
      job.status !== 'completed' && job.status !== 'failed'
    );
  }

  /**
   * Process images from a typical restaurant/dish data structure
   */
  processRestaurantImages(restaurants: any[]): string[] {
    const imageUrls = restaurants
      .map(r => [r.cover_image_url, r.logo_url])
      .flat()
      .filter(Boolean);

    return this.queueImageProcessing(imageUrls, 'restaurant', 'high');
  }

  /**
   * Process images from dish data
   */
  processDishImages(dishes: any[]): string[] {
    const imageUrls = dishes
      .map(d => d.image_url)
      .filter(Boolean);

    return this.queueImageProcessing(imageUrls, 'dish', 'high');
  }
}

// Export singleton instance
export const batchImageProcessor = BatchImageProcessor.getInstance();

// Utility functions
export const processAllRestaurantImages = (restaurants: any[]) => {
  return batchImageProcessor.processRestaurantImages(restaurants);
};

export const processAllDishImages = (dishes: any[]) => {
  return batchImageProcessor.processDishImages(dishes);
};

export const getImageProcessingStats = () => {
  return batchImageProcessor.getProcessingStats();
};
