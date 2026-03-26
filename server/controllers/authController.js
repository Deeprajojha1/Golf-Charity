import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { setAuthCookie } from '../utils/generateToken.js'
import { memoryStore } from '../services/memoryStore.js'

function requireFields(body, fields) {
  for (const f of fields) {
    if (!body?.[f]) return f
  }
  return null
}

async function register(req, res) {
  const missing = requireFields(req.body, ['name', 'email', 'password'])
  if (missing) return res.status(400).json({ message: `Missing field: ${missing}` })

  const { name, email, password, charityId } = req.body
  const subscriptionPlan = req.body.subscriptionPlan || 'monthly'
  const charityContributionPercent = Number(req.body.charityContributionPercent || 10)
  const requestedRole = req.body.requestedRole === 'admin' ? 'admin' : 'subscriber'

  if (!['monthly', 'yearly'].includes(subscriptionPlan)) {
    return res.status(400).json({ message: 'Invalid subscription plan' })
  }

  if (
    !Number.isFinite(charityContributionPercent) ||
    charityContributionPercent < 10 ||
    charityContributionPercent > 100
  ) {
    return res
      .status(400)
      .json({ message: 'Charity contribution must be between 10 and 100 percent' })
  }

  const subscriptionRenewalDate = new Date()
  subscriptionRenewalDate.setMonth(
    subscriptionRenewalDate.getMonth() + (subscriptionPlan === 'yearly' ? 12 : 1),
  )

  if (memoryStore.enabled) {
    const user = await memoryStore.createUser({
      name,
      email,
      password,
      charityId,
      subscriptionPlan,
      charityContributionPercent,
      requestedRole,
    })
    setAuthCookie(res, user._id)
    return res.status(201).json({ user: memoryStore.safeUser(user) })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return res.status(400).json({ message: 'User already exists' })

  if (charityId && !mongoose.Types.ObjectId.isValid(charityId)) {
    return res.status(400).json({ message: 'Please select a valid charity' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const isFirstUser = (await User.countDocuments()) === 0
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    charityId: charityId || undefined,
    subscriptionPlan,
    subscriptionStatus: 'active',
    subscriptionRenewalDate,
    charityContributionPercent,
    requestedRole,
    isAdmin: isFirstUser,
  })

  setAuthCookie(res, user._id.toString())
  return res.status(201).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      charityId: user.charityId || null,
      charityContributionPercent: user.charityContributionPercent,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionRenewalDate: user.subscriptionRenewalDate,
      requestedRole: user.requestedRole,
      isAdmin: user.isAdmin,
    },
  })
}

async function login(req, res) {
  const missing = requireFields(req.body, ['email', 'password'])
  if (missing) return res.status(400).json({ message: `Missing field: ${missing}` })

  const { email, password } = req.body

  if (memoryStore.enabled) {
    const user = await memoryStore.authenticate(email, password)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    setAuthCookie(res, user._id)
    return res.json({ user: memoryStore.safeUser(user) })
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

  setAuthCookie(res, user._id.toString())
  return res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      charityId: user.charityId || null,
      charityContributionPercent: user.charityContributionPercent,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionRenewalDate: user.subscriptionRenewalDate,
      requestedRole: user.requestedRole,
      isAdmin: user.isAdmin,
    },
  })
}

async function me(req, res) {
  return res.json({ user: req.user })
}

async function logout(req, res) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
  })
  return res.json({ ok: true })
}

export { register, login, me, logout }
