"""Debug wrapper — catches import/startup errors and exposes them via HTTP."""
import sys
import traceback
from fastapi import FastAPI

try:
    from api.main import app as real_app
    from contextlib import asynccontextmanager

    @asynccontextmanager
    async def safe_lifespan(app):
        try:
            from api.lifespan import app_lifespan
            async with app_lifespan(app):
                yield
        except Exception as e:
            print(f"LIFESPAN ERROR: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            app.state.lifespan_error = str(e)
            yield

    real_app.router.lifespan_context = safe_lifespan
    app = real_app

    @app.get("/debug/error")
    def debug_error():
        return {"lifespan_error": getattr(app.state, "lifespan_error", None)}

except Exception as e:
    error_msg = str(e)
    error_tb = traceback.format_exc()
    print(f"IMPORT ERROR: {error_msg}", file=sys.stderr)
    print(error_tb, file=sys.stderr)

    app = FastAPI()

    @app.get("/")
    def root():
        return {"status": "import_failed", "error": error_msg[:500]}

    @app.get("/debug/error")
    def debug_error():
        return {"import_error": error_msg, "traceback": error_tb[:2000]}

    @app.get("/api/v1/auth/status")
    def auth_status():
        return {"configured": False, "authenticated": False, "error": error_msg[:200]}
