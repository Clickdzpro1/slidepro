import os
import uvicorn
import argparse
from api.main import app

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the FastAPI server")
    parser.add_argument(
        "--port", type=int, required=True, help="Port number to run the server on"
    )
    parser.add_argument(
        "--reload", type=str, default="false", help="Reload the server on code changes"
    )
    parser.add_argument(
        "--log-level",
        type=str,
        default="info",
        help="Uvicorn log level",
    )
    args = parser.parse_args()
    reload = args.reload == "true"
    # Vercel Functions require binding to 0.0.0.0 (not 127.0.0.1) so the
    # platform can route traffic to the container. When PORT env is set
    # (Vercel deployment), bind to 0.0.0.0; otherwise keep 127.0.0.1 for
    # local dev and the Docker image (nginx proxies on the same host).
    host = "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"

    uvicorn.run(
        "api.main:app",
        host=host,
        port=args.port,
        log_level=args.log_level,
        reload=reload,
    )
