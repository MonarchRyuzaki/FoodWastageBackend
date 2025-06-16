# Food Wastage Backend

A comprehensive backend system for managing food donations and reducing food waste using MongoDB, GraphDB (SPARQL), and Express.js.

## 🚀 Features

- **Food Donation Management**: Create, read, update, delete food donations
- **Geospatial Search**: Find donations within specified distance using SPARQL queries
- **Role-based Access**: Support for Donors, NGOs, and Admins
- **Claims System**: NGOs can claim donations with OTP verification
- **Email Notifications**: Automated emails for approvals, rejections, and claims
- **Image Upload**: Cloudinary integration for food images
- **Background Jobs**: Automatic expiry management for donations and claims

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- GraphDB Desktop (v10.0 or higher)
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MonarchRyuzaki/FoodWastageBackend
cd FoodWastageBackend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database
MONGODB_URL=mongodb://localhost:27017/foodwastage

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

### 3. MongoDB Setup

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   sudo systemctl start mongod  # Linux
   brew services start mongodb-community  # macOS
   ```
3. Create the database:
   ```bash
   mongosh
   use foodwastage
   ```

## 🗄️ GraphDB Setup

### Installing GraphDB Desktop

1. **Download GraphDB Desktop**

   - Visit [GraphDB Downloads](https://graphdb.ontotext.com/download/)
   - Download GraphDB Desktop (Free version is sufficient)
   - Install following the platform-specific instructions
2. **Start GraphDB Desktop**

   ```bash
   # Linux/macOS
   ./graphdb-desktop

   # Windows
   graphdb-desktop.exe
   ```
3. **Access GraphDB Workbench**

   - Open browser and go to `http://localhost:7200`
   - The GraphDB Workbench should load

### Creating Repository

1. **Create New Repository**

   - Go to "Setup" → "Repositories"
   - Click "Create new repository"
   - Choose "GraphDB Repository"
   - Repository ID: `FoodWastage`
   - Repository title: `Food Wastage Ontology`
   - Click "Create"
2. **Configure Repository**

   - Set ruleset to "OWL-Horst (optimized)"
   - Enable context index: Yes
   - Click "Create"

### Importing the Ontology

1. **Download the Ontology File**

   ```bash
   # Download the ontology from GitHub
   curl -o food-wastage-ontology.rdf https://raw.githubusercontent.com/MonarchRyuzaki/FoodWastageOntology/master/FoodWastageOntologyNew.rdf

   # Or use wget
   wget -O food-wastage-ontology.rdf https://raw.githubusercontent.com/MonarchRyuzaki/FoodWastageOntology/master/FoodWastageOntologyNew.rdf
   ```
   **Alternative**: You can also download directly from the browser:

   - Visit: https://github.com/MonarchRyuzaki/FoodWastageOntology/blob/master/FoodWastageOntologyNew.rdf
   - Click "Raw" button to view the raw file
   - Right-click and "Save As" → `food-wastage-ontology.rdf`
2. **Import via GraphDB Workbench**

   - Select your `FoodWastage` repository
   - Go to "Import" → "RDF"
   - Click "Upload RDF files" and select `food-wastage-ontology.rdf`
   - **Import Settings**:
     - Context: `<https://w3id.org/foodwaste/ontology>`
     - Format: `RDF/XML` (auto-detected)
     - Replace graph: `No` (for first import)
   - Click "Import"
3. **Verify Import**

   - Go to "Explore" → "Class relationships"
   - You should see classes like `FoodDonation`, `NGO`, `Donor`, etc.
   - Check "Graphs overview" to confirm the ontology context is loaded
