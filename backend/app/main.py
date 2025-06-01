from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware # Para permitir peticiones desde Next.js
from .processor import process_parquet_file

app = FastAPI()

# Configuración de CORS
# Permitir orígenes específicos en producción
origins = [
    "http://localhost:3000", # Para desarrollo local de Next.js
    # "https://tu-dominio-de-frontend.com" # Para producción
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-parquet/")
async def create_upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.parquet'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .parquet file.")

    contents = await file.read()
    report_data = process_parquet_file(contents)

    if "error" in report_data:
        raise HTTPException(status_code=500, detail=report_data["error"])
        
    return report_data

@app.get("/")
def read_root():
    return {"message": "AWS CUR Analyzer Backend is running."}