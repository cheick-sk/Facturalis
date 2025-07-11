# HR Tool Project

This project is a modern and complete Human Resources Management (HRM) tool designed with a microservices architecture.

## Prerequisites

- Docker Desktop installed and running.

## Project Structure

```
/hr-tool
  ├── docker-compose.yml
  ├── frontend/        # React.js/Next.js Frontend
  ├── backend/         # Node.js (NestJS) Backend
  ├── api-gateway/     # Node.js (Express) API Gateway
  ├── db/              # PostgreSQL data (volume managed)
  └── redis/           # Redis (volume managed, if needed for cache persistence)
```

## Getting Started

1.  **Clone the repository (or ensure these files are in place).**

2.  **Navigate to the project root directory:**
    ```bash
    cd hr-tool
    ```

3.  **Build and run the application using Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    - The `--build` flag ensures that Docker images are built (or rebuilt if changes were made).
    - Services will start in attached mode, showing logs in the terminal. Press `Ctrl+C` to stop them.

4.  **To run in detached mode (in the background):**
    ```bash
    docker-compose up --build -d
    ```

5.  **Accessing the services:**
    *   **Frontend:** [http://localhost:3000](http://localhost:3000)
    *   **API Gateway:** [http://localhost:4000](http://localhost:4000) (e.g., `http://localhost:4000/info` or `http://localhost:4000/api/v1/` for backend routes)
    *   **Backend:** Not directly exposed. Accessed via the API Gateway.
    *   **PostgreSQL:** Accessible on port `5432` (e.g., for a database client).
    *   **Redis:** Accessible on port `6379`.

## Development

- **Hot Reloading:**
  - The `frontend` service (Next.js) is configured for hot reloading. Changes in `hr-tool/frontend/` should reflect automatically in your browser.
  - The `backend` service (NestJS) is configured to restart on changes when running with `npm run start:dev` (which is the default CMD in its Dockerfile via `npm run build` then `node dist/main`, for production it's `node dist/main`. For dev, you might want to change the CMD to `npm run start:dev`). The current Dockerfile CMD is set for a production-like build. For development hot-reload, the `docker-compose.yml` would need a volume mount for the source code and the CMD in the Dockerfile changed to `npm run start:dev`.
  - The `api-gateway` service (Node.js/Express) can be set up for hot-reloading using `nodemon` (included in devDependencies). Similar to the backend, this would require volume mounts in `docker-compose.yml` and changing the CMD to `npm run dev`.

- **Environment Variables:**
  - Configuration for each service (database connections, API keys, etc.) should be managed via environment variables. See `docker-compose.yml` for existing examples.
  - For local development, you can create `.env` files in each service's directory (e.g., `hr-tool/backend/.env`). Ensure these `.env` files are added to `.gitignore`.

## Stopping the Application

- If running in attached mode (`docker-compose up`), press `Ctrl+C`.
- If running in detached mode (`docker-compose up -d`), use:
  ```bash
  docker-compose down
  ```
  This will stop and remove the containers. To remove volumes as well (like `postgres_data`), use:
  ```bash
  docker-compose down -v
  ```

## Further Steps (as per initial prompt)

- Configure database migrations.
- Include test data.
- Set up distinct Docker profiles (dev, prod).
- Add a reverse proxy (Nginx/Traefik) for production.
- Configure monitoring (Prometheus/Grafana).
- Implement data backup systems.
- Complete API documentation (Swagger/OpenAPI).
- Write a deployment guide.Tool output for `create_file_with_block`:
