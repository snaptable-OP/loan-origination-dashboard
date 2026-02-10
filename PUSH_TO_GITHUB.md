# Push Code to Your GitHub Repository

Your repository is already created at: https://github.com/snaptable-OP/loan-origination-dashboard.git

## Run These Commands

Open your terminal and run these commands one by one:

```bash
# Navigate to project directory
cd /Users/annieliang/loan-origination-dashboard

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Loan origination dashboard with webhook API"

# Add your GitHub repository as remote
git remote add origin https://github.com/snaptable-OP/loan-origination-dashboard.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## If You Get Authentication Errors

If you see authentication errors, you may need to:

### Option 1: Use GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Give it `repo` permissions
4. Copy the token
5. When prompted for password, paste the token instead

### Option 2: Use SSH (Recommended)
```bash
# Change remote to SSH
git remote set-url origin git@github.com:snaptable-OP/loan-origination-dashboard.git

# Then push
git push -u origin main
```

## Verify It Worked

After pushing, visit:
https://github.com/snaptable-OP/loan-origination-dashboard

You should see all your files there!

## Next Step: Deploy to Vercel

Once code is on GitHub, follow the Vercel deployment steps in `VERCEL_DEPLOYMENT.md`
