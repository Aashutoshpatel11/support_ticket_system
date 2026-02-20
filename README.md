# Support Ticket System

## Project Overview
This project is a modern, full-stack Support Ticket System designed to efficiently manage, track, and categorize customer inquiries. The application provides a robust backend API built with Django and a dynamic, interactive frontend built with React. A key feature of this system is the integration of Generative AI to automatically classify the category and priority of incoming support tickets based on their natural language descriptions. The application is fully containerized using Docker to ensure seamless local development and deployment.

## Tech Stack
* **Backend**: Django, Django REST Framework (DRF), SQLite (default DB)
* **Frontend**: React, Vite
* **AI Integration**: LangChain, Google GenAI SDK (`langchain-google-genai`), Pydantic
* **Containerization**: Docker, Docker Compose

## Project Structure
    support_ticket_system/
    ├── Backend/
    │   ├── core/               # Main Django project configuration
    │   ├── tickets/            # Ticket application (models, views, llm_service)
    │   ├── manage.py
    │   ├── requirements.txt
    │   └── Dockerfile
    ├── Frontend/
    │   ├── public/
    │   ├── src/                # React components and API client
    │   ├── package.json
    │   ├── vite.config.js
    │   └── Dockerfile
    ├── docker-compose.yml
    └── README.md


## How to Run the Project

### With Docker (Recommended)
You can spin up the entire application stack using Docker Compose. Ensure Docker Desktop is running on your machine.
1. Navigate to the root directory containing the `docker-compose.yml`.
2. Ensure all required environment variables are correctly set in your `docker-compose.yml` file.
3. Run the following command:
       docker-compose up --build
4. Access the frontend at `http://localhost:5173` and the backend API at `http://localhost:8000`.


## LLM Usage

### Which Model Was Used
The project utilizes **Gemini 2.5 Flash** (`gemini-2.5-flash`) via the Google GenAI API.

### Why It Was Chosen
Gemini 2.5 Flash is highly optimized for fast, cost-effective reasoning and text classification tasks. By setting the `temperature=0`, the model provides deterministic, highly predictable responses, which is ideal for a strict routing system. 

### Where and How It's Integrated
* **Location**: The LLM logic is isolated within `Backend/tickets/llm_service.py`.
* **Execution**: It acts as an intelligent router triggered by a custom `/classify` POST endpoint in the `TicketViewSet`.
* **Structured Output**: The project uses LangChain's `PydanticOutputParser` combined with a Pydantic `BaseModel` (`TicketClassification`) to enforce that the LLM only ever returns specific literals for category (`billing`, `technical`, `account`, `general`) and priority (`low`, `medium`, `high`, `critical`).

## Design Decisions
1.  **Strict LLM Output Parsing**: Relying solely on prompt engineering can sometimes lead to inconsistent JSON formats. Integrating `PydanticOutputParser` ensures that the API will gracefully fall back or handle errors if the model hallucinates outside the permitted choices.
2.  **Database-Level Aggregation for Dashboard Stats**: The `/stats` endpoint computes system metrics (like open tickets, category breakdowns, and priorities) directly at the database level using Django's `Count`, `Min`, and `Q` objects instead of iterating through querysets in Python, drastically improving performance at scale.
3.  **Modular Service Abstraction**: The core LangChain code is kept out of `views.py` and decoupled into `llm_service.py`. This ensures the codebase follows the Single Responsibility Principle, making it easier to swap out LLM providers or models in the future.

## Development Notes
* **Known limitations**: Currently, the system uses SQLite, which is ideal for local development but may need to be migrated to PostgreSQL for production environments. 
* **Next Steps**: Implementation of user authentication (e.g., JWT) to separate Customer and Support Agent views, and adding comprehensive unit testing for the LLM parsing logic.