# AWS CUR Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A web application to upload, process, and visualize AWS Cost and Usage Report (CUR) Parquet files. Built with Next.js for the frontend and FastAPI (Python) for the backend, all containerized with Docker.

This tool helps you quickly get insights into your AWS service consumption directly from your daily CUR files, making it easier to estimate costs beyond the free tier and project expenses for scaling.

## Features

*   **Parquet File Upload:** Securely upload your AWS CUR `.parquet` files.
*   **Consumption Summary:** Generates a summarized report of service usage, including:
    *   Service Name (`product_product_name`)
    *   Service Code (`line_item_product_code`)
    *   Usage Type (`line_item_usage_type`)
    *   Usage Unit (`pricing_unit`)
    *   Total Consumed Amount (`line_item_usage_amount`)
*   **Responsive UI:** View reports удобнo on various devices.
*   **Dockerized:** Easy to set up and deploy using Docker and Docker Compose.

## Tech Stack

*   **Frontend:** [Next.js](https://nextjs.org/) (React framework)
*   **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python web framework)
    *   [Pandas](https://pandas.pydata.org/): For data manipulation
    *   [PyArrow](https://arrow.apache.org/docs/python/): For reading Parquet files
*   **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## Project Structure
```text
aws-cur-analyzer/
├── backend/            # FastAPI application
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/           # Next.js application
│   ├── components/
│   ├── pages/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml  # Docker Compose configuration
└── README.md
```
## Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)
*   An AWS Cost and Usage Report (CUR) configured to deliver files in Parquet format to an S3 bucket.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aws-cur-analyzer.git
    cd aws-cur-analyzer
    ```
    *(Replace `your-username` with your actual GitHub username)*

2.  **Build and run the application using Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    The first build might take a few minutes.

3.  **Access the application:**
    *   Frontend: Open your browser and navigate to `http://localhost:3000`
    *   Backend API (for direct testing, if needed): `http://localhost:8000/docs` for FastAPI Swagger UI.

4.  **Upload your CUR Parquet file:**
    Use the file upload interface on `http://localhost:3000` to select and process your `.parquet` file. The consumption report will be displayed on the page.

## Configuration

### Backend API URL for Frontend

The frontend needs to know the URL of the backend API. This is configured in `docker-compose.yml` using the `NEXT_PUBLIC_API_URL` environment variable for the `frontend` service:

```yaml
# docker-compose.yml
services:
  frontend:
    # ...
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000 # 'backend' is the service name in Docker Compose
    # ...
```
If you deploy the backend to a different URL, or run services independently during development, you'll need to adjust this. For local Next.js development (outside Docker), you can create a `frontend/.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Backend (FastAPI)

If you want to run the backend locally without Docker (e.g., for faster iteration):

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the FastAPI development server:
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

### Frontend (Next.js)

If you want to run the frontend locally without Docker:

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  Run the Next.js development server:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    The frontend will be available at `http://localhost:3000`.
    *   **Important:** Ensure your backend is running (either via Docker or locally on `http://localhost:8000`). If needed, create `frontend/.env.local` as mentioned in the "Configuration" section.

## How it Works

1.  The user uploads a `.parquet` file via the Next.js frontend.
2.  The file is sent to the FastAPI backend.
3.  The backend uses Pandas and PyArrow to read and process the Parquet file.
4.  It filters for relevant usage line items (e.g., `line_item_line_item_type` is `Usage`), groups by service, usage type, and pricing unit, and sums the usage amount.
5.  The processed data (a summary report) is returned as JSON to the frontend.
6.  The Next.js frontend displays the report in a table.

## License

Distributed under the MIT License. See `LICENSE` file for more information.
*(You will need to create a `LICENSE` file in your repository root and paste the MIT License text into it. You can find the MIT License text easily online, for example at [opensource.org/licenses/MIT](https://opensource.org/licenses/MIT))*
