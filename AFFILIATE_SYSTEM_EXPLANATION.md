# 🎯 Affiliate System - How It Works

## Your Question

**"If I allow free signup, does the user that next subscribes will be counted as an affiliate partner and have affiliate under him still?"**

Let me break this down:

---

## Scenario

1. **User A** (Affiliate) refers **User B** (New User)
2. **User B** signs up for **FREE**
3. **User B** later **subscribes** (pays)

### Question 1: Will User A still get credit? ✅ YES

**Answer: YES!** Here's why:

- When User B signs up (even free), we store `affiliate_id` in their profile
- This `affiliate_id` points to User A (the referrer)
- When User B subscribes later, we check their `affiliate_id`
- User A gets commission credit because the referral link was used at signup

**The affiliate relationship is established at SIGNUP, not at purchase.**

---

### Question 2: Can User B become an affiliate? 🤔 NEEDS SETUP

**Answer: This needs to be implemented!**

Currently, the system tracks:
- ✅ Who referred you (`affiliate_id` in your profile)
- ❌ Your own affiliate code (to refer others)

---

## What We Need to Add

### 1. Generate Affiliate Code for Each User

When a user signs up (free or paid), they should get:
- **Their own unique affiliate code** (e.g., `AFF-USER-12345`)
- **Affiliate link** (e.g., `https://app.humancatalystbeacon.com/signup?ref=AFF-USER-12345`)

### 2. Track Referrals

When someone uses their link:
- Store the referrer's affiliate code
- Link it to the new user's `affiliate_id`

### 3. Commission Rules

You decide:
- **Who can be an affiliate?**
  - Everyone (free users too)?
  - Only paid subscribers?
  - Only after first referral?

- **When do commissions get paid?**
  - Only when referred user subscribes?
  - Or also for free signups?

---

## Recommended Setup

### Option 1: Everyone Can Be Affiliate ✅ (Recommended)

**Flow:**
1. User signs up (free) → Gets affiliate code immediately
2. User shares link → Gets credit when someone signs up
3. When referred user subscribes → Commission earned

**Pros:**
- More referrals (everyone can share)
- Viral growth
- Simple to understand

### Option 2: Only Paid Users Can Be Affiliates

**Flow:**
1. User signs up (free) → No affiliate code yet
2. User subscribes → Gets affiliate code
3. User shares link → Gets credit when someone signs up
4. When referred user subscribes → Commission earned

**Pros:**
- Higher quality referrals (only committed users)
- Less spam

---

## Database Changes Needed

Add to `profiles` table:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS my_affiliate_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_be_affiliate BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_commissions_earned DECIMAL(10,2) DEFAULT 0;
```

---

## How It Would Work

### Signup Flow with Affiliate:

1. **User B clicks link:** `https://app.humancatalystbeacon.com/signup?ref=AFF-USER-A-123`
2. **User B signs up (free):**
   - Account created
   - `affiliate_id` = User A's ID
   - User B gets their own code: `AFF-USER-B-456`
3. **User B subscribes later:**
   - Commission created for User A
   - User A gets paid

### User B Can Now Refer Others:

1. **User B shares:** `https://app.humancatalystbeacon.com/signup?ref=AFF-USER-B-456`
2. **User C signs up:**
   - `affiliate_id` = User B's ID
   - User C gets their own code: `AFF-USER-C-789`
3. **User C subscribes:**
   - Commission created for User B
   - User B gets paid

---

## Summary

**Your Question:**
> "If I allow free signup, does the user that next subscribes will be counted as an affiliate partner and have affiliate under him still?"

**Answer:**

1. **Will the referrer (User A) get credit when User B subscribes?**
   - ✅ **YES** - The affiliate relationship is stored at signup, so User A gets commission when User B pays

2. **Can User B become an affiliate and refer others?**
   - ⚠️ **NEEDS IMPLEMENTATION** - We need to add:
     - Generate unique affiliate code per user
     - Track who uses whose code
     - Commission system for referrals

---

## Next Steps

Would you like me to:

1. **Add affiliate code generation** to the signup process?
2. **Create affiliate dashboard** to see referrals and commissions?
3. **Set up commission tracking** when referred users subscribe?
4. **Build referral link system** with tracking?

Let me know what you want to implement! 🚀

