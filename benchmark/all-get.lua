-- Pre-computed coordinates for realistic testing
local coordinates = {
  {40.7128, -74.0060},   -- New York
  {34.0522, -118.2437},  -- Los Angeles
  {41.8781, -87.6298},   -- Chicago
  {29.7604, -95.3698},   -- Houston
  {33.4484, -112.0740}   -- Phoenix
}

-- Pre-computed query variations for better performance
local query_variations = {}
for i = 1, 50 do
  local coord = coordinates[math.random(#coordinates)]
  local lat = coord[1] + (math.random() - 0.5) * 0.1
  local lng = coord[2] + (math.random() - 0.5) * 0.1
  local distance = math.random(5, 20)
  
  query_variations[i] = string.format(
    "/api/food-donations?lat=%.4f&long=%.4f&distance=%d",
    lat, lng, distance
  )
end

-- Counter for cycling through variations
local query_counter = 0

function setup(thread)
    local thread_num = tonumber(thread.id) or 1
    math.randomseed(os.time() + thread_num)
end

function request()
  -- Cycle through pre-computed queries for consistency
  query_counter = (query_counter % 50) + 1
  local path = query_variations[query_counter]
  
  return wrk.format("GET", path, {
    ["Accept"] = "application/json",
    ["Accept-Encoding"] = "gzip, deflate"
  })
end