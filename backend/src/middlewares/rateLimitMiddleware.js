const buckets = new Map();

const getClientIp = (req) => (
  req.ip
  || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
  || req.socket?.remoteAddress
  || 'unknown'
);

export const rateLimit = ({
  windowMs,
  max,
  message = 'Too many requests. Please try again later.',
  keyGenerator = getClientIp,
}) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      res.set('Retry-After', Math.ceil((bucket.resetAt - now) / 1000).toString());
      return res.status(429).json({ error: message });
    }

    return next();
  };
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

export const likeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many like actions. Please slow down and try again shortly.',
  keyGenerator: (req) => `like:${req.user?.id || getClientIp(req)}`,
});
