import asyncio
import httpx
import sys
import subprocess
import time
import signal
import os

async def test_health():
    # Start the server as a subprocess
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload", "--log-level", "error"], 
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        # Wait for server to start
        await asyncio.sleep(3)
        async with httpx.AsyncClient() as client:
            response = await client.get("http://127.0.0.1:8000/health", timeout=10.0)
            print(f"Health endpoint status: {response.status_code}")
            print(f"Response: {response.text}")
            if response.status_code == 200:
                print("✅ Health endpoint works")
                return True
            else:
                print("❌ Health endpoint failed")
                return False
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        # Kill the server
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    import asyncio
    success = asyncio.run(test_health())
    sys.exit(0 if success else 1)