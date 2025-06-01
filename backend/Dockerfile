FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code (e.g., from 'backend/app' on host)
# to a directory named 'app' inside the WORKDIR (i.e., '/app/app' in container)
COPY ./app /app/app

EXPOSE 8000

# Command to run the application.
# Assumes your main.py is within the 'app' package copied above (i.e., /app/app/main.py)
# and the FastAPI instance is named 'app'.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]