function validateEnvironment(env = process.env) {
  if (env.MONGO_MAX_POOL_SIZE && (!/^\d+$/.test(env.MONGO_MAX_POOL_SIZE) || Number(env.MONGO_MAX_POOL_SIZE) < 1 || Number(env.MONGO_MAX_POOL_SIZE) > 100)) throw new Error('MONGO_MAX_POOL_SIZE must be between 1 and 100');
  if (env.EMAIL_PROVIDER && !['smtp', 'brevo'].includes(env.EMAIL_PROVIDER)) throw new Error('EMAIL_PROVIDER must be smtp or brevo');
  for (const key of ['PORT', 'EMAIL_PORT']) {
    if (env[key] && (!/^\d+$/.test(env[key]) || Number(env[key]) < 1 || Number(env[key]) > 65535)) throw new Error(`${key} must be a valid port`);
  }
  if (env.TRUST_PROXY_HOPS && !/^\d+$/.test(env.TRUST_PROXY_HOPS)) throw new Error('TRUST_PROXY_HOPS must be a nonnegative integer');
  if (!env.MONGO_URI) throw new Error('MONGO_URI is required');
  if (!env.JWT_SECRET || (env.JWT_SECRET.length < 32 || /replace-with|changeme/i.test(env.JWT_SECRET))) throw new Error('JWT_SECRET must contain at least 32 characters');
  if (env.NODE_ENV === 'production') {
    const emailKeys = env.EMAIL_PROVIDER === 'brevo' ? ['BREVO_API_KEY', 'EMAIL_FROM'] : ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
    for (const key of ['CLIENT_URL', ...emailKeys]) if (!env[key]?.trim()) throw new Error(`${key} is required in production`);
    if (env.EMAIL_PROVIDER === 'brevo' && !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(env.EMAIL_FROM)) throw new Error('EMAIL_FROM must be a verified sender email address');
    for (const origin of env.CLIENT_URL.split(',')) {
      const parsed = new URL(origin.trim());
      if (parsed.protocol !== 'https:' || parsed.origin !== origin.trim()) throw new Error('CLIENT_URL must contain HTTPS origins without paths');
    }
  }
}
module.exports = validateEnvironment;
