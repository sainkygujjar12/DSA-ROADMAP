// A stored role or a client/JWT claim cannot grant another account access.
const OWNER_EMAIL = 'sainkygurjar12@gmail.com';
const isOwnerEmail = email => typeof email === 'string' && email.trim().toLowerCase() === OWNER_EMAIL;
const effectiveRole = user => user?.isVerified === true && isOwnerEmail(user.email) ? 'admin' : 'user';
module.exports = { OWNER_EMAIL, isOwnerEmail, effectiveRole };
