from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware # To allow requests from Next.js
from .processor import process_parquet_file
import os
from pathlib import Path

app = FastAPI()

# Security configuration
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 100 * 1024 * 1024))  # 100MB default
ALLOWED_EXTENSIONS = {'.parquet'}

def validate_file(file_contents: bytes, filename: str) -> None:
    """
    Validate uploaded file for security and format compliance.
    """
    # Validate file size
    if len(file_contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size allowed: {MAX_FILE_SIZE // (1024*1024)}MB"
        )

    # Validate file extension
    file_extension = Path(filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only {', '.join(ALLOWED_EXTENSIONS)} files are allowed"
        )

    # Validate minimum file size (empty files)
    if len(file_contents) < 100:  # Minimum bytes for a valid parquet file
        raise HTTPException(
            status_code=400,
            detail="File appears to be empty or corrupted"
        )

    # Basic parquet file signature check
    # Parquet files end with "PAR1" magic number
    if not file_contents.endswith(b'PAR1'):
        raise HTTPException(
            status_code=400,
            detail="Invalid parquet file format"
        )

# CORS configuration
# Allow specific origins in production
origins = [
    "http://localhost:3000", # For local Next.js development
    # "https://your-frontend-domain.com" # For production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,  # Security: disable credentials
    allow_methods=["POST"],   # Security: only allow POST
    allow_headers=["*"],
)

@app.post("/upload-parquet/")
async def create_upload_file(file: UploadFile = File(...)):
    # Validate filename exists
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Read file contents
    contents = await file.read()

    # Validate file security and format
    validate_file(contents, file.filename)

    # Process the validated file
    try:
        report_data = process_parquet_file(contents)

        if isinstance(report_data, dict) and "error" in report_data:
            raise HTTPException(status_code=500, detail=report_data["error"])

        return report_data

    except Exception as e:
        # Log the error for debugging (in production, use proper logging)
        print(f"Error processing file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error processing parquet file. Please ensure it's a valid AWS CUR file."
        )

@app.get("/")
def read_root():
    return {"message": "AWS CUR Analyzer Backend is running."}