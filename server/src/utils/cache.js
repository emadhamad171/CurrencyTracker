const NodeCache = require('node-cache');
const config = require('../config/env');
const logger = require('./logger');

// Ensure CACHE_TTL has a fallback value
const CACHE_DEFAULT_TTL = 1800; // 30 minutes in seconds
const cacheTTL = config.CACHE_TTL || CACHE_DEFAULT_TTL;

// Create cache instance with proper configuration
const cache = new NodeCache({
  stdTTL: cacheTTL,
  checkperiod: Math.floor(cacheTTL * 0.2), // Check expired keys every 20% of TTL
  useClones: false, // Don't clone objects to save memory
  deleteOnExpire: true, // Automatically delete expired items
});

// Log cache events for debugging
cache.on('set', (key) => {
  logger.debug(`Cache set: ${key}`);
});

cache.on('del', (key) => {
  logger.debug(`Cache deleted: ${key}`);
});

cache.on('expired', (key) => {
  logger.debug(`Cache expired: ${key}`);
});

cache.on('flush', () => {
  logger.debug('Cache flushed');
});

// Wrapper for getting values with debug logging
const get = (key) => {
  try {
    const value = cache.get(key);
    if (value !== undefined) {
      logger.debug(`Cache hit: ${key}`);
      return value;
    } else {
      logger.debug(`Cache miss: ${key}`);
      return null; // Return null instead of undefined for consistency
    }
  } catch (error) {
    logger.error(`Cache get error for key ${key}: ${error.message}`);
    return null;
  }
};

// Wrapper for setting values with TTL support
const set = (key, value, ttl = cacheTTL) => {
  try {
    if (value === undefined || value === null) {
      logger.warn(`Attempted to cache undefined/null value for key: ${key}`);
      return false;
    }

    const success = cache.set(key, value, ttl);
    if (!success) {
      logger.warn(`Failed to set cache for key: ${key}`);
    }
    return success;
  } catch (error) {
    logger.error(`Cache set error for key ${key}: ${error.message}`);
    return false;
  }
};

// Explicit aliases with proper error handling
const getCachedData = (key) => {
  return get(key);
};

const cacheData = (key, value, ttl) => {
  return set(key, value, ttl);
};

// Delete single or multiple keys
const del = (key) => {
  try {
    const count = cache.del(key);
    logger.debug(`Deleted ${count} keys from cache`);
    return count;
  } catch (error) {
    logger.error(`Cache delete error for key ${key}: ${error.message}`);
    return 0;
  }
};

// Clear all cache
const flush = () => {
  try {
    cache.flushAll();
    logger.debug('Cache flushed completely');
    return true;
  } catch (error) {
    logger.error(`Cache flush error: ${error.message}`);
    return false;
  }
};

// Delete keys by pattern using regex
const delByPattern = (pattern) => {
  try {
    const keys = cache.keys();
    const regex = new RegExp(pattern);
    const matchedKeys = keys.filter((key) => regex.test(key));

    if (matchedKeys.length > 0) {
      logger.debug(
        `Deleting cache keys by pattern ${pattern}: ${matchedKeys.join(', ')}`,
      );
      return cache.del(matchedKeys);
    }
    return 0;
  } catch (error) {
    logger.error(`Cache delByPattern error: ${error.message}`);
    return 0;
  }
};

// Debug function to inspect cache content
const debugCache = () => {
  const keys = cache.keys();
  const stats = cache.getStats();
  logger.debug(`Cache stats: ${JSON.stringify(stats)}`);
  logger.debug(`Cache keys: ${keys.join(', ')}`);
  return { keys, stats };
};

module.exports = {
  get,
  set,
  del,
  flush,
  delByPattern,
  getCachedData,
  cacheData,
  debugCache, // Add this for troubleshooting
};
