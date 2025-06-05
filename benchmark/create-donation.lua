-- Food types and allergens arrays
local food_types = {
  "BakedGoods", "Beverages", "CookedFood", "DairyProducts", "Diabetic_Sweets",
  "FreshProduce", "Grains_and_Cerals", "Meat", "Non_Diabetic_Sweets",
  "Processed_and_Packaged", "Sea_Food", "Snacks", "Spices_and_Condiments", "Staple_Foods"
}

local allergens = {
  "Crustacean_shellfish", "Eggs", "Fish", "Milk", "Sesame", "Soybeans", "Tree_Nuts", "Wheat"
}

-- Sample data arrays (moved to global scope)
local titles = {
  "Leftover Biriyani Donation", "Fresh Pasta Donation", "Surplus Bread Donation",
  "Extra Pizza Donation", "Leftover Curry Donation", "Fresh Salad Donation"
}

local descriptions = {
  "Freshly cooked food available for pickup",
  "Surplus food from restaurant", 
  "Extra food from catering event",
  "Leftover food from party"
}

local addresses = {
  "123 Culinary Ave", "456 Food Street", "789 Kitchen Lane", "321 Restaurant Blvd"
}

local cities = {"New York", "Los Angeles", "Chicago", "Houston", "Phoenix"}
local states = {"NY", "CA", "IL", "TX", "AZ"}

local coordinates = {
  {40.7128, -74.0060}, {34.0522, -118.2437}, {41.8781, -87.6298},
  {29.7604, -95.3698}, {33.4484, -112.0740}
}

-- Pre-computed combinations to reduce runtime calculations
local food_combinations = {
  "BakedGoods", "CookedFood,Meat", "FreshProduce,Grains_and_Cerals",
  "DairyProducts", "Snacks,Beverages"
}

local allergen_combinations = {
  "Eggs", "Milk,Wheat", "Fish", "Tree_Nuts", "Soybeans,Sesame"
}

-- Optimized random selection
local function fast_random(arr)
  return arr[math.random(#arr)]
end

-- Initialize random seed
math.randomseed(os.time())

-- Pre-generate some data to reduce computation during requests
local pre_generated_requests = {}
for i = 1, 100 do
  local coord = fast_random(coordinates)
  local lat = coord[1] + (math.random() - 0.5) * 0.05
  local lng = coord[2] + (math.random() - 0.5) * 0.05
  local expiry_date = os.date("!%Y-%m-%dT%H:%M:%SZ", os.time() + math.random(1, 7) * 24 * 3600)
  
  pre_generated_requests[i] = {
    title = fast_random(titles),
    description = fast_random(descriptions),
    type = fast_random(food_combinations),
    allergens = fast_random(allergen_combinations),
    quantity = tostring(math.random(5, 50)),
    address = fast_random(addresses),
    city = fast_random(cities),
    state = fast_random(states),
    latitude = tostring(lat),
    longitude = tostring(lng),
    expiryDate = expiry_date
  }
end

-- Counter for cycling through pre-generated requests
local request_counter = 0

function setup(thread)
  thread:set("id", thread.id)
  -- Convert thread.id to number for arithmetic operations
  local thread_num = tonumber(thread.id) or 1
  math.randomseed(os.time() + thread_num)
end

-- Optimized request function
request = function()
  -- Cycle through pre-generated requests for consistency and speed
  request_counter = (request_counter % 100) + 1
  local fields = pre_generated_requests[request_counter]
  
  -- Optimized boundary generation
  local boundary = "----WebKitFormBoundary123456789"
  
  -- Build form data more efficiently
  local form_parts = {}
  
  for key, value in pairs(fields) do
    table.insert(form_parts, "--" .. boundary .. "\r\n")
    table.insert(form_parts, "Content-Disposition: form-data; name=\"" .. key .. "\"\r\n\r\n")
    table.insert(form_parts, value .. "\r\n")
  end
  
  -- Add minimal fake file for benchmark mode
  table.insert(form_parts, "--" .. boundary .. "\r\n")
  table.insert(form_parts, "Content-Disposition: form-data; name=\"foodImage\"; filename=\"food.jpg\"\r\n")
  table.insert(form_parts, "Content-Type: image/jpeg\r\n\r\n")
  table.insert(form_parts, "FAKE_IMAGE_DATA\r\n") -- Minimal fake data
  table.insert(form_parts, "--" .. boundary .. "--\r\n")
  
  local body = table.concat(form_parts)
  
  return wrk.format("POST", "/api/food-donations", {
    ["Content-Type"] = "multipart/form-data; boundary=" .. boundary,
    ["Authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzJjOWQxNjVkMmVjNDc1NmNhYjJlZCIsIm5hbWUiOiJTaGl2YW0gR2FuZ3VseSIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJyb2xlIjoiRG9ub3IiLCJpYXQiOjE3NDkxMDg0NjksImV4cCI6MTc0OTE5NDg2OX0.OMJfsrTkZf6yQ5nfcdXyAxj8MaNmdeygt1B7DHxzeHc",
    ["Content-Length"] = tostring(string.len(body))
  }, body)
end