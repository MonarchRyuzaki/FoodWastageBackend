# Configuration
SCRIPT_NAME="create-all-get.lua"
BASE_URL="http://localhost:5000"
DURATION="10s"  # Increased duration for more stable results
THREADS=8
OUTPUT_DIR="results_all_get"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

# Array of connection counts to test
CONNECTIONS=(8 16 32)
# CONNECTIONS=(8 16 32)

echo "Starting load test for all get endpoint"
echo "Timestamp: $TIMESTAMP"
echo "Duration: $DURATION per test"
echo "Threads: $THREADS"
echo "Connections to test: ${CONNECTIONS[@]}"
echo "Results will be saved in: $OUTPUT_DIR"
echo "=================================="

# Run tests for each connection count
for conn in "${CONNECTIONS[@]}"; do
    echo "Testing with $conn connections..."
    
    # Output file for this specific test
    OUTPUT_FILE="$OUTPUT_DIR/all-get-c${conn}-d${DURATION}.txt"
    
    # Run wrk and save output
    wrk -t$THREADS -c$conn -d$DURATION -L -s $SCRIPT_NAME $BASE_URL > $OUTPUT_FILE 2>&1
    
    echo "  Completed. Results saved to $OUTPUT_FILE"
    
    # Longer delay between tests for server recovery
    sleep 3
done

echo "=================================="
echo "All tests completed!"
echo "Summary saved to: $SUMMARY_FILE"
echo "Individual results saved in: $OUTPUT_DIR/"
echo ""