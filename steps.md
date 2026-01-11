# Initialize project
- npm init 

# Core dependencies
- npm i express dotenv cors cookie-parser bcrypt jsonwebtoken multer

# Dev dependencies
npm i -D nodemon prettier

# Config files
- New-Item .env 
- New-Item .gitignore 
- New-Item .prettierrc 
- New-Item .prettierignore

# Entry files
- New-Item app.js 
- New-Item constants.js 
- New-Item index.js 

# Folder structure
- mkdir public
- cd public
- mkdir temp
- cd..
# 
- mkdir src 
- cd src
- mkdir controllers,db,middlewares,models,routes,utils 
# 
- cd..
