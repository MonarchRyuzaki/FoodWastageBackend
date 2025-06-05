-- get-details-simple.lua

-- Load donation IDs (once, at parse-time)
local donation_ids = {}
do
  local file, err = io.open("donation-ids.txt", "r")
  if not file then
    error("Failed to open donation-ids.txt: " .. tostring(err))
  end

  for line in file:lines() do
    local trimmed = line:match("^%s*(.-)%s*$")
    if trimmed and trimmed:match("^[a-fA-F0-9]+$") and #trimmed == 24 then
      table.insert(donation_ids, trimmed)
    end
  end

  file:close()
  if #donation_ids == 0 then
    error("No valid donation IDs found in donation-ids.txt")
  end
end

-- Base coordinates for “jitter”
local bases = {
  {40.7128, -74.0060},   -- New York
  {34.0522, -118.2437},  -- Los Angeles
  {41.8781, -87.6298},   -- Chicago
  {29.7604, -95.3698},   -- Houston
  {33.4484, -112.0740},  -- Phoenix
}

-- Called once per thread: just seed its RNG
function setup(thread)
  -- If thread.id is nil, tonumber(thread.id) will be nil, so we default to 0
  local tid = tonumber(thread.id) or 0
  local seed = os.time() + tid
  math.randomseed(seed)
end

-- Called for every HTTP iteration
function request()
  -- Pick a random donation ID
  local random_id = donation_ids[ math.random(#donation_ids) ]

  -- Pick one of the base coords, then add a small ±0.05° jitter
  local base = bases[ math.random(#bases) ]
  local lat = base[1] + (math.random() - 0.5) * 0.1
  local lng = base[2] + (math.random() - 0.5) * 0.1

  -- Build the GET path
  local path = string.format(
    "/api/food-donations/%s?lat=%.4f&long=%.4f",
    random_id,
    lat,
    lng
  )

  return wrk.format("GET", path, {
    ["Accept"] = "application/json",
    ["Accept-Encoding"] = "gzip, deflate"
  })
end
