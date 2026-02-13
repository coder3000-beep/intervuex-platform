# Complete System Reset Instructions

## Step 1: Reset Database

### Option A: Using pgAdmin (Recommended)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on `intervuex` database
4. Select **Query Tool**
5. Open the file: `server/reset-database.sql`
6. Click **Execute** (F5)
7. You should see: "Database reset successfully!"

### Option B: Using Command Line
```bash
psql -U postgres -d intervuex -f server/reset-database.sql
```
(Enter password: sql1234 when prompted)

## Step 2: Clear Browser Data

1. Open your browser
2. Press **F12** to open Developer Tools
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Click **Local Storage** → `http://localhost:5173`
5. Click **Clear All** or delete `token` and `user` keys
6. Close Developer Tools

## Step 3: Restart Servers (if needed)

### If servers are running:
- They should auto-restart with nodemon
- No action needed

### If servers stopped:
```bash
# In project root
npm run dev
```

## Step 4: Fresh Start Testing

### 1. Register New Recruiter
```
1. Go to: http://localhost:5173/recruiter/register
2. Fill in:
   - Full Name: Test Recruiter
   - Email: recruiter@test.com
   - Password: test123
   - Company: Test Company
3. Click Register
4. You'll be auto-logged in
```

### 2. Add First Candidate
```
1. Click "Add Candidate"
2. Fill in:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: 1234567890
   - Resume: (optional - skip for now)
3. Click "Add Candidate"
4. Should see success message
```

### 3. Schedule Interview
```
1. Click "Schedule Interview" next to the candidate
2. Link will be generated and copied
3. Example: http://localhost:5173/interview/abc-123-xyz
```

### 4. Take Interview (as Candidate)
```
1. Open the interview link in NEW INCOGNITO window
2. Interview will start automatically
3. Answer questions
4. Submit each answer
5. Complete all questions
```

### 5. View Results
```
1. Go back to recruiter dashboard
2. Refresh page
3. See "All Interviews" section
4. Find completed interview
5. Click "View Report"
```

## Verification Checklist

After reset, verify these work:

- [ ] Can register new recruiter
- [ ] Can login
- [ ] Dashboard loads with 0 stats
- [ ] Can add candidate (without resume)
- [ ] Can add candidate (with resume)
- [ ] Can schedule interview
- [ ] Interview link is generated
- [ ] Candidate can access link
- [ ] Interview starts successfully
- [ ] Questions display
- [ ] Can submit answers
- [ ] Interview completes
- [ ] Dashboard shows completed interview
- [ ] Can view interview in "All Interviews"

## Common Issues After Reset

### Issue: "Failed to add candidate"
**Solution**: Make sure you registered a NEW recruiter after reset

### Issue: "Invalid or expired interview link"
**Solution**: Generate a NEW interview link after reset

### Issue: Dashboard shows old data
**Solution**: 
1. Logout
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again

### Issue: Can't login
**Solution**: Register a new account (old accounts were deleted)

## What Gets Reset

✅ **Deleted:**
- All recruiters
- All candidates  
- All interview sessions
- All scores
- All violations
- All audit logs

✅ **Preserved:**
- Database structure (tables, indexes)
- Server code
- Frontend code
- Configuration files

✅ **Requires New:**
- Recruiter registration
- Candidate addition
- Interview scheduling

## Quick Test Script

After reset, run this quick test:

```
1. Register: recruiter@test.com / test123
2. Add Candidate: John Doe / john@test.com / 1234567890
3. Schedule Interview → Copy link
4. Open link in incognito
5. Answer 1-2 questions
6. Check dashboard for updates
```

Expected result: Everything should work smoothly!

---

**Ready to start fresh? Follow Step 1 above!**
