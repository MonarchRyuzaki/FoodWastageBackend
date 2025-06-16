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

## Benchmarking

### Setting up Benchmark Data

1. **Fetch Donation IDs**:
   ```bash
   cd benchmark
   node fetch-donation-ids.js
   ```
   This creates `donation-ids.txt` with existing donation IDs.

2. **Set Benchmark Mode**:
   ```bash
   export NODE_ENV=benchmark
   ```

### Running Benchmarks

#### 1. Benchmark Food Donation Creation
**Script**: `wrapper-create-donation.sh`
**Tests**: POST `/api/food-donations` endpoint
```bash
cd benchmark
chmod +x wrapper-create-donation.sh
./wrapper-create-donation.sh
```
**What it tests:**
- Creation of new food donations with multipart form data
- Authentication token validation
- MongoDB write performance
- SPARQL insert operations

**Results saved in**: `results_create/`

#### 2. Benchmark Get All Donations (Search)
**Script**: `wrapper-all-get.sh`  
**Tests**: GET `/api/food-donations` endpoint with geospatial search
```bash
cd benchmark
chmod +x wrapper-all-get.sh
./wrapper-all-get.sh
```
**What it tests:**
- Geospatial SPARQL queries with distance filtering
- MongoDB aggregation performance
- Pagination and sorting logic
- Food type and allergen filtering

**Results saved in**: `results_all_get/`

#### 3. Benchmark Get Donation Details
**Script**: `wrapper-get-details.sh`
**Tests**: GET `/api/food-donations/:id` endpoint
```bash
cd benchmark
chmod +x wrapper-get-details.sh
./wrapper-get-details.sh
```
**What it tests:**
- Single donation retrieval by ID
- Distance calculation between NGO and donation
- SPARQL geospatial distance queries
- MongoDB document lookup performance

**Results saved in**: `results_get_details/`

### Benchmark Configuration

Each benchmark script tests different connection levels:
- **8 connections**: Low load baseline
- **16 connections**: Medium load testing  
- **32 connections**: High load stress testing

**Test Duration**: 10 seconds per configuration
**Threads**: 8 concurrent threads

### Understanding Benchmark Scripts

#### Lua Scripts Used

1. **`create-donation.lua`**:
   - Generates realistic donation data with random food types, allergens, and coordinates
   - Uses pre-computed data arrays for performance
   - Includes multipart form data with fake image uploads
   - Rotates through 100 pre-generated requests for consistency

2. **`all-get.lua`**:
   - Tests geospatial search with random coordinates around major cities
   - Varies search distance (5-20km) and coordinates
   - Uses 50 pre-computed query variations
   - Tests pagination and filtering parameters

3. **`get-details.lua`**:
   - Loads real donation IDs from `donation-ids.txt`
   - Tests single donation lookup with distance calculation
   - Uses geographic jitter around major city coordinates
   - Validates ObjectId format before testing

### Benchmark Results

Results are saved in respective directories:
- `results_create/`: Creation endpoint results
- `results_all_get/`: Get all donations results  
- `results_get_details/`: Get details endpoint results

### Understanding Benchmark Output

```
Running 10s test @ http://localhost:5000
  8 threads and 8 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    27.09ms   12.57ms 146.69ms   76.31%
    Req/Sec    37.60     14.21    80.00     72.56%
  3013 requests in 10.04s, 0.94MB read
Requests/sec:    300.11
Transfer/sec:     96.13KB
```

Key metrics:
- **Requests/sec**: Throughput (higher is better)
- **Latency**: Response time (lower is better)
- **Thread Stats**: Performance consistency

### Benchmark Best Practices

1. **Before Running Benchmarks**:
   ```bash
   # Ensure you have test data
   node fetch-donation-ids.js
   
   # Set benchmark mode to disable logging
   export NODE_ENV=benchmark
   
   # Start your server
   npm run dev
   ```

2. **For Accurate Results**:
   - Close unnecessary applications
   - Run benchmarks multiple times
   - Allow server warm-up between tests
   - Monitor system resources during tests

3. **Interpreting Results**:
   - **Create Donation**: Expect 200-400 req/sec (write-heavy)
   - **Get All Donations**: Expect 300-500 req/sec (complex queries)
   - **Get Details**: Expect 100-150 req/sec (distance calculations)

### Performance Optimization Notes

- **Create Donation**: Optimized with parallel MongoDB/SPARQL operations
- **Search Donations**: Uses pagination and efficient SPARQL geospatial queries
- **Get Details**: Concurrent MongoDB and SPARQL distance calculations
- **Benchmark Mode**: Disables logging, image uploads, and validation for pure performance testing
