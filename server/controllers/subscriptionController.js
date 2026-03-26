import { memoryStore } from '../services/memoryStore.js'

function nextRenewalDate(plan) {
  const d = new Date()
  d.setMonth(d.getMonth() + (plan === 'yearly' ? 12 : 1))
  return d
}

async function getStatus(req, res) {
  return res.json({
    subscription: {
      plan: req.user.subscriptionPlan || 'monthly',
      status: req.user.subscriptionStatus || 'inactive',
      renewalDate: req.user.subscriptionRenewalDate || null,
    },
  })
}

async function startSubscription(req, res) {
  const plan = req.body?.plan || 'monthly'
  if (!['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ message: 'Invalid plan' })
  }

  const renewalDate = nextRenewalDate(plan)

  if (memoryStore.enabled) {
    const updated = memoryStore.updateSubscription(req.user._id, {
      plan,
      status: 'active',
      renewalDate,
    })
    return res.json({ subscription: updated })
  }

  req.user.subscriptionPlan = plan
  req.user.subscriptionStatus = 'active'
  req.user.subscriptionRenewalDate = renewalDate
  await req.user.save()

  return res.json({
    subscription: {
      plan: req.user.subscriptionPlan,
      status: req.user.subscriptionStatus,
      renewalDate: req.user.subscriptionRenewalDate,
    },
  })
}

async function cancelSubscription(req, res) {
  if (memoryStore.enabled) {
    const updated = memoryStore.updateSubscription(req.user._id, {
      status: 'inactive',
    })
    return res.json({ subscription: updated })
  }

  req.user.subscriptionStatus = 'inactive'
  await req.user.save()

  return res.json({
    subscription: {
      plan: req.user.subscriptionPlan,
      status: req.user.subscriptionStatus,
      renewalDate: req.user.subscriptionRenewalDate,
    },
  })
}

async function renewSubscription(req, res) {
  const plan = req.body?.plan || req.user.subscriptionPlan || 'monthly'
  if (!['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ message: 'Invalid plan' })
  }

  const renewalDate = nextRenewalDate(plan)

  if (memoryStore.enabled) {
    const updated = memoryStore.updateSubscription(req.user._id, {
      plan,
      status: 'active',
      renewalDate,
    })
    return res.json({ subscription: updated })
  }

  req.user.subscriptionPlan = plan
  req.user.subscriptionStatus = 'active'
  req.user.subscriptionRenewalDate = renewalDate
  await req.user.save()

  return res.json({
    subscription: {
      plan: req.user.subscriptionPlan,
      status: req.user.subscriptionStatus,
      renewalDate: req.user.subscriptionRenewalDate,
    },
  })
}

export { getStatus, startSubscription, cancelSubscription, renewSubscription }
